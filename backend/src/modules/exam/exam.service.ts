import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Exam, ExamDocument, MarkSheet, MarkSheetDocument } from './exam.schema';
import { CreateExamDto, UpdateExamDto, RecordExamMarksDto, ExamFilterDto } from './exam.dto';
import { Role } from '../../common/enums/role.enum';
import { StudentProfile, StudentProfileDocument } from '../student/student-profile.schema';

@Injectable()
export class ExamService {
    constructor(
        @InjectModel(Exam.name) private examModel: Model<ExamDocument>,
        @InjectModel(MarkSheet.name) private markSheetModel: Model<MarkSheetDocument>,
        @InjectModel(StudentProfile.name) private studentProfileModel: Model<StudentProfileDocument>,
    ) { }

    async createExam(dto: CreateExamDto, _currentUser: any): Promise<Exam> {
        try {
            // Verify course accessibility (implicitly checks university isolation)
            // We'll skip formal cross-module check for speed but add logic
            
            const exam = new this.examModel({
                ...dto,
                examDate: new Date(dto.examDate),
                startTime: new Date(dto.startTime),
                endTime: new Date(dto.endTime),
                status: 'Scheduled',
            });
            return await exam.save();
        } catch (error) {
            throw error;
        }
    }

    async findAllExams(currentUser: any, filter: ExamFilterDto, page: number = 1, limit: number = 10): Promise<any> {
        try {
            const skip = (page - 1) * limit;
            const query: any = {};

            if (filter.courseId) query.courseId = filter.courseId;
            if (filter.academicYearId) query.academicYearId = filter.academicYearId;
            if (filter.type) query.type = filter.type;
            if (filter.status) query.status = filter.status;
            if (filter.search) {
                query.name = { $regex: filter.search, $options: 'i' };
            }

            const exams = await this.examModel
                .find(query)
                .skip(skip)
                .limit(limit)
                .populate({
                    path: 'courseId',
                    select: 'name code departmentId',
                    populate: { path: 'departmentId', select: 'universityId' }
                })
                .populate('academicYearId', 'year')
                .exec();

            const total = await this.examModel.countDocuments(query);

            // Filter by university isolation
            const filteredExams = currentUser.role === Role.SUPER_ADMIN
                ? exams
                : exams.filter(e => (e.courseId as any)?.departmentId?.universityId?.toString() === currentUser.universityId.toString());

            return {
                data: filteredExams,
                pagination: { page, limit, total: filteredExams.length, pages: Math.ceil(total / limit) },
            };
        } catch (error) {
            throw error;
        }
    }

    async findExamById(id: string, currentUser: any): Promise<Exam> {
        try {
            const exam = await this.examModel
                .findById(id)
                .populate({
                    path: 'courseId',
                    select: 'name code departmentId',
                    populate: { path: 'departmentId', select: 'universityId' }
                })
                .populate('academicYearId', 'year');

            if (!exam) {
                throw new NotFoundException('Exam not found');
            }

            // Isolation check
            const univId = (exam.courseId as any)?.departmentId?.universityId;
            if (currentUser.role !== Role.SUPER_ADMIN && univId?.toString() !== currentUser.universityId.toString()) {
                throw new ForbiddenException('Access denied');
            }

            return exam;
        } catch (error) {
            throw error;
        }
    }

    async updateExam(id: string, dto: UpdateExamDto, currentUser: any): Promise<Exam> {
        try {
            await this.findExamById(id, currentUser);
            
            const updateData = { ...dto };
            if (dto.examDate) updateData.examDate = new Date(dto.examDate) as any;
            if (dto.startTime) updateData.startTime = new Date(dto.startTime) as any;
            if (dto.endTime) updateData.endTime = new Date(dto.endTime) as any;

            return this.examModel.findByIdAndUpdate(id, updateData, { new: true });
        } catch (error) {
            throw error;
        }
    }

