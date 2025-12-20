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
import { ExamService } from './exam.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CreateExamDto, UpdateExamDto, RecordExamMarksDto, ExamFilterDto, ExamType, ExamStatus } from './exam.dto';

import { UniversityIsolationGuard } from '../../common/guards/university-isolation.guard';

@Controller('exams')
@UseGuards(JwtAuthGuard, RolesGuard, UniversityIsolationGuard)
export class ExamController {
    constructor(private readonly examService: ExamService) { }

    // ============= EXAM ENDPOINTS =============

    @Post()
    @Roles(Role.EXAM_CONTROLLER, Role.UNIVERSITY_ADMIN, Role.FACULTY)
    async createExam(@Body() dto: CreateExamDto) {
        try {
            return await this.examService.createExam(dto);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to create exam',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get()
    @Roles(Role.STUDENT, Role.FACULTY, Role.HOD, Role.EXAM_CONTROLLER, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN)
    async findAllExams(
        @Query('courseId') courseId?: string,
        @Query('academicYearId') academicYearId?: string,
        @Query('type') type?: string,
        @Query('status') status?: string,
        @Query('search') search?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        try {
            const filter: ExamFilterDto = {
                courseId,
                academicYearId,
                type: type as ExamType,
                status: status as ExamStatus,
                search
            };
            return await this.examService.findAllExams(filter, page, limit);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch exams',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get(':id')
    @Roles(Role.STUDENT, Role.FACULTY, Role.HOD, Role.EXAM_CONTROLLER, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN)
    async findExam(@Param('id') id: string) {
        try {
            return await this.examService.findExamById(id);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch exam',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Patch(':id')
    @Roles(Role.EXAM_CONTROLLER, Role.UNIVERSITY_ADMIN, Role.FACULTY)
    async updateExam(@Param('id') id: string, @Body() dto: UpdateExamDto) {
        try {
            return await this.examService.updateExam(id, dto);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to update exam',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Delete(':id')
    @Roles(Role.EXAM_CONTROLLER, Role.UNIVERSITY_ADMIN)
    async deleteExam(@Param('id') id: string) {
        try {
            return await this.examService.deleteExam(id);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to delete exam',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    // ============= MARKS ENDPOINTS =============

    @Post(':examId/marks')
    @Roles(Role.FACULTY, Role.EXAM_CONTROLLER, Role.UNIVERSITY_ADMIN)
    async recordMarks(@Param('examId') examId: string, @Body() marksDto: RecordExamMarksDto) {
        try {
            return await this.examService.recordMarks(examId, marksDto);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to record marks',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get(':examId/results')
    @Roles(Role.STUDENT, Role.FACULTY, Role.HOD, Role.EXAM_CONTROLLER, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN)
    async getExamResults(
        @Param('examId') examId: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        try {
            return await this.examService.getExamResults(examId, page, limit);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch results',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('student/:studentId/results')
    @Roles(Role.STUDENT, Role.FACULTY, Role.HOD, Role.EXAM_CONTROLLER, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN)
    async getStudentResults(
        @Param('studentId') studentId: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        try {
            return await this.examService.getStudentExamResults(studentId, page, limit);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch student results',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // ============= STATISTICS =============

    @Get(':examId/statistics')
    @Roles(Role.EXAM_CONTROLLER, Role.UNIVERSITY_ADMIN, Role.FACULTY)
    async getStatistics(@Param('examId') examId: string) {
        try {
            return await this.examService.generateExamStatistics(examId);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to generate statistics',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
