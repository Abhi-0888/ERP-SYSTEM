import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
    HttpException,
    HttpStatus,
    Request,
} from '@nestjs/common';
import { AcademicService } from './academic.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CreateAcademicYearDto, UpdateAcademicYearDto, CreateDepartmentDto, UpdateDepartmentDto, CreateProgramDto, UpdateProgramDto, CreateCourseDto, UpdateCourseDto } from './academic.dto';

import { UniversityIsolationGuard } from '../../common/guards/university-isolation.guard';

@Controller('academic')
@UseGuards(JwtAuthGuard, RolesGuard, UniversityIsolationGuard)
export class AcademicController {
    constructor(private readonly academicService: AcademicService) { }

    // ============= ACADEMIC YEAR ENDPOINTS =============

    @Post('academic-years')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN, Role.REGISTRAR)
    async createAcademicYear(@Body() dto: CreateAcademicYearDto) {
        try {
            return await this.academicService.createAcademicYear(dto);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to create academic year',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get('academic-years')
    @Roles(Role.STUDENT, Role.FACULTY, Role.HOD, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN, Role.EXAM_CONTROLLER, Role.ACADEMIC_COORDINATOR)
    async findAllAcademicYears(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        try {
            return await this.academicService.findAllAcademicYears(page, limit);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch academic years',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('academic-years/active')
    @Roles(Role.STUDENT, Role.FACULTY, Role.HOD, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN, Role.EXAM_CONTROLLER, Role.ACADEMIC_COORDINATOR)
    async getActiveAcademicYear() {
        try {
            return await this.academicService.getActiveAcademicYear();
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch active academic year',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('academic-years/:id')
    @Roles(Role.STUDENT, Role.FACULTY, Role.HOD, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN, Role.EXAM_CONTROLLER, Role.ACADEMIC_COORDINATOR)
    async getAcademicYear(@Param('id') id: string) {
        try {
            return await this.academicService.findAcademicYearById(id);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch academic year',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Patch('academic-years/:id')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN, Role.REGISTRAR)
    async updateAcademicYear(@Param('id') id: string, @Body() dto: UpdateAcademicYearDto) {
        try {
            return await this.academicService.updateAcademicYear(id, dto);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to update academic year',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Post('academic-years/:id/set-active')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN, Role.REGISTRAR)
    async setActiveAcademicYear(@Param('id') id: string) {
        try {
            return await this.academicService.setActiveAcademicYear(id);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to set active academic year',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    // ============= DEPARTMENT ENDPOINTS =============

    @Post('departments')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN, Role.REGISTRAR)
    async createDepartment(@Body() dto: CreateDepartmentDto, @Request() req) {
        try {
            return await this.academicService.createDepartment(dto, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to create department',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get('departments')
    @Roles(Role.STUDENT, Role.FACULTY, Role.HOD, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN, Role.EXAM_CONTROLLER, Role.ACADEMIC_COORDINATOR)
    async findAllDepartments(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Request() req,
    ) {
        try {
            return await this.academicService.findAllDepartments(req.user, page, limit);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch departments',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('departments/:id')
    @Roles(Role.STUDENT, Role.FACULTY, Role.HOD, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN, Role.EXAM_CONTROLLER, Role.ACADEMIC_COORDINATOR)
    async getDepartment(@Param('id') id: string, @Request() req) {
        try {
            return await this.academicService.findDepartmentById(id, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch department',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Patch('departments/:id')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN, Role.HOD)
    async updateDepartment(@Param('id') id: string, @Body() dto: UpdateDepartmentDto, @Request() req) {
        try {
            return await this.academicService.updateDepartment(id, dto, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to update department',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Delete('departments/:id')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN)
    async deleteDepartment(@Param('id') id: string, @Request() req) {
        try {
            return await this.academicService.deleteDepartment(id, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to delete department',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    // ============= PROGRAM ENDPOINTS =============

    @Post('programs')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN, Role.REGISTRAR, Role.HOD)
    async createProgram(@Body() dto: CreateProgramDto, @Request() req) {
        try {
            return await this.academicService.createProgram(dto, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to create program',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get('programs')
    @Roles(Role.STUDENT, Role.FACULTY, Role.HOD, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN, Role.EXAM_CONTROLLER, Role.ACADEMIC_COORDINATOR)
    async findAllPrograms(
        @Request() req,
        @Query('departmentId') departmentId?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        try {
            return await this.academicService.findAllPrograms(req.user, departmentId, page, limit);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch programs',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('programs/:id')
    @Roles(Role.STUDENT, Role.FACULTY, Role.HOD, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN, Role.EXAM_CONTROLLER, Role.ACADEMIC_COORDINATOR)
    async getProgram(@Param('id') id: string, @Request() req) {
        try {
            return await this.academicService.findProgramById(id, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch program',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Patch('programs/:id')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN, Role.HOD)
    async updateProgram(@Param('id') id: string, @Body() dto: UpdateProgramDto, @Request() req) {
        try {
            return await this.academicService.updateProgram(id, dto, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to update program',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Delete('programs/:id')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN)
    async deleteProgram(@Param('id') id: string, @Request() req) {
        try {
            return await this.academicService.deleteProgram(id, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to delete program',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    // ============= COURSE ENDPOINTS =============

    @Post('courses')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN, Role.HOD, Role.FACULTY)
    async createCourse(@Body() dto: CreateCourseDto, @Request() req) {
        try {
            return await this.academicService.createCourse(dto, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to create course',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get('courses')
    @Roles(Role.STUDENT, Role.FACULTY, Role.HOD, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN, Role.EXAM_CONTROLLER, Role.ACADEMIC_COORDINATOR)
    async findAllCourses(
        @Request() req,
        @Query('programId') programId?: string,
        @Query('semester') semester?: number,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        try {
            return await this.academicService.findAllCourses(req.user, programId, semester, page, limit);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch courses',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('courses/program/:programId')
    @Roles(Role.STUDENT, Role.FACULTY, Role.HOD, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN, Role.EXAM_CONTROLLER, Role.ACADEMIC_COORDINATOR)
    async getCoursesByProgram(@Param('programId') programId: string, @Request() req) {
        try {
            return await this.academicService.getCoursesByProgram(programId, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch courses',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('courses/:id')
    @Roles(Role.STUDENT, Role.FACULTY, Role.HOD, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN, Role.EXAM_CONTROLLER, Role.ACADEMIC_COORDINATOR)
    async getCourse(@Param('id') id: string, @Request() req) {
        try {
            return await this.academicService.findCourseById(id, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch course',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Patch('courses/:id')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN, Role.HOD, Role.FACULTY)
    async updateCourse(@Param('id') id: string, @Body() dto: UpdateCourseDto, @Request() req) {
        try {
            return await this.academicService.updateCourse(id, dto, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to update course',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Delete('courses/:id')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN, Role.HOD)
    async deleteCourse(@Param('id') id: string, @Request() req) {
        try {
            return await this.academicService.deleteCourse(id, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to delete course',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Patch('courses/:id/assign-faculty')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN, Role.HOD, Role.ACADEMIC_COORDINATOR)
    async assignFacultyToCourse(
        @Param('id') id: string,
        @Body('facultyId') facultyId: string,
        @Request() req,
    ) {
        try {
            return await this.academicService.assignFacultyToCourse(id, facultyId, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to assign faculty to course',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    // ============= REPORTS =============

    @Get('reports/overview')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN, Role.REGISTRAR)
    async getAcademicYearReport(@Request() req) {
        try {
            return await this.academicService.generateAcademicYearReport(req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to generate report',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}


