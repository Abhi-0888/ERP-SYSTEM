import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Request, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { SectionService } from '../academic/section.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { UniversityIsolationGuard } from '../../common/guards/university-isolation.guard';

@Controller('sections')
@UseGuards(JwtAuthGuard, RolesGuard, UniversityIsolationGuard)
export class SectionController {
    constructor(private readonly sectionService: SectionService) { }

    @Post()
    @Roles(Role.UNIVERSITY_ADMIN, Role.HOD, Role.REGISTRAR)
    async create(@Body() createSectionDto: any, @Request() req) {
        try {
            return await this.sectionService.create(createSectionDto, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to create section',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get()
    @Roles(Role.UNIVERSITY_ADMIN, Role.HOD, Role.REGISTRAR, Role.FACULTY, Role.STUDENT)
    async findAll(@Request() req, @Query() filters: any) {
        try {
            return await this.sectionService.findAll(req.user, filters);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch sections',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('stats')
    @Roles(Role.UNIVERSITY_ADMIN, Role.HOD, Role.REGISTRAR)
    async getStats(@Request() req) {
        try {
            return await this.sectionService.getSectionStats(req.user.universityId);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch section stats',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('faculty/:facultyId')
    @Roles(Role.UNIVERSITY_ADMIN, Role.HOD, Role.FACULTY, Role.REGISTRAR)
    async getByFaculty(@Param('facultyId') facultyId: string) {
        try {
            return await this.sectionService.getSectionsByFaculty(facultyId);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch faculty sections',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get(':id')
    @Roles(Role.UNIVERSITY_ADMIN, Role.HOD, Role.REGISTRAR, Role.FACULTY, Role.STUDENT)
    async findById(@Param('id') id: string) {
        try {
            const section = await this.sectionService.findById(id);
            if (!section) {
                throw new HttpException('Section not found', HttpStatus.NOT_FOUND);
            }
            return section;
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch section',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Patch(':id')
    @Roles(Role.UNIVERSITY_ADMIN, Role.HOD, Role.REGISTRAR)
    async update(@Param('id') id: string, @Body() updateSectionDto: any) {
        try {
            return await this.sectionService.update(id, updateSectionDto);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to update section',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Delete(':id')
    @Roles(Role.UNIVERSITY_ADMIN, Role.HOD, Role.REGISTRAR)
    async delete(@Param('id') id: string) {
        try {
            return await this.sectionService.delete(id);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to delete section',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post(':id/students/:studentId')
    @Roles(Role.UNIVERSITY_ADMIN, Role.HOD, Role.REGISTRAR)
    async addStudent(@Param('id') sectionId: string, @Param('studentId') studentId: string) {
        try {
            return await this.sectionService.addStudentToSection(sectionId, studentId);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to add student to section',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Delete(':id/students/:studentId')
    @Roles(Role.UNIVERSITY_ADMIN, Role.HOD, Role.REGISTRAR)
    async removeStudent(@Param('id') sectionId: string, @Param('studentId') studentId: string) {
        try {
            return await this.sectionService.removeStudentFromSection(sectionId, studentId);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to remove student from section',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Post(':id/advisor/:facultyId')
    @Roles(Role.UNIVERSITY_ADMIN, Role.HOD, Role.REGISTRAR)
    async assignAdvisor(@Param('id') sectionId: string, @Param('facultyId') facultyId: string) {
        try {
            return await this.sectionService.assignClassAdvisor(sectionId, facultyId);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to assign class advisor',
                HttpStatus.BAD_REQUEST,
            );
        }
    }
}
