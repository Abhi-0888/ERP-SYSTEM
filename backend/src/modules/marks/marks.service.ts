import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Mark, MarkDocument } from './marks.schema';
import { CreateMarkDto, UpdateMarkDto, MarkFilterDto } from './marks.dto';
import { Role } from '../../common/enums/role.enum';
import { StudentProfile } from '../student/student-profile.schema';

@Injectable()
export class MarksService {
    constructor(
        @InjectModel(Mark.name) private markModel: Model<MarkDocument>,
        @InjectModel(StudentProfile.name) private studentProfileModel: Model<StudentProfile>,
    ) { }

    async create(createMarkDto: CreateMarkDto, currentUser: any): Promise<Mark> {
        try {
            // Verify student exists
            const student = await this.studentProfileModel.findById(createMarkDto.studentId);
            if (!student) {
                throw new NotFoundException('Student not found');
            }

            // Verify faculty can only enter marks for their department students
            if (currentUser.role === Role.FACULTY && student.departmentId?.toString() !== currentUser.departmentId?.toString()) {
                throw new ForbiddenException('Faculty can only enter marks for students in their own department');
            }

            const mark = new this.markModel({
                ...createMarkDto,
                enteredBy: currentUser.id,
            });
            
            const saved = await mark.save();
            return saved;
        } catch (error) {
            throw error;
        }
    }

    async findAll(filter: MarkFilterDto, currentUser: any): Promise<{ data: Mark[]; pagination: any }> {
        try {
            const query: any = {};
            
            // Apply filters based on User role
            if (currentUser.role === Role.STUDENT) {
                query.studentId = currentUser.id;
            } else if (currentUser.role === Role.FACULTY) {
                // Faculty can see Marks for their department Students
                const facultyStudents = await this.studentProfileModel.find({ departmentId: currentUser.departmentId });
                const studentIds = facultyStudents.map(s => s._id);
                query.studentId = { $in: studentIds };
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
            throw error;
        }
    }

    async findByStudent(studentId: string, filter: MarkFilterDto, currentUser: any): Promise<{ data: Mark[]; pagination: any }> {
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
            throw error;
        }
    }

    async findById(id: string, currentUser: any): Promise<Mark> {
        try {
            const mark = await this.markModel
                .findById(id)
                .populate('studentId', 'name enrollmentNo')
                .populate('examId', 'name type totalMarks')
                .populate('courseId', 'name code')
                .exec();
            
            if (!mark) {
                throw new NotFoundException('Mark not found');
            }
            
            // Verify access rights
            if (currentUser.role === Role.STUDENT && mark.studentId.toString() !== currentUser.id) {
                throw new ForbiddenException('Students can only view their own marks');
            }
            
            if (currentUser.role === Role.FACULTY) {
                const student = await this.studentProfileModel.findById(mark.studentId.toString());
                if (student.departmentId?.toString() !== currentUser.departmentId?.toString()) {
                    throw new ForbiddenException('Faculty can only view marks for students in their own department');
                }
            }
            
            return mark;
        } catch (error) {
            throw error;
        }
    }

    async update(id: string, updateMarkDto: UpdateMarkDto, currentUser: any): Promise<Mark> {
        try {
            const mark = await this.markModel.findById(id);
            if (!mark) {
                throw new NotFoundException('Mark not found');
            }
            
            // Verify access rights
            if (currentUser.role === Role.STUDENT && mark.studentId.toString() !== currentUser.id) {
                throw new ForbiddenException('Students can only update their own marks');
            }
            
            if (currentUser.role === Role.FACULTY) {
                const student = await this.studentProfileModel.findById(mark.studentId.toString());
                if (student.departmentId?.toString() !== currentUser.departmentId?.toString()) {
                    throw new ForbiddenException('Faculty can only update marks for students in their own department');
                }
            }
            
            Object.assign(mark, updateMarkDto);
            return await mark.save();
        } catch (error) {
            throw error;
        }
    }

    async remove(id: string, currentUser: any): Promise<any> {
        try {
            const mark = await this.markModel.findById(id);
            if (!mark) {
                throw new NotFoundException('Mark not found');
            }
            
            // Verify access rights
            if (currentUser.role === Role.STUDENT && mark.studentId.toString() !== currentUser.id) {
                throw new ForbiddenException('Students can only delete their own marks');
            }
            
            if (currentUser.role === Role.FACULTY) {
                const student = await this.studentProfileModel.findById(mark.studentId.toString());
                if (student.departmentId?.toString() !== currentUser.departmentId?.toString()) {
                    throw new ForbiddenException('Faculty can only delete marks for students in their own department');
                }
            }
            
            await this.markModel.findByIdAndDelete(id);
            return { message: 'Mark deleted successfully' };
        } catch (error) {
            throw error;
        }
    }
}
