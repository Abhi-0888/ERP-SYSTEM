import { Controller, Get, Post, Body, Param, UseGuards, HttpCode, HttpStatus, Query, Patch, Delete, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { Request } from '@nestjs/common';

import { CreateMarkDto, UpdateMarkDto, MarkFilterDto } from './marks.dto';
import { Mark, MarkDocument } from './marks.schema';

@Controller('marks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MarksController {
    constructor(
        @InjectModel(Mark.name) private markModel: Model<MarkDocument>,
    ) { }

    @Post()
    @Roles(Role.FACULTY, Role.HOD, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createMarkDto: CreateMarkDto, @Request() req: any) {
        try {
            const mark = new this.markModel({
                ...createMarkDto,
                enteredBy: req.user.id,
            });
            
            const saved = await mark.save();
            return saved;
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
            const query: any = {};
            
            // Apply filters based on user role
            if (req.user.role === Role.STUDENT) {
                query.studentId = req.user.id;
            } else if (req.user.role === Role.FACULTY) {
                // Faculty can see marks for their department students
                query['$or'] = [
                    { 'studentId.departmentId': req.user.departmentId },
                ];
            }
            
            if (filter.examId) {
                query.examId = filter.examId;
            }
            
            if (filter.studentId) {
                query.studentId = filter.studentId;
            }
            
            if (filter.courseId) {
                query.courseId = filter.courseId;
            }
            
            const skip = (filter.page - 1) * filter.limit || 0;
            const marks = await this.markModel
                .find(query)
                .populate('studentId', 'name enrollmentNo')
                .populate('examId', 'name type totalMarks')
                .populate('courseId', 'name code')
                .skip(skip)
                .limit(filter.limit || 10)
                .exec();
            
            const total = await this.markModel.countDocuments(query);
            
            return {
                data: marks,
                pagination: {
                    total,
                    page: filter.page || 1,
                    limit: filter.limit || 10,
                    totalPages: Math.ceil(total / (filter.limit || 10)),
                },
            };
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
            const query: any = { studentId };
            
            if (filter.examId) {
                query.examId = filter.examId;
            }
            
            if (filter.courseId) {
                query.courseId = filter.courseId;
            }
            
            const skip = (filter.page - 1) * filter.limit || 0;
            const marks = await this.markModel
                .find(query)
                .populate('studentId', 'name enrollmentNo')
                .populate('examId', 'name type totalMarks')
                .populate('courseId', 'name code')
                .skip(skip)
                .limit(filter.limit || 10)
                .exec();
            
            const total = await this.markModel.countDocuments(query);
            
            return {
                data: marks,
                pagination: {
                    total,
                    page: filter.page || 1,
                    limit: filter.limit || 10,
                    totalPages: Math.ceil(total / (filter.limit || 10)),
                },
            };
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
            const mark = await this.markModel
                .findById(id)
                .populate('studentId', 'name enrollmentNo')
                .populate('examId', 'name type totalMarks')
                .populate('courseId', 'name code')
                .exec();
            
            if (!mark) {
                throw new HttpException('Mark not found', HttpStatus.NOT_FOUND);
            }
            
            // Verify access rights
            if (req.user.role === Role.STUDENT && mark.studentId.toString() !== req.user.id) {
                throw new HttpException('Students can only view their own marks', HttpStatus.FORBIDDEN);
            }
            
            return mark;
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
            const mark = await this.markModel.findById(id);
            if (!mark) {
                throw new HttpException('Mark not found', HttpStatus.NOT_FOUND);
            }
            
            // Verify access rights
            if (req.user.role === Role.STUDENT && mark.studentId.toString() !== req.user.id.toString()) {
                throw new HttpException('Students can only update their own marks', HttpStatus.FORBIDDEN);
            }
            
            Object.assign(mark, updateMarkDto);
            return await mark.save();
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
            const mark = await this.markModel.findById(id);
            if (!mark) {
                throw new HttpException('Mark not found', HttpStatus.NOT_FOUND);
            }
            
            // Verify access rights
            if (req.user.role === Role.STUDENT && mark.studentId.toString() !== req.user.id) {
                throw new HttpException('Students can only delete their own marks', HttpStatus.FORBIDDEN);
            }
            
            await this.markModel.findByIdAndDelete(id);
            return { message: 'Mark deleted successfully' };
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to delete mark',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
