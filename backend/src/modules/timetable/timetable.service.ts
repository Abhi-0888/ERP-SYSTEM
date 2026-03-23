import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Timetable, TimetableDocument } from './timetable.schema';
import { CreateTimetableDto, UpdateTimetableDto, CreateTimetableSlotDto, UpdateTimetableSlotDto } from './timetable.dto';
import { Role } from '../../common/enums/role.enum';
import { StudentProfile, StudentProfileDocument } from '../student/student-profile.schema';

@Injectable()
export class TimetableService {
    constructor(
        @InjectModel(Timetable.name)
        private timetableModel: Model<TimetableDocument>,
        @InjectModel(StudentProfile.name)
        private studentProfileModel: Model<StudentProfileDocument>,
    ) { }

    async createTimetable(dto: CreateTimetableDto, currentUser: any): Promise<Timetable> {
        try {
            const universityId = currentUser.role === Role.SUPER_ADMIN ? (dto as any).universityId : currentUser.universityId;
            if (!universityId) throw new BadRequestException('University ID is required');

            const timetable = new this.timetableModel({
                ...dto,
                universityId,
                status: dto.status || 'DRAFT',
                slots: [],
            });
            return await timetable.save();
        } catch (error) {
            throw error;
        }
    }

    async findAllTimetables(currentUser: any, page: number = 1, limit: number = 10, filters?: any): Promise<any> {
        try {
            const skip = (page - 1) * limit;
            const query: any = filters || {};

            // Isolation
            if (currentUser.role !== Role.SUPER_ADMIN) {
                query.universityId = currentUser.universityId;
            }

            const timetables = await this.timetableModel
                .find(query)
                .skip(skip)
                .limit(limit)
                .populate('academicYearId', 'year')
                .populate('programId', 'name code')
                .exec();

            const total = await this.timetableModel.countDocuments(query);

            return {
                data: timetables,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            };
        } catch (error) {
            throw error;
        }
    }

    async findTimetableById(id: string, currentUser: any): Promise<TimetableDocument> {
        try {
            const timetable = await this.timetableModel
                .findById(id)
                .populate('academicYearId', 'year')
                .populate('programId', 'name code')
                .populate('slots.courseId', 'name code');

            if (!timetable) {
                throw new NotFoundException('Timetable not found');
            }

            // Isolation
            if (currentUser.role !== Role.SUPER_ADMIN && timetable.universityId?.toString() !== currentUser.universityId.toString()) {
                throw new ForbiddenException('Access denied');
            }

            return timetable;
        } catch (error) {
            throw error;
        }
    }

    async updateTimetable(id: string, dto: UpdateTimetableDto, currentUser: any): Promise<TimetableDocument> {
        try {
            await this.findTimetableById(id, currentUser);
            return this.timetableModel.findByIdAndUpdate(id, dto, { new: true });
        } catch (error) {
            throw error;
        }
    }

    async deleteTimetable(id: string, currentUser: any): Promise<any> {
        try {
            await this.findTimetableById(id, currentUser);
            const timetable = await this.timetableModel.findByIdAndDelete(id);
            if (!timetable) {
                throw new NotFoundException('Timetable not found');
            }
            return { message: 'Timetable deleted successfully' };
        } catch (error) {
            throw error;
        }
    }

    async addSlot(timetableId: string, slotDto: CreateTimetableSlotDto, currentUser: any): Promise<TimetableDocument> {
        try {
            const timetable = await this.findTimetableById(timetableId, currentUser);

            // optional: check for conflicts
            const conflict = await this.checkSlotConflict(timetableId, slotDto);
            if (conflict) throw new BadRequestException('Slot conflict detected');

            timetable.slots.push(slotDto as any);
            await timetable.save();
            return timetable;
        } catch (error) {
            throw error;
        }
    }

    async updateSlot(timetableId: string, slotId: string, slotDto: UpdateTimetableSlotDto, currentUser: any): Promise<TimetableDocument> {
        try {
            const timetable = await this.findTimetableById(timetableId, currentUser);

            // conflict check
            const conflict = await this.checkSlotConflict(timetableId, slotDto as any);
            if (conflict) throw new BadRequestException('Slot conflict detected');

            const slot = (timetable.slots as any).id(slotId);
            if (!slot) throw new NotFoundException('Slot not found');

            Object.assign(slot, slotDto);
            await timetable.save();
            return timetable;
        } catch (error) {
            throw error;
        }
    }

