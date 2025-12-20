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
import { StudentService } from './student.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CreateStudentDto, UpdateStudentDto, UpdateStudentEnrollmentDto } from './student.dto';

import { UniversityIsolationGuard } from '../../common/guards/university-isolation.guard';

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard, UniversityIsolationGuard)
export class StudentController {
    constructor(private readonly studentService: StudentService) { }

    @Post()
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN, Role.REGISTRAR)
    async createStudent(@Body() dto: CreateStudentDto) {
        try {
            return await this.studentService.createStudent(dto);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to create student',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get()
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN, Role.REGISTRAR, Role.HOD, Role.FACULTY)
    async findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('programId') programId?: string,
        @Query('academicYearId') academicYearId?: string,
        @Query('status') status?: string,
        @Query('search') search?: string,
    ) {
        try {
            const filters: any = {};
            if (programId) filters.programId = programId;
            if (academicYearId) filters.academicYearId = academicYearId;
            if (status) filters.status = status;
            if (search) filters.search = search;

            return await this.studentService.findAll(page, limit, filters);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch students',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get(':id')
    @Roles(Role.STUDENT, Role.FACULTY, Role.HOD, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN)
    async findById(@Param('id') id: string) {
        try {
            return await this.studentService.findById(id);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch student',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('registration/:registrationNumber')
    @Roles(Role.STUDENT, Role.FACULTY, Role.HOD, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN)
    async findByRegistrationNumber(@Param('registrationNumber') registrationNumber: string) {
        try {
            return await this.studentService.findByRegistrationNumber(registrationNumber);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch student',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Patch(':id')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN, Role.REGISTRAR, Role.STUDENT)
    async updateStudent(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
        try {
            return await this.studentService.updateStudent(id, dto);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to update student',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Post(':id/enrollment')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN, Role.REGISTRAR)
    async updateEnrollment(@Param('id') id: string, @Body() dto: UpdateStudentEnrollmentDto) {
        try {
            return await this.studentService.updateEnrollment(id, dto);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to update enrollment',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Post(':id/status')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN, Role.REGISTRAR)
    async updateStatus(@Param('id') id: string, @Body('status') status: string) {
        try {
            return await this.studentService.updateStudentStatus(id, status);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to update status',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Delete(':id')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN)
    async deleteStudent(@Param('id') id: string) {
        try {
            return await this.studentService.deleteStudent(id);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to delete student',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get('program/:programId')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN, Role.HOD, Role.FACULTY)
    async getByProgram(
        @Param('programId') programId: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        try {
            return await this.studentService.getStudentsByProgram(programId, page, limit);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch students',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('academic-year/:academicYearId')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN, Role.REGISTRAR)
    async getByAcademicYear(
        @Param('academicYearId') academicYearId: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        try {
            return await this.studentService.getStudentsByAcademicYear(academicYearId, page, limit);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch students',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('reports/summary')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN, Role.REGISTRAR)
    async getReport(
        @Query('programId') programId?: string,
        @Query('academicYearId') academicYearId?: string,
    ) {
        try {
            return await this.studentService.generateStudentReport(programId, academicYearId);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to generate report',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}

