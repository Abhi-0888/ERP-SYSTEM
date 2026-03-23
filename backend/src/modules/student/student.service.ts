import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StudentProfile, StudentProfileDocument } from './student-profile.schema';
import { CreateStudentDto, UpdateStudentDto, UpdateStudentEnrollmentDto } from './student.dto';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class StudentService {
    constructor(
        @InjectModel(StudentProfile.name)
        private studentProfileModel: Model<StudentProfileDocument>,
    ) { }

    async createStudent(dto: CreateStudentDto, _currentUser: any): Promise<StudentProfile> {
        try {
            const existingStudent = await this.studentProfileModel.findOne({
                enrollmentNo: dto.registrationNumber, // Adjusted field name
            });
            if (existingStudent) {
                throw new BadRequestException('Enrollment number already exists');
            }

            const student = new this.studentProfileModel({
                ...dto,
                enrollmentNo: dto.registrationNumber,
                dateOfBirth: new Date(dto.dateOfBirth),
                admissionDate: new Date(),
                status: dto.status || 'Active',
            });

            return await student.save();
        } catch (error) {
            throw error;
        }
    }

    async findAll(currentUser: any, page: number = 1, limit: number = 10, filters?: any): Promise<any> {
        try {
            const skip = (page - 1) * limit;
            const query: any = filters || {};

            // Isolation: Filter by department's university if not super admin
            // This requires a more complex join or pre-filtering departments
            // For now, assume filters include departmentId if needed
            
            const students = await this.studentProfileModel
                .find(query)
                .skip(skip)
                .limit(limit)
                .populate('userId', 'username email')
                .populate('programId', 'name code')
                .populate('departmentId', 'name code universityId')
                .populate('academicYearId', 'year')
                .exec();

            const total = await this.studentProfileModel.countDocuments(query);

            // Filter results in memory for isolation if query didn't handle it
            const filteredStudents = currentUser.role === Role.SUPER_ADMIN 
                ? students 
                : students.filter(s => (s.departmentId as any)?.universityId?.toString() === currentUser.universityId.toString());

            return {
                data: filteredStudents,
                pagination: { page, limit, total: filteredStudents.length, pages: Math.ceil(total / limit) },
            };
        } catch (error) {
            throw error;
        }
    }

    async findById(id: string, currentUser: any): Promise<StudentProfile> {
        try {
            const student = await this.studentProfileModel
                .findById(id)
                .populate('userId', 'username email')
                .populate('programId', 'name code')
                .populate('departmentId', 'name code universityId')
                .populate('academicYearId', 'year');

            if (!student) {
                throw new NotFoundException('Student not found');
            }

            // Isolation check
            const dept = student.departmentId as any;
            if (currentUser.role !== Role.SUPER_ADMIN && dept?.universityId?.toString() !== currentUser.universityId.toString()) {
                throw new ForbiddenException('Access denied: You can only access students within your university');
            }

            return student;
        } catch (error) {
            throw error;
        }
    }

    async findByRegistrationNumber(enrollmentNo: string, currentUser: any): Promise<StudentProfile> {
        try {
            const student = await this.studentProfileModel.findOne({ enrollmentNo })
                .populate('departmentId', 'universityId');
            
            if (!student) {
                throw new NotFoundException('Student not found');
            }

            const dept = student.departmentId as any;
            if (currentUser.role !== Role.SUPER_ADMIN && dept?.universityId?.toString() !== currentUser.universityId.toString()) {
                throw new ForbiddenException('Access denied');
            }

            return student;
        } catch (error) {
            throw error;
        }
    }

    async updateStudent(id: string, dto: UpdateStudentDto, currentUser: any): Promise<StudentProfile> {
        try {
            await this.findById(id, currentUser);
            const student = await this.studentProfileModel.findByIdAndUpdate(id, dto, { new: true });
            return student;
        } catch (error) {
            throw error;
        }
    }

    async deleteStudent(id: string, currentUser: any): Promise<any> {
        try {
            await this.findById(id, currentUser);
            const student = await this.studentProfileModel.findByIdAndDelete(id);
            if (!student) {
                throw new NotFoundException('Student not found');
            }
            return { message: 'Student deleted successfully' };
        } catch (error) {
            throw error;
        }
    }

    async updateStudentStatus(id: string, status: string, currentUser: any): Promise<StudentProfile> {
        try {
            await this.findById(id, currentUser);
            return this.studentProfileModel.findByIdAndUpdate(id, { status }, { new: true });
        } catch (error) {
            throw error;
        }
    }

    async updateEnrollment(id: string, dto: UpdateStudentEnrollmentDto, currentUser: any): Promise<StudentProfile> {
        try {
            await this.findById(id, currentUser);
            return this.studentProfileModel.findByIdAndUpdate(id, dto, { new: true });
        } catch (error) {
            throw error;
        }
    }

    async getStudentsByProgram(programId: string, currentUser: any, page: number = 1, limit: number = 10): Promise<any> {
        try {
            await this.findProgramByIdFromAcademic(programId, currentUser);
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

    async getStudentsByCourse(courseId: string, _currentUser: any): Promise<StudentProfile[]> {
        try {
            // Isolation: assume if we can find the course (implicitly), we can find students
            // For now, simple filter
            return this.studentProfileModel.find({
                enrolledCourses: courseId
            }).populate('userId', 'username email').exec();
        } catch (error) {
            throw error;
        }
    }

    // Helper to verify program from academic module
    private async findProgramByIdFromAcademic(_programId: string, _currentUser: any) {
        // This is a placeholder for actual cross-module call or model check
        // For now, we assume if the student exists and is accessible, the program is too.
        return true;
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
            const activeStudents = await this.studentProfileModel.countDocuments({ ...filter, status: 'Active' });
            const suspendedStudents = await this.studentProfileModel.countDocuments({ ...filter, status: 'Suspended' });
            const graduatedStudents = await this.studentProfileModel.countDocuments({ ...filter, status: 'Graduated' });

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
