import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attendance, AttendanceDocument } from './attendance.schema';
import { MarkAttendanceDto, UpdateAttendanceDto, AttendanceFilterDto } from './attendance.dto';

@Injectable()
export class AttendanceService {
    constructor(
        @InjectModel(Attendance.name)
        private attendanceModel: Model<AttendanceDocument>,
    ) { }

    async markAttendance(dto: MarkAttendanceDto): Promise<Attendance> {
        try {
            const attendance = new this.attendanceModel({
                ...dto,
                date: dto.date || new Date(),
            });
            return await attendance.save();
        } catch (error) {
            throw error;
        }
    }

    async markBulkAttendance(dtos: MarkAttendanceDto[]): Promise<any> {
        try {
            const attendanceRecords = dtos.map(dto => ({
                ...dto,
                date: dto.date || new Date(),
            }));

            const result = await this.attendanceModel.insertMany(attendanceRecords);
            return { message: `${result.length} attendance records marked`, count: result.length };
        } catch (error) {
            throw error;
        }
    }

    async findAttendance(filter: AttendanceFilterDto, page: number = 1, limit: number = 10): Promise<any> {
        try {
            const skip = (page - 1) * limit;
            const query: any = {};

            if (filter.studentId) query.studentId = filter.studentId;
            if (filter.courseId) query.courseId = filter.courseId;
            if (filter.status) query.status = filter.status;
            if (filter.startDate && filter.endDate) {
                query.date = {
                    $gte: new Date(filter.startDate),
                    $lte: new Date(filter.endDate),
                };
            }

            const attendance = await this.attendanceModel
                .find(query)
                .skip(skip)
                .limit(limit)
                .sort({ date: -1 })
                .populate('studentId', 'firstName lastName registrationNumber')
                .populate('courseId', 'name code')
                .exec();

            const total = await this.attendanceModel.countDocuments(query);

            return {
                data: attendance,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            };
        } catch (error) {
            throw error;
        }
    }

    async updateAttendance(id: string, dto: UpdateAttendanceDto): Promise<Attendance> {
        try {
            const attendance = await this.attendanceModel.findByIdAndUpdate(id, dto, { new: true });
            if (!attendance) {
                throw new NotFoundException('Attendance record not found');
            }
            return attendance;
        } catch (error) {
            throw error;
        }
    }

    async deleteAttendance(id: string): Promise<any> {
        try {
            const attendance = await this.attendanceModel.findByIdAndDelete(id);
            if (!attendance) {
                throw new NotFoundException('Attendance record not found');
            }
            return { message: 'Attendance record deleted' };
        } catch (error) {
            throw error;
        }
    }

    async getStudentAttendance(studentId: string, courseId?: string): Promise<any> {
        try {
            const query: any = { studentId };
            if (courseId) query.courseId = courseId;

            const records = await this.attendanceModel.find(query).sort({ date: -1 });

            const totalClasses = records.length;
            const presentClasses = records.filter(r => r.status === 'PRESENT').length;
            const absentClasses = records.filter(r => r.status === 'ABSENT').length;
            const attendancePercentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;

            return {
                studentId,
                totalClasses,
                presentClasses,
                absentClasses,
                attendancePercentage: parseFloat(attendancePercentage.toFixed(2)),
                records,
            };
        } catch (error) {
            throw error;
        }
    }

    async getCourseAttendanceSummary(courseId: string): Promise<any> {
        try {
            const stats = await this.attendanceModel.aggregate([
                { $match: { courseId } },
                {
                    $group: {
                        _id: '$studentId',
                        totalClasses: { $sum: 1 },
                        presentCount: {
                            $sum: { $cond: [{ $eq: ['$status', 'PRESENT'] }, 1, 0] },
                        },
                        absentCount: {
                            $sum: { $cond: [{ $eq: ['$status', 'ABSENT'] }, 1, 0] },
                        },
                        lateCount: {
                            $sum: { $cond: [{ $eq: ['$status', 'LATE'] }, 1, 0] },
                        },
                    },
                },
                {
                    $project: {
                        studentId: '$_id',
                        totalClasses: 1,
                        presentCount: 1,
                        absentCount: 1,
                        lateCount: 1,
                        attendancePercentage: {
                            $multiply: [
                                { $divide: ['$presentCount', '$totalClasses'] },
                                100,
                            ],
                        },
                    },
                },
            ]);

            return {
                courseId,
                totalStudents: stats.length,
                averageAttendance: stats.reduce((sum, s) => sum + s.attendancePercentage, 0) / stats.length || 0,
                details: stats,
            };
        } catch (error) {
            throw error;
        }
    }

    async generateAttendanceReport(studentId?: string, startDate?: Date, endDate?: Date): Promise<any> {
        try {
            const query: any = {};
            if (studentId) query.studentId = studentId;
            if (startDate && endDate) {
                query.date = { $gte: startDate, $lte: endDate };
            }

            const stats = await this.attendanceModel.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                    },
                },
            ]);

            return { stats, timestamp: new Date() };
        } catch (error) {
            throw error;
        }
    }
}


