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
} from '@nestjs/common';
import { FeeService } from './fee.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { UniversityIsolationGuard } from '../../common/guards/university-isolation.guard';
import { CreateFeeDto, UpdateFeeDto, RecordPaymentDto, AssignFeeToStudentDto, FeeFilterDto, FeeType, FeeStatus } from './fee.dto';

@Controller('fees')
@UseGuards(JwtAuthGuard, RolesGuard, UniversityIsolationGuard)
export class FeeController {
    constructor(private readonly feeService: FeeService) { }

    // ============= FEE STRUCTURE ENDPOINTS =============

    @Post()
    @Roles(Role.ACCOUNTANT, Role.UNIVERSITY_ADMIN)
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
    @Roles(Role.ACCOUNTANT, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN)
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
    @Roles(Role.ACCOUNTANT, Role.UNIVERSITY_ADMIN)
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

    @Get('structures')
    @Roles(Role.ACCOUNTANT, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN)
    async getFeeStructures(@Request() req, @Query() filter: FeeFilterDto) {
        return this.findAllFees(req, filter.academicYearId, filter.type, filter.status, filter.search);
    }

    @Get(':id')
    @Roles(Role.ACCOUNTANT, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN, Role.STUDENT)
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

    @Patch(':id')
    @Roles(Role.ACCOUNTANT, Role.UNIVERSITY_ADMIN)
    async updateFee(@Param('id') id: string, @Body() dto: UpdateFeeDto, @Request() req) {
        try {
            return await this.feeService.updateFee(id, dto, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to update fee',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Delete(':id')
    @Roles(Role.ACCOUNTANT, Role.UNIVERSITY_ADMIN)
    async deleteFee(@Param('id') id: string, @Request() req) {
        try {
            return await this.feeService.deleteFee(id, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to delete fee',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    // ============= STUDENT FEE ENDPOINTS =============

    @Post('assign')
    @Roles(Role.ACCOUNTANT, Role.UNIVERSITY_ADMIN)
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

    @Post('payment')
    @Roles(Role.ACCOUNTANT, Role.UNIVERSITY_ADMIN, Role.STUDENT)
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
    @Roles(Role.ACCOUNTANT, Role.UNIVERSITY_ADMIN, Role.STUDENT, Role.REGISTRAR)
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
    @Roles(Role.ACCOUNTANT, Role.UNIVERSITY_ADMIN, Role.STUDENT, Role.REGISTRAR)
    async getStudentFeeStatus(@Param('studentId') studentId: string, @Request() req) {
        return this.getStudentFees(studentId, req);
    }


}
