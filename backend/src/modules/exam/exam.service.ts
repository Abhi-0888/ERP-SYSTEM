import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Exam, ExamDocument, MarkSheet, MarkSheetDocument } from './exam.schema';
import { CreateExamDto, UpdateExamDto, RecordExamMarksDto, ExamFilterDto } from './exam.dto';

@Injectable()
export class ExamService {
    constructor(
        @InjectModel(Exam.name) private examModel: Model<ExamDocument>,
        @InjectModel(MarkSheet.name) private markSheetModel: Model<MarkSheetDocument>,
    ) { }

    async createExam(dto: CreateExamDto): Promise<Exam> {
        try {
            const exam = new this.examModel({
                ...dto,
                examDate: new Date(dto.examDate),
                startTime: new Date(dto.startTime),
                endTime: new Date(dto.endTime),
                status: 'SCHEDULED',
            });
            return await exam.save();
        } catch (error) {
            throw error;
        }
    }

    async findAllExams(filter: ExamFilterDto, page: number = 1, limit: number = 10): Promise<any> {
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
                .populate('courseId', 'name code')
                .populate('academicYearId', 'year')
                .exec();

            const total = await this.examModel.countDocuments(query);

            return {
                data: exams,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            };
        } catch (error) {
            throw error;
        }
    }

    async findExamById(id: string): Promise<Exam> {
        try {
            const exam = await this.examModel
                .findById(id)
                .populate('courseId', 'name code')
                .populate('academicYearId', 'year');

            if (!exam) {
                throw new NotFoundException('Exam not found');
            }
            return exam;
        } catch (error) {
            throw error;
        }
    }

    async updateExam(id: string, dto: UpdateExamDto): Promise<Exam> {
        try {
            const updateData = { ...dto };
            if (dto.examDate) updateData.examDate = new Date(dto.examDate) as any;
            if (dto.startTime) updateData.startTime = new Date(dto.startTime) as any;
            if (dto.endTime) updateData.endTime = new Date(dto.endTime) as any;

            const exam = await this.examModel.findByIdAndUpdate(id, updateData, { new: true });
            if (!exam) {
                throw new NotFoundException('Exam not found');
            }
            return exam;
        } catch (error) {
            throw error;
        }
    }

    async deleteExam(id: string): Promise<any> {
        try {
            const exam = await this.examModel.findByIdAndDelete(id);
            if (!exam) {
                throw new NotFoundException('Exam not found');
            }
            return { message: 'Exam deleted successfully' };
        } catch (error) {
            throw error;
        }
    }

    async recordMarks(examId: string, marksDto: RecordExamMarksDto): Promise<MarkSheet> {
        try {
            const exam = await this.examModel.findById(examId);
            if (!exam) {
                throw new NotFoundException('Exam not found');
            }

            if (marksDto.obtainedMarks > exam.totalMarks) {
                throw new BadRequestException('Marks cannot exceed total marks');
            }

            const existingMarkSheet = await this.markSheetModel.findOne({
                examId,
                studentId: marksDto.studentId,
            });

            if (existingMarkSheet) {
                return await this.markSheetModel.findByIdAndUpdate(
                    existingMarkSheet._id,
                    {
                        marksObtained: marksDto.obtainedMarks,
                        remarks: marksDto.remarks,
                        percentage: (marksDto.obtainedMarks / exam.totalMarks) * 100,
                        isPass: marksDto.obtainedMarks >= exam.passingMarks,
                    },
                    { new: true },
                );
            }

            const markSheet = new this.markSheetModel({
                examId,
                studentId: marksDto.studentId,
                marksObtained: marksDto.obtainedMarks,
                remarks: marksDto.remarks,
                percentage: (marksDto.obtainedMarks / exam.totalMarks) * 100,
                isPass: marksDto.obtainedMarks >= exam.passingMarks,
            });

            return await markSheet.save();
        } catch (error) {
            throw error;
        }
    }

    async getExamResults(examId: string, page: number = 1, limit: number = 10): Promise<any> {
        try {
            const skip = (page - 1) * limit;
            const results = await this.markSheetModel
                .find({ examId })
                .skip(skip)
                .limit(limit)
                .populate('studentId', 'firstName lastName registrationNumber')
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

    async getStudentExamResults(studentId: string, page: number = 1, limit: number = 10): Promise<any> {
        try {
            const skip = (page - 1) * limit;
            const results = await this.markSheetModel
                .find({ studentId })
                .skip(skip)
                .limit(limit)
                .populate('examId', 'name type totalMarks')
                .exec();

            const total = await this.markSheetModel.countDocuments({ studentId });

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
