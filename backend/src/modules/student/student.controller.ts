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
    async createStudent(@Body() dto: CreateStudentDto, @Request() req) {
        try {
            return await this.studentService.createStudent(dto, req.user);
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
        @Request() req,
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

            return await this.studentService.findAll(req.user, page, limit, filters);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch students',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get(':id')
    @Roles(Role.STUDENT, Role.FACULTY, Role.HOD, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN)
    async findById(@Param('id') id: string, @Request() req) {
        try {
            return await this.studentService.findById(id, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch student',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('registration/:registrationNumber')
    @Roles(Role.STUDENT, Role.FACULTY, Role.HOD, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN)
    async findByRegistrationNumber(@Param('registrationNumber') registrationNumber: string, @Request() req) {
        try {
            return await this.studentService.findByRegistrationNumber(registrationNumber, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch student',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('course/:courseId')
    @Roles(Role.FACULTY, Role.HOD, Role.UNIVERSITY_ADMIN)
    async findByCourse(@Param('courseId') courseId: string, @Request() req) {
        try {
            return await this.studentService.getStudentsByCourse(courseId, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch students for this course',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Patch(':id')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN, Role.REGISTRAR, Role.STUDENT)
    async updateStudent(@Param('id') id: string, @Body() dto: UpdateStudentDto, @Request() req) {
        try {
            return await this.studentService.updateStudent(id, dto, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to update student',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Post(':id/enrollment')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN, Role.REGISTRAR)
    async updateEnrollment(@Param('id') id: string, @Body() dto: UpdateStudentEnrollmentDto, @Request() req) {
        try {
            return await this.studentService.updateEnrollment(id, dto, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to update enrollment',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Post(':id/status')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN, Role.REGISTRAR)
    async updateStatus(@Param('id') id: string, @Body('status') status: string, @Request() req) {
        try {
            return await this.studentService.updateStudentStatus(id, status, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to update status',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Delete(':id')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN, Role.REGISTRAR)
    async deleteStudent(@Param('id') id: string, @Request() req) {
        try {
            return await this.studentService.deleteStudent(id, req.user);
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
        @Request() req,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        try {
            return await this.studentService.getStudentsByProgram(programId, req.user, page, limit);
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