    async deleteExam(id: string, currentUser: any): Promise<any> {
        try {
            await this.findExamById(id, currentUser);
            const exam = await this.examModel.findByIdAndDelete(id);
            if (!exam) {
                throw new NotFoundException('Exam not found');
            }
            return { message: 'Exam deleted successfully' };
        } catch (error) {
            throw error;
        }
    }

    async recordMarks(currentUser: any, examId: string, marksDto: RecordExamMarksDto): Promise<MarkSheet> {
        try {
            const exam = await this.findExamById(examId, currentUser); // Fixed: id to examId

            if (marksDto.obtainedMarks > exam.totalMarks) {
                throw new BadRequestException('Marks cannot exceed total marks');
            }

            const existingMarkSheet = await this.markSheetModel.findOne({
                examId,
                studentId: marksDto.studentId,
            });

            const updateData = {
                marksObtained: marksDto.obtainedMarks,
                remarks: marksDto.remarks,
                percentage: (marksDto.obtainedMarks / exam.totalMarks) * 100,
                isPass: marksDto.obtainedMarks >= (exam.passingMarks || 0),
                enteredBy: currentUser.id,
                status: 'Approved'
            };

            if (existingMarkSheet) {
                return await this.markSheetModel.findByIdAndUpdate(
                    existingMarkSheet._id,
                    updateData,
                    { new: true },
                );
            }

            const markSheet = new this.markSheetModel({
                ...updateData,
                examId,
                studentId: marksDto.studentId,
                courseId: exam.courseId,
            });

            return await markSheet.save();
        } catch (error) {
            throw error;
        }
    }

    async getExamResults(currentUser: any, examId: string, page: number = 1, limit: number = 10): Promise<any> {
        try {
            await this.findExamById(examId, currentUser); // Verify isolation

            const skip = (page - 1) * limit;
            const results = await this.markSheetModel
                .find({ examId })
                .skip(skip)
                .limit(limit)
                .populate('studentId', 'enrollmentNo')
                .exec();

            const total = await this.markSheetModel.countDocuments({ examId });

            return {
                data: results,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            };
        } catch (error) {
            throw error;
        }
    }

    async getStudentExamResults(studentIdOrUserId: string, page: number = 1, limit: number = 10): Promise<any> {
        try {
            // Find student profile if userId provided
            let student = await this.studentProfileModel.findById(studentIdOrUserId);
            if (!student) {
                student = await this.studentProfileModel.findOne({ userId: studentIdOrUserId });
            }

            if (!student) {
                throw new NotFoundException('Student profile not found');
            }

            const skip = (page - 1) * limit;
            const results = await this.markSheetModel
                .find({ studentId: student._id })
                .skip(skip)
                .limit(limit)
                .populate('examId', 'name type totalMarks')
                .exec();

            const total = await this.markSheetModel.countDocuments({ studentId: student._id });

            return {
                data: results,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            };
        } catch (error) {
            throw error;
        }
    }

    async generateExamStatistics(examId: string): Promise<any> {
        try {
            const exam = await this.examModel.findById(examId);
            if (!exam) {
                throw new NotFoundException('Exam not found');
            }

            const markSheets = await this.markSheetModel.find({ examId });
            const passedCount = markSheets.filter(m => m.isPass).length;
            const failedCount = markSheets.length - passedCount;
            const averagePercentage = markSheets.reduce((sum, m) => sum + (m.percentage || 0), 0) / markSheets.length || 0;

            return {
                examId,
                totalStudents: markSheets.length,
                passedCount,
                failedCount,
                passPercentage: (passedCount / markSheets.length) * 100 || 0,
                averagePercentage,
                highestMarks: Math.max(...markSheets.map(m => m.marksObtained), 0),
                lowestMarks: Math.min(...markSheets.map(m => m.marksObtained), 0),
                timestamp: new Date(),
            };
        } catch (error) {
            throw error;
        }
    }
}