    async deleteSlot(timetableId: string, _slotId: string, currentUser: any): Promise<any> {
        try {
            const timetable = await this.findTimetableById(timetableId, currentUser);

            const slot = (timetable.slots as any).id(_slotId);
            if (!slot) throw new NotFoundException('Slot not found');

            slot.remove();
            await timetable.save();
            return { message: 'Slot deleted successfully', timetable };
        } catch (error) {
            throw error;
        }
    }

    async getTimetableForStudent(studentIdOrUserId: string, _currentUser: any): Promise<TimetableDocument> {
        try {
            // Find student profile
            let student = await this.studentProfileModel.findById(studentIdOrUserId);
            if (!student) {
                student = await this.studentProfileModel.findOne({ userId: studentIdOrUserId });
            }

            if (!student) {
                throw new NotFoundException('Student profile not found');
            }

            // Find timetable matching student's academic context
            const timetable = await this.timetableModel.findOne({
                programId: student.programId,
                semester: student.currentSemester,
                academicYearId: student.academicYearId,
                status: 'PUBLISHED',
            }).populate('slots.courseId', 'name code')
              .populate('slots.facultyId', 'username email');

            if (!timetable) {
                throw new NotFoundException('No published timetable found for your program and semester');
            }

            return timetable;
        } catch (error) {
            throw error;
        }
    }

    private async checkSlotConflict(_timetableId: string, _newSlot: CreateTimetableSlotDto): Promise<boolean> {
        try {
            const targetTimetable = await this.timetableModel.findById(_timetableId);
            if (!targetTimetable) return false;

            const universityId = (targetTimetable as any).universityId;
            if (!universityId) return false;

            // Find ALL active timetables in the same university
            const allTimetables = await this.timetableModel.find({
                universityId,
                isActive: { $ne: false }
            });

            const newStart = this.timeToMinutes(_newSlot.startTime);
            const newEnd = this.timeToMinutes(_newSlot.endTime);

            for (const tt of allTimetables) {
                const slots = (tt as any).slots || [];
                for (const s of slots) {
                    // Normalize day comparison
                    if (s.dayOfWeek?.toUpperCase() !== _newSlot.dayOfWeek?.toUpperCase()) continue;

                    const sStart = this.timeToMinutes(s.startTime);
                    const sEnd = this.timeToMinutes(s.endTime);

                    // Standard overlap check: Max(S1, S2) < Min(E1, E2)
                    const overlaps = Math.max(sStart, newStart) < Math.min(sEnd, newEnd);
                    if (!overlaps) continue;

                    // 1. Instructor Conflict (across all departments)
                    if (s.instructor && _newSlot.instructor && String(s.instructor) === String(_newSlot.instructor)) {
                        return true;
                    }

                    // 2. Classroom Conflict (shared resources)
                    if (s.classroom && _newSlot.classroom && s.classroom.trim() === _newSlot.classroom.trim()) {
                        return true;
                    }

                    // 3. Batch Conflict (if it's the same student group)
                    if (String(tt._id) === String(_timetableId)) {
                        // In the same timetable, we can't have two sessions at once for the same students
                        return true;
                    }
                }
            }
            return false;
        } catch (error) {
            console.error('Error in conflict check:', error);
            return false;
        }
    }

    private timeToMinutes(time: string): number {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    async getStudentTimetable(studentId: string, academicYearId?: string): Promise<any> {
        try {
            const query: any = {};
            if (academicYearId) query.academicYearId = academicYearId;
            const timetables = await this.timetableModel.find(query);
            return { studentId, timetables };
        } catch (error) {
            throw error;
        }
    }

    async getInstructorTimetable(instructorId: string): Promise<any> {
        try {
            const timetables = await this.timetableModel.find({
                facultyId: instructorId,
            });
            return { instructorId, timetables };
        } catch (error) {
            throw error;
        }
    }
}
