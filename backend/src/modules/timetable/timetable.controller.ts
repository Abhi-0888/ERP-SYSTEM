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
import { TimetableService } from './timetable.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CreateTimetableDto, UpdateTimetableDto, CreateTimetableSlotDto, UpdateTimetableSlotDto } from './timetable.dto';

import { UniversityIsolationGuard } from '../../common/guards/university-isolation.guard';

@Controller('timetable')
@UseGuards(JwtAuthGuard, RolesGuard, UniversityIsolationGuard)
export class TimetableController {
    constructor(private readonly timetableService: TimetableService) { }

    // ============= TIMETABLE MANAGEMENT =============

    @Post()
    @Roles(Role.UNIVERSITY_ADMIN, Role.REGISTRAR, Role.HOD)
    async createTimetable(@Body() dto: CreateTimetableDto, @Request() req) {
        try {
            return await this.timetableService.createTimetable(dto, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to create timetable',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get()
    @Roles(Role.STUDENT, Role.FACULTY, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN)
    async findAllTimetables(
        @Request() req,
        @Query('academicYearId') academicYearId?: string,
        @Query('programId') programId?: string,
        @Query('status') status?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        try {
            const filters: any = {};
            if (academicYearId) filters.academicYearId = academicYearId;
            if (programId) filters.programId = programId;
            if (status) filters.status = status;

            return await this.timetableService.findAllTimetables(req.user, page, limit, filters);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch timetables',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get(':id')
    @Roles(Role.STUDENT, Role.FACULTY, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN)
    async getTimetable(@Param('id') id: string, @Request() req) {
        try {
            return await this.timetableService.findTimetableById(id, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch timetable',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('student/:studentId')
    @Roles(Role.STUDENT, Role.FACULTY, Role.HOD, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN)
    async getTimetableForStudent(@Param('studentId') studentId: string, @Request() req) {
        try {
            return await this.timetableService.getTimetableForStudent(studentId, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch timetable for student',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Patch(':id')
    @Roles(Role.UNIVERSITY_ADMIN, Role.REGISTRAR, Role.HOD)
    async updateTimetable(@Param('id') id: string, @Body() dto: UpdateTimetableDto, @Request() req) {
        try {
            return await this.timetableService.updateTimetable(id, dto, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to update timetable',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Delete(':id')
    @Roles(Role.UNIVERSITY_ADMIN, Role.REGISTRAR)
    async deleteTimetable(@Param('id') id: string, @Request() req) {
        try {
            return await this.timetableService.deleteTimetable(id, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to delete timetable',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    // ============= SLOT MANAGEMENT =============

    @Post(':id/slots')
    @Roles(Role.UNIVERSITY_ADMIN, Role.REGISTRAR, Role.HOD)
    async addSlot(@Param('id') id: string, @Body() dto: CreateTimetableSlotDto, @Request() req) {
        try {
            return await this.timetableService.addSlot(id, dto, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to add slot',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Patch(':id/slots/:slotId')
    @Roles(Role.UNIVERSITY_ADMIN, Role.REGISTRAR, Role.HOD)
    async updateSlot(
        @Param('id') id: string,
        @Param('slotId') slotId: string,
        @Body() dto: UpdateTimetableSlotDto,
        @Request() req,
    ) {
        try {
            return await this.timetableService.updateSlot(id, slotId, dto, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to update slot',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Delete(':id/slots/:slotId')
    @Roles(Role.UNIVERSITY_ADMIN, Role.REGISTRAR, Role.HOD)
    async deleteSlot(@Param('id') id: string, @Param('slotId') slotId: string, @Request() req) {
        try {
            return await this.timetableService.deleteSlot(id, slotId, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to delete slot',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    // ============= STUDENT TIMETABLE =============

    @Get('student/:studentId')
    @Roles(Role.STUDENT, Role.FACULTY, Role.REGISTRAR)
    async getStudentTimetable(
        @Param('studentId') studentId: string,
        @Query('academicYearId') academicYearId?: string,
    ) {
        try {
            return await this.timetableService.getStudentTimetable(studentId, academicYearId);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch student timetable',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // ============= INSTRUCTOR TIMETABLE =============

    @Get('instructor/:instructorId')
    @Roles(Role.FACULTY, Role.HOD, Role.REGISTRAR)
    async getInstructorTimetable(@Param('instructorId') instructorId: string) {
        try {
            return await this.timetableService.getInstructorTimetable(instructorId);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch instructor timetable',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
