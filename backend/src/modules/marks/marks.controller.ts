import { Controller, Get, Post, Body, Param, UseGuards, HttpCode, HttpStatus, Query, Patch, Delete, HttpException } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { Request } from '@nestjs/common';

import { CreateMarkDto, UpdateMarkDto, MarkFilterDto } from './marks.dto';
import { MarksService } from './marks.service';

@Controller('marks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MarksController {
    constructor(
        private readonly marksService: MarksService,
    ) { }

    @Post()
    @Roles(Role.FACULTY, Role.HOD, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createMarkDto: CreateMarkDto, @Request() req: any) {
        try {
            return await this.marksService.create(createMarkDto, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to create mark',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get()
    @Roles(Role.FACULTY, Role.HOD, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN, Role.STUDENT)
    async findAll(@Query() filter: MarkFilterDto, @Request() req: any) {
        try {
            return await this.marksService.findAll(filter, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch marks',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('student/:studentId')
    @Roles(Role.FACULTY, Role.HOD, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN, Role.STUDENT)
    async findByStudent(@Param('studentId') studentId: string, @Query() filter: MarkFilterDto, @Request() req: any) {
        try {
            return await this.marksService.findByStudent(studentId, filter, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch student marks',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get(':id')
    @Roles(Role.FACULTY, Role.HOD, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN, Role.STUDENT)
    async findById(@Param('id') id: string, @Request() req: any) {
        try {
            return await this.marksService.findById(id, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch mark',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Patch(':id')
    @Roles(Role.FACULTY, Role.HOD, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN)
    async update(@Param('id') id: string, @Body() updateMarkDto: UpdateMarkDto, @Request() req: any) {
        try {
            return await this.marksService.update(id, updateMarkDto, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to update mark',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Delete(':id')
    @Roles(Role.FACULTY, Role.HOD, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN)
    async remove(@Param('id') id: string, @Request() req: any) {
        try {
            return await this.marksService.remove(id, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to delete mark',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
