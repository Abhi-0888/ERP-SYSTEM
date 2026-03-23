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
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { MarkAttendanceDto, UpdateAttendanceDto, AttendanceFilterDto, AttendanceStatus } from './attendance.dto';

import { UniversityIsolationGuard } from '../../common/guards/university-isolation.guard';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard, UniversityIsolationGuard)
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    // ============= ATTENDANCE MARKING =============

    @Post()
    @Roles(Role.FACULTY, Role.HOD, Role.UNIVERSITY_ADMIN)
    async markAttendance(@Body() dto: MarkAttendanceDto, @Request() req) {
        try {
            return await this.attendanceService.markAttendance(dto, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to mark attendance',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Post('bulk')
    @Roles(Role.FACULTY, Role.HOD, Role.UNIVERSITY_ADMIN)
    async markBulkAttendance(@Body('attendance') dtos: MarkAttendanceDto[], @Request() req) {
        try {
            return await this.attendanceService.markBulkAttendance(dtos, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to mark attendance',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    // ============= ATTENDANCE RETRIEVAL =============

    @Get()
    @Roles(Role.FACULTY, Role.HOD, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN)
    async findAttendance(
        @Request() req,
        @Query('studentId') studentId?: string,
        @Query('courseId') courseId?: string,
        @Query('status') status?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        try {
            const filter: AttendanceFilterDto = {
                studentId,
                courseId,
                status: status as AttendanceStatus,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
            };
            return await this.attendanceService.findAttendance(req.user, filter, page, limit);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch attendance records',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('student/:studentId')
    @Roles(Role.STUDENT, Role.FACULTY, Role.HOD, Role.REGISTRAR)
    async getStudentAttendance(
        @Param('studentId') studentId: string,
        @Request() req,
        @Query('courseId') courseId?: string,
    ) {
        try {
            return await this.attendanceService.getStudentAttendance(req.user, studentId, courseId);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch student attendance',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Patch(':id')
    @Roles(Role.FACULTY, Role.HOD, Role.UNIVERSITY_ADMIN)
    async updateAttendance(@Param('id') id: string, @Body() dto: UpdateAttendanceDto, @Request() req) {
        try {
            return await this.attendanceService.updateAttendance(id, dto, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to update attendance',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Delete(':id')
    @Roles(Role.UNIVERSITY_ADMIN, Role.HOD)
    async deleteAttendance(@Param('id') id: string, @Request() req) {
        try {
            return await this.attendanceService.deleteAttendance(id, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to delete attendance',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get('course/:courseId/summary')
    @Roles(Role.FACULTY, Role.HOD, Role.REGISTRAR)
    async getCourseAttendanceSummary(@Param('courseId') courseId: string, @Request() req) {
        try {
            return await this.attendanceService.getCourseAttendanceSummary(req.user, courseId);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch course attendance summary',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('reports/summary')
    @Roles(Role.UNIVERSITY_ADMIN, Role.REGISTRAR)
    async generateAttendanceReport(
        @Request() req,
        @Query('studentId') studentId?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        try {
            return await this.attendanceService.generateAttendanceReport(
                req.user,
                studentId,
                startDate ? new Date(startDate) : undefined,
                endDate ? new Date(endDate) : undefined,
            );
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to generate attendance report',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
