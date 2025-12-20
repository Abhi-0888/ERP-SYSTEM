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
    async createFeeStructure(@Body() dto: CreateFeeDto) {
        try {
            return await this.feeService.createFeeStructure(dto);
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
            return await this.feeService.findAllFees(filter, page, limit);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch fees',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get(':id')
    @Roles(Role.ACCOUNTANT, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN, Role.STUDENT)
    async getFee(@Param('id') id: string) {
        try {
            return await this.feeService.findFeeById(id);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch fee',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Patch(':id')
    @Roles(Role.ACCOUNTANT, Role.UNIVERSITY_ADMIN)
    async updateFee(@Param('id') id: string, @Body() dto: UpdateFeeDto) {
        try {
            return await this.feeService.updateFee(id, dto);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to update fee',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Delete(':id')
    @Roles(Role.ACCOUNTANT, Role.UNIVERSITY_ADMIN)
    async deleteFee(@Param('id') id: string) {
        try {
            return await this.feeService.deleteFee(id);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to delete fee',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    // ============= STUDENT FEE ASSIGNMENT =============

    @Post('assign')
    @Roles(Role.ACCOUNTANT, Role.UNIVERSITY_ADMIN)
    async assignFeeToStudent(@Body() dto: AssignFeeToStudentDto) {
        try {
            return await this.feeService.assignFeeToStudent(dto);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to assign fee',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get('student/:studentId/status')
    @Roles(Role.ACCOUNTANT, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN, Role.STUDENT)
    async getStudentFeeStatus(
        @Param('studentId') studentId: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        try {
            return await this.feeService.getStudentFeeStatus(studentId, page, limit);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch fee status',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // ============= PAYMENT ENDPOINTS =============

    @Post('payment')
    @Roles(Role.ACCOUNTANT, Role.STUDENT)
    async recordPayment(@Body() dto: RecordPaymentDto) {
        try {
            // In real scenario, extract studentId from JWT token
            return await this.feeService.recordPayment(dto.feeId, dto);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to record payment',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Post('student/:studentId/payment')
    @Roles(Role.ACCOUNTANT, Role.UNIVERSITY_ADMIN)
    async recordStudentPayment(@Param('studentId') studentId: string, @Body() dto: RecordPaymentDto) {
        try {
            return await this.feeService.recordPayment(studentId, dto);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to record payment',
                HttpStatus.BAD_REQUEST,
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
}
