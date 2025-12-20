import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StudentProfile, StudentProfileDocument } from './student-profile.schema';
import { CreateStudentDto, UpdateStudentDto, UpdateStudentEnrollmentDto } from './student.dto';

@Injectable()
export class StudentService {
    constructor(
        @InjectModel(StudentProfile.name)
        private studentProfileModel: Model<StudentProfileDocument>,
    ) { }

    async createStudent(dto: CreateStudentDto): Promise<StudentProfile> {
        try {
            const existingStudent = await this.studentProfileModel.findOne({
                registrationNumber: dto.registrationNumber,
            });
            if (existingStudent) {
                throw new BadRequestException('Registration number already exists');
            }

            const student = new this.studentProfileModel({
                ...dto,
                dateOfBirth: new Date(dto.dateOfBirth),
                enrollmentDate: new Date(),
                status: dto.status || 'ACTIVE',
            });

            return await student.save();
        } catch (error) {
            throw error;
        }
    }

    async findAll(page: number = 1, limit: number = 10, filters?: any): Promise<any> {
        try {
            const skip = (page - 1) * limit;
            const query = filters || {};

            const students = await this.studentProfileModel
                .find(query)
                .skip(skip)
                .limit(limit)
                .populate('programId', 'name code')
                .populate('academicYearId', 'year')
                .exec();

            const total = await this.studentProfileModel.countDocuments(query);

            return {
                data: students,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            };
        } catch (error) {
            throw error;
        }
    }

    async findById(id: string): Promise<StudentProfile> {
        try {
            const student = await this.studentProfileModel
                .findById(id)
                .populate('programId', 'name code')
                .populate('academicYearId', 'year');

            if (!student) {
                throw new NotFoundException('Student not found');
            }
            return student;
        } catch (error) {
            throw error;
        }
    }

    async findByRegistrationNumber(registrationNumber: string): Promise<StudentProfile> {
        try {
            const student = await this.studentProfileModel.findOne({ registrationNumber });
            if (!student) {
                throw new NotFoundException('Student not found');
            }
            return student;
        } catch (error) {
            throw error;
        }
    }

    async updateStudent(id: string, dto: UpdateStudentDto): Promise<StudentProfile> {
        try {
            const student = await this.studentProfileModel.findByIdAndUpdate(id, dto, { new: true });
            if (!student) {
                throw new NotFoundException('Student not found');
            }
            return student;
        } catch (error) {
            throw error;
        }
    }

    async updateEnrollment(id: string, dto: UpdateStudentEnrollmentDto): Promise<StudentProfile> {
        try {
            const student = await this.studentProfileModel.findByIdAndUpdate(
                id,
                {
                    programId: dto.programId,
                    academicYearId: dto.academicYearId,
                    semester: dto.semester,
                    enrollmentDate: new Date(),
                },
                { new: true },
            );
            if (!student) {
                throw new NotFoundException('Student not found');
            }
            return student;
        } catch (error) {
            throw error;
        }
    }

    async deleteStudent(id: string): Promise<any> {
        try {
            const student = await this.studentProfileModel.findByIdAndDelete(id);
            if (!student) {
                throw new NotFoundException('Student not found');
            }
            return { message: 'Student deleted successfully' };
        } catch (error) {
            throw error;
        }
    }

    async updateStudentStatus(id: string, status: string): Promise<StudentProfile> {
        try {
            const student = await this.studentProfileModel.findByIdAndUpdate(id, { status }, { new: true });
            if (!student) {
                throw new NotFoundException('Student not found');
            }
            return student;
        } catch (error) {
            throw error;
        }
    }

    async getStudentsByProgram(programId: string, page: number = 1, limit: number = 10): Promise<any> {
        try {
            const skip = (page - 1) * limit;
            const students = await this.studentProfileModel
                .find({ programId })
                .skip(skip)
                .limit(limit)
                .exec();

            const total = await this.studentProfileModel.countDocuments({ programId });

            return {
                data: students,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            };
        } catch (error) {
            throw error;
        }
    }

    async getStudentsByAcademicYear(academicYearId: string, page: number = 1, limit: number = 10): Promise<any> {
        try {
            const skip = (page - 1) * limit;
            const students = await this.studentProfileModel
                .find({ academicYearId })
                .skip(skip)
                .limit(limit)
                .exec();

            const total = await this.studentProfileModel.countDocuments({ academicYearId });

            return {
                data: students,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            };
        } catch (error) {
            throw error;
        }
    }

    async generateStudentReport(programId?: string, academicYearId?: string): Promise<any> {
        try {
            const filter: any = {};
            if (programId) filter.programId = programId;
            if (academicYearId) filter.academicYearId = academicYearId;

            const totalStudents = await this.studentProfileModel.countDocuments(filter);
            const activeStudents = await this.studentProfileModel.countDocuments({ ...filter, status: 'ACTIVE' });
            const suspendedStudents = await this.studentProfileModel.countDocuments({ ...filter, status: 'SUSPENDED' });
            const graduatedStudents = await this.studentProfileModel.countDocuments({ ...filter, status: 'GRADUATED' });

            return {
                totalStudents,
                activeStudents,
                suspendedStudents,
                graduatedStudents,
                timestamp: new Date(),
            };
        } catch (error) {
            throw error;
        }
    }

    async findOne(id: string): Promise<StudentProfile> {
        return this.studentProfileModel
            .findById(id)
            .populate('userId programId departmentId academicYearId enrolledCourses')
            .exec();
    }

    async findByUserId(userId: string): Promise<StudentProfile> {
        return this.studentProfileModel
            .findOne({ userId })
            .populate('userId programId departmentId academicYearId enrolledCourses')
            .exec();
    }

    async findByEnrollmentNo(enrollmentNo: string): Promise<StudentProfile> {
        return this.studentProfileModel
            .findOne({ enrollmentNo })
            .populate('userId programId departmentId academicYearId enrolledCourses')
            .exec();
    }

    async update(id: string, dto: any): Promise<StudentProfile> {
        return this.studentProfileModel
            .findByIdAndUpdate(id, dto, { new: true })
            .exec();
    }

    async enrollCourse(studentId: string, courseId: string): Promise<StudentProfile> {
        return this.studentProfileModel
            .findByIdAndUpdate(
                studentId,
                { $addToSet: { enrolledCourses: courseId } },
                { new: true }
            )
            .exec();
    }

    async dropCourse(studentId: string, courseId: string): Promise<StudentProfile> {
        return this.studentProfileModel
            .findByIdAndUpdate(
                studentId,
                { $pull: { enrolledCourses: courseId } },
                { new: true }
            )
            .exec();
    }

    async findByBatch(batch: string, programId?: string): Promise<StudentProfile[]> {
        const filter: any = { batch };
        if (programId) filter.programId = programId;
        return this.studentProfileModel.find(filter).populate('userId programId').exec();
    }

    async findByDepartment(departmentId: string): Promise<StudentProfile[]> {
        return this.studentProfileModel
            .find({ departmentId })
            .populate('userId programId')
            .exec();
    }

    async promoteToNextSemester(studentIds: string[]): Promise<any> {
        return this.studentProfileModel.updateMany(
            { _id: { $in: studentIds } },
            { $inc: { currentSemester: 1 } }
        );
    }
}
