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
    async createTimetable(@Body() dto: CreateTimetableDto) {
        try {
            return await this.timetableService.createTimetable(dto);
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

            return await this.timetableService.findAllTimetables(page, limit, filters);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch timetables',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get(':id')
    @Roles(Role.STUDENT, Role.FACULTY, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN)
    async getTimetable(@Param('id') id: string) {
        try {
            return await this.timetableService.findTimetableById(id);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch timetable',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Patch(':id')
    @Roles(Role.UNIVERSITY_ADMIN, Role.REGISTRAR, Role.HOD)
    async updateTimetable(@Param('id') id: string, @Body() dto: UpdateTimetableDto) {
        try {
            return await this.timetableService.updateTimetable(id, dto);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to update timetable',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Delete(':id')
    @Roles(Role.UNIVERSITY_ADMIN, Role.REGISTRAR)
    async deleteTimetable(@Param('id') id: string) {
        try {
            return await this.timetableService.deleteTimetable(id);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to delete timetable',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    // ============= TIMETABLE SLOT MANAGEMENT =============

    @Post(':timetableId/slots')
    @Roles(Role.UNIVERSITY_ADMIN, Role.REGISTRAR, Role.HOD)
    async addSlot(@Param('timetableId') timetableId: string, @Body() slotDto: CreateTimetableSlotDto) {
        try {
            return await this.timetableService.addSlot(timetableId, slotDto);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to add slot',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Patch(':timetableId/slots/:slotId')
    @Roles(Role.UNIVERSITY_ADMIN, Role.REGISTRAR, Role.HOD)
    async updateSlot(
        @Param('timetableId') timetableId: string,
        @Param('slotId') slotId: string,
        @Body() slotDto: UpdateTimetableSlotDto,
    ) {
        try {
            return await this.timetableService.updateSlot(timetableId, slotId, slotDto);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to update slot',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Delete(':timetableId/slots/:slotId')
    @Roles(Role.UNIVERSITY_ADMIN, Role.REGISTRAR, Role.HOD)
    async deleteSlot(@Param('timetableId') timetableId: string, @Param('slotId') slotId: string) {
        try {
            return await this.timetableService.deleteSlot(timetableId, slotId);
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
