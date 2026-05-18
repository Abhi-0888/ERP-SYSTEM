import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    HttpException,
    HttpStatus,
    Request,
    Res,
} from '@nestjs/common';
import { FeeService } from './fee.service';
import { InvoiceService } from './invoice.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { UniversityIsolationGuard } from '../../common/guards/university-isolation.guard';
import { CreateFeeDto, UpdateFeeDto, RecordPaymentDto, AssignFeeToStudentDto, FeeFilterDto, FeeType, FeeStatus, InitiateOnlinePaymentDto, VerifyPaymentDto, BulkAddFineDto, BulkAssignFeeDto } from './fee.dto';

@Controller('fees')
@UseGuards(JwtAuthGuard, RolesGuard, UniversityIsolationGuard)
export class FeeController {
    constructor(
        private readonly feeService: FeeService,
        private readonly invoiceService: InvoiceService,
    ) { }

    @Get('invoice/:transactionId')
    @Roles(Role.ACCOUNTANT, Role.FINANCE, Role.UNIVERSITY_ADMIN, Role.STUDENT)
    async getInvoice(@Param('transactionId') transactionId: string, @Res() res, @Request() req) {
        try {
            const transaction = await this.feeService.transactionModel.findById(transactionId)
                .populate('studentId')
                .populate({
                    path: 'studentId',
                    populate: { path: 'userId' }
                })
                .populate('feeId')
                .exec();

            if (!transaction) {
                throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND);
            }

            // Security check
            if (req.user.role === Role.STUDENT && transaction.studentId['_id'].toString() !== req.user.profileId) {
                throw new HttpException('Unauthorized access to invoice', HttpStatus.FORBIDDEN);
            }

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=invoice_${transactionId}.pdf`);
            
            return await this.invoiceService.generateInvoice(transaction, res);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to generate invoice',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // ============= FEE STRUCTURE ENDPOINTS =============

    @Post()
    @Roles(Role.ACCOUNTANT, Role.FINANCE, Role.UNIVERSITY_ADMIN)
    async createFeeStructure(@Body() dto: CreateFeeDto, @Request() req) {
        try {
            return await this.feeService.createFeeStructure(dto, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to create fee structure',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get()
    @Roles(Role.ACCOUNTANT, Role.FINANCE, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN)
    async findAllFees(
        @Request() req,
        @Query('academicYearId') academicYearId?: string,
        @Query('type') type?: string,
        @Query('status') status?: string,
        @Query('search') search?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        try {
            const filter: FeeFilterDto = {
                academicYearId,
                type: type as FeeType,
                status: status as FeeStatus,
                search
            };
            return await this.feeService.findAllFees(req.user, filter, page, limit);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch fees',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // ============= REPORTS =============

    @Get('reports/summary')
    @Roles(Role.ACCOUNTANT, Role.FINANCE, Role.UNIVERSITY_ADMIN)
    async generateReport(@Query('academicYearId') academicYearId?: string) {
        try {
            return await this.feeService.generateFeeReport(academicYearId);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to generate report',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('dashboard/students')
    @Roles(Role.ACCOUNTANT, Role.FINANCE, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN)
    async getStudentsStatus(
        @Request() req,
        @Query() filter: FeeFilterDto,
    ) {
        try {
            return await this.feeService.getStudentsPaymentStatus(req.user, filter);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch student payment status',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('transactions')
    @Roles(Role.ACCOUNTANT, Role.FINANCE, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN)
    async getTransactions(
        @Request() req,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
        @Query('status') status?: string,
        @Query('paymentMethod') paymentMethod?: string,
    ) {
        try {
            const filter = {
                universityId: req.user.role !== Role.SUPER_ADMIN ? req.user.universityId : undefined,
                status,
                paymentMethod
            };
            return await this.feeService.getTransactions(filter, page, limit);
        } catch (error) {
            throw new HttpException(
                `Failed to fetch transactions: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('dashboard/students/export')
    @Roles(Role.ACCOUNTANT, Role.FINANCE, Role.UNIVERSITY_ADMIN)
    async exportStudentsStatus(
        @Request() req,
        @Query() filter: FeeFilterDto,
        @Res() res,
    ) {
        try {
            const csv = await this.feeService.getStudentsPaymentStatusCSV(req.user, filter);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=student_fees.csv');
            return res.send(csv);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to export status',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('structures')
    @Roles(Role.ACCOUNTANT, Role.FINANCE, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN)
    async getFeeStructures(
        @Request() req,
        @Query('academicYearId') academicYearId?: string,
        @Query('type') type?: string,
        @Query('status') status?: string,
        @Query('search') search?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        try {
            const filter: FeeFilterDto = {
                academicYearId,
                type: type as FeeType,
                status: status as FeeStatus,
                search
            };
            return await this.feeService.findAllFees(req.user, filter, page, limit);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch fee structures',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Patch(':id')
    @Roles(Role.ACCOUNTANT, Role.FINANCE, Role.UNIVERSITY_ADMIN)
    async updateFee(@Param('id') id: string, @Body() dto: UpdateFeeDto, @Request() req) {
        try {
            return await this.feeService.updateFee(id, dto, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to update fee structure',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Delete(':id')
    @Roles(Role.UNIVERSITY_ADMIN)
    async deleteFee(@Param('id') id: string, @Request() req) {
        try {
            return await this.feeService.deleteFee(id, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to delete fee structure',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get(':id')
    @Roles(Role.ACCOUNTANT, Role.FINANCE, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN, Role.STUDENT)
    async getFee(@Param('id') id: string, @Request() req) {
        try {
            return await this.feeService.findFeeById(id, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch fee',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // ============= STUDENT FEE ENDPOINTS =============

    @Post('assign')
    @Roles(Role.ACCOUNTANT, Role.FINANCE, Role.UNIVERSITY_ADMIN)
    async assignFee(@Body() dto: AssignFeeToStudentDto, @Request() req) {
        try {
            return await this.feeService.assignFeeToStudent(dto, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to assign fee',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Post('payment/initiate')
    @Roles(Role.STUDENT)
    async initiatePayment(@Body() dto: InitiateOnlinePaymentDto, @Request() req) {
        try {
            return await this.feeService.initiateOnlinePayment(dto, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to initiate payment',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Post('payment/verify')
    @Roles(Role.STUDENT)
    async verifyPayment(@Body() dto: VerifyPaymentDto, @Request() req) {
        try {
            return await this.feeService.verifyPayment(dto, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to verify payment',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Post('payment')
    @Roles(Role.ACCOUNTANT, Role.FINANCE, Role.UNIVERSITY_ADMIN)
    async recordPayment(@Body() dto: RecordPaymentDto, @Request() req) {
        try {
            return await this.feeService.recordPayment(dto, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to record payment',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get('student/:studentId')
    @Roles(Role.ACCOUNTANT, Role.FINANCE, Role.UNIVERSITY_ADMIN, Role.STUDENT, Role.REGISTRAR)
    async getStudentFees(@Param('studentId') studentId: string, @Request() req) {
        try {
            return await this.feeService.getStudentFees(studentId, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch student fees',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('student/:studentId/status')
    @Roles(Role.ACCOUNTANT, Role.FINANCE, Role.UNIVERSITY_ADMIN, Role.STUDENT, Role.REGISTRAR)
    async getStudentFeeStatus(@Param('studentId') studentId: string, @Request() req) {
        try {
            return await this.feeService.getStudentsPaymentStatus(req.user, { studentId });
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch student fee status',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }


    @Get('transactions/test')
    @Roles(Role.SUPER_ADMIN)
    async testTransactions() {
        try {
            // Simple test to verify Transaction model works
            const count = await this.feeService.transactionModel.countDocuments({});
            return { message: 'Transaction model works', count };
        } catch (error) {
            throw new HttpException(
                `Transaction model error: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('transactions/collection-check')
    @Roles(Role.SUPER_ADMIN)
    async checkTransactionCollection() {
        try {
            // Check if Transaction collection exists
            const collections = await this.feeService.transactionModel.db.db.listCollections();
            const collectionsArray = await collections.toArray();
            const hasTransactions = collectionsArray.some((col) => col.name === 'transactions');
            return { 
                message: 'Collection check',
                hasTransactions,
                collections: collectionsArray.map(c => c.name)
            };
        } catch (error) {
            throw new HttpException(
                `Collection check error: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }


    @Post('fine/bulk')
    @Roles(Role.ACCOUNTANT, Role.FINANCE, Role.UNIVERSITY_ADMIN)
    async bulkAddFine(@Body() dto: BulkAddFineDto, @Request() req) {
        try {
            return await this.feeService.bulkAddFine(dto, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to add bulk fines',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Post('assign/bulk')
    @Roles(Role.ACCOUNTANT, Role.FINANCE, Role.UNIVERSITY_ADMIN)
    async bulkAssignFees(@Body() dto: BulkAssignFeeDto, @Request() req) {
        try {
            return await this.feeService.bulkAssignFees(dto, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to bulk assign fees',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get('student/:studentId/details')
    @Roles(Role.ACCOUNTANT, Role.FINANCE, Role.UNIVERSITY_ADMIN, Role.REGISTRAR)
    async getStudentDetailedFees(@Param('studentId') studentId: string, @Request() req) {
        try {
            return await this.feeService.getStudentDetailedFees(studentId, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch detailed fees',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
