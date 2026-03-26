import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AcademicYear, AcademicYearDocument } from './academic-year.schema';
import { Department, DepartmentDocument } from './department.schema';
import { Program, ProgramDocument } from './program.schema';
import { Course, CourseDocument } from './course.schema';
import { CreateAcademicYearDto, UpdateAcademicYearDto, CreateDepartmentDto, UpdateDepartmentDto, CreateProgramDto, UpdateProgramDto, CreateCourseDto, UpdateCourseDto } from './academic.dto';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class AcademicService {
    constructor(
        @InjectModel(AcademicYear.name) private academicYearModel: Model<AcademicYearDocument>,
        @InjectModel(Department.name) private departmentModel: Model<DepartmentDocument>,
        @InjectModel(Program.name) private programModel: Model<ProgramDocument>,
        @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    ) { }

    // ============= ACADEMIC YEAR METHODS =============

    async createAcademicYear(dto: CreateAcademicYearDto): Promise<AcademicYear> {
        try {
            const existingYear = await this.academicYearModel.findOne({ year: dto.year });
            if (existingYear) {
                throw new BadRequestException('Academic year already exists');
            }

            const academicYear = new this.academicYearModel({
                ...dto,
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate),
                isActive: true,
            });

            return await academicYear.save();
        } catch (error) {
            throw error;
        }
    }

    async findAllAcademicYears(page: number = 1, limit: number = 10): Promise<any> {
        try {
            const skip = (page - 1) * limit;
            const years = await this.academicYearModel
                .find()
                .skip(skip)
                .limit(limit)
                .sort({ startDate: -1 })
                .exec();

            const total = await this.academicYearModel.countDocuments();

            return {
                data: years,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            };
        } catch (error) {
            throw error;
        }
    }

    async findAcademicYearById(id: string): Promise<AcademicYear> {
        try {
            const year = await this.academicYearModel.findById(id);
            if (!year) {
                throw new NotFoundException('Academic year not found');
            }
            return year;
        } catch (error) {
            throw error;
        }
    }

    async updateAcademicYear(id: string, dto: UpdateAcademicYearDto): Promise<AcademicYear> {
        try {
            const updateData = { ...dto };
            if (dto.startDate) updateData.startDate = new Date(dto.startDate) as any;
            if (dto.endDate) updateData.endDate = new Date(dto.endDate) as any;

            const year = await this.academicYearModel.findByIdAndUpdate(id, updateData, { new: true });
            if (!year) {
                throw new NotFoundException('Academic year not found');
            }
            return year;
        } catch (error) {
            throw error;
        }
    }

    async setActiveAcademicYear(id: string): Promise<any> {
        try {
            // Deactivate all others
            await this.academicYearModel.updateMany({}, { isActive: false });
            // Activate the selected one
            const year = await this.academicYearModel.findByIdAndUpdate(id, { isActive: true }, { new: true });
            if (!year) {
                throw new NotFoundException('Academic year not found');
            }
            return { message: 'Academic year set as active', data: year };
        } catch (error) {
            throw error;
        }
    }

    async getActiveAcademicYear(): Promise<AcademicYear> {
        try {
            const year = await this.academicYearModel.findOne({ isActive: true });
            if (!year) {
                throw new NotFoundException('No active academic year found');
            }
            return year;
        } catch (error) {
            throw error;
        }
    }

    // ============= DEPARTMENT METHODS =============

    async createDepartment(dto: CreateDepartmentDto, currentUser: any): Promise<Department> {
        try {
            // Isolation: Ensure universityId matches user's university if not super admin
            const universityId = currentUser.role === Role.SUPER_ADMIN ? dto.universityId : currentUser.universityId;

            if (!universityId) {
                throw new BadRequestException('University ID is required');
            }

            const createdDept = new this.departmentModel({
                ...dto,
                universityId,
            });
            return createdDept.save();
        } catch (error) {
            throw error;
        }
    }

    async findAllDepartments(currentUser: any, page: number = 1, limit: number = 10): Promise<any> {
        try {
            const skip = (page - 1) * limit;
            const filter: any = {};

            // Isolation: Filter by user's university if not super admin
            if (currentUser.role !== Role.SUPER_ADMIN) {
                filter.universityId = currentUser.universityId;
            }

            const departments = await this.departmentModel
                .find(filter)
                .skip(skip)
                .limit(limit)
                .populate('hodId', 'username email')
                .exec();

            const total = await this.departmentModel.countDocuments(filter);

            return {
                data: departments,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            };
        } catch (error) {
            throw error;
        }
    }

    async findDepartmentById(id: string, currentUser: any): Promise<Department> {
        try {
            const dept = await this.departmentModel.findById(id).populate('hodId', 'username email');
            if (!dept) {
                throw new NotFoundException('Department not found');
            }

            // Isolation check
            if (currentUser.role !== Role.SUPER_ADMIN && dept.universityId.toString() !== currentUser.universityId.toString()) {
                throw new ForbiddenException('Access denied: You can only access departments within your university');
            }

            return dept;
        } catch (error) {
            throw error;
        }
    }

    async updateDepartment(id: string, dto: UpdateDepartmentDto, currentUser: any): Promise<Department> {
        try {
            await this.findDepartmentById(id, currentUser);
            
            return this.departmentModel.findByIdAndUpdate(id, dto, { new: true }).populate('hodId', 'username email');
        } catch (error) {
            throw error;
        }
    }

    async deleteDepartment(id: string, currentUser: any): Promise<any> {
        try {
            await this.findDepartmentById(id, currentUser);
            
            const result = await this.departmentModel.findByIdAndDelete(id);
            if (!result) {
                throw new NotFoundException('Department not found');
            }
            return { message: 'Department deleted successfully' };
        } catch (error) {
            throw error;
        }
    }

    // ============= PROGRAM METHODS =============

    async createProgram(dto: CreateProgramDto, currentUser: any): Promise<Program> {
        try {
            // Check if department belongs to the same university
            await this.findDepartmentById(dto.departmentId, currentUser);

            const existingProgram = await this.programModel.findOne({ code: dto.code });
            if (existingProgram) {
                throw new BadRequestException('Program with this code already exists');
            }

            const program = new this.programModel(dto);
            return await program.save();
        } catch (error) {
            throw error;
        }
    }

    async findAllPrograms(currentUser: any, departmentId?: string, page: number = 1, limit: number = 10): Promise<any> {
        try {
            const skip = (page - 1) * limit;
            const filter: any = {};

            if (departmentId) {
                await this.findDepartmentById(departmentId, currentUser);
                filter.departmentId = departmentId;
            } else if (currentUser.role !== Role.SUPER_ADMIN) {
                const depts = await this.departmentModel.find({ universityId: currentUser.universityId }).select('_id').exec();
                filter.departmentId = { $in: depts.map(d => d._id) };
            }

            const programs = await this.programModel
                .find(filter)
                .skip(skip)
                .limit(limit)
                .populate('departmentId', 'name code')
                .exec();

            const total = await this.programModel.countDocuments(filter);

            return {
                data: programs,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            };
        } catch (error) {
            throw error;
        }
    }

    async findProgramById(id: string, currentUser: any): Promise<Program> {
        try {
            const program = await this.programModel.findById(id).populate('departmentId', 'name code universityId');
            if (!program) {
                throw new NotFoundException('Program not found');
            }

            const dept = program.departmentId as any;
            if (currentUser.role !== Role.SUPER_ADMIN && dept.universityId.toString() !== currentUser.universityId.toString()) {
                throw new ForbiddenException('Access denied: You can only access programs within your university');
            }

            return program;
        } catch (error) {
            throw error;
        }
    }

    async updateProgram(id: string, dto: UpdateProgramDto, currentUser: any): Promise<Program> {
        try {
            await this.findProgramById(id, currentUser);
            return this.programModel.findByIdAndUpdate(id, dto, { new: true }).populate('departmentId', 'name code');
        } catch (error) {
            throw error;
        }
    }

    async deleteProgram(id: string, currentUser: any): Promise<any> {
        try {
            await this.findProgramById(id, currentUser);
            const result = await this.programModel.findByIdAndDelete(id);
            if (!result) {
                throw new NotFoundException('Program not found');
            }
            return { message: 'Program deleted successfully' };
        } catch (error) {
            throw error;
        }
    }

    // ============= COURSE METHODS =============

    async createCourse(dto: CreateCourseDto, currentUser: any): Promise<Course> {
        try {
            await this.findDepartmentById(dto.departmentId, currentUser);

            const existingCourse = await this.courseModel.findOne({ code: dto.code, semester: dto.semester });
            if (existingCourse) {
                throw new BadRequestException('Course with this code already exists for this semester');
            }

            const course = new this.courseModel(dto);
            return await course.save();
        } catch (error) {
            throw error;
        }
    }

    async findAllCourses(currentUser: any, programId?: string, semester?: number, page: number = 1, limit: number = 10): Promise<any> {
        try {
            const skip = (page - 1) * limit;
            const filter: any = {};

            if (programId) {
                await this.findProgramById(programId, currentUser);
                filter.programId = programId;
            } else if (currentUser.role !== Role.SUPER_ADMIN) {
                const depts = await this.departmentModel.find({ universityId: currentUser.universityId }).select('_id').exec();
                filter.departmentId = { $in: depts.map(d => d._id) };
            }

            if (semester) filter.semester = semester;

            const courses = await this.courseModel
                .find(filter)
                .skip(skip)
                .limit(limit)
                .populate('programId', 'name code')
                .populate('departmentId', 'name code')
                .populate('facultyId', 'username email name')
                .exec();

            const total = await this.courseModel.countDocuments(filter);

            return {
                data: courses,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            };
        } catch (error) {
            throw error;
        }
    }

    async findCourseById(id: string, currentUser: any): Promise<Course> {
        try {
            const course = await this.courseModel.findById(id)
                .populate('programId', 'name code')
                .populate('departmentId', 'name code universityId')
                .populate('facultyId', 'username email name');
            if (!course) {
                throw new NotFoundException('Course not found');
            }

            const dept = course.departmentId as any;
            if (currentUser.role !== Role.SUPER_ADMIN && dept.universityId.toString() !== currentUser.universityId.toString()) {
                throw new ForbiddenException('Access denied: You can only access courses within your university');
            }

            return course;
        } catch (error) {
            throw error;
        }
    }

    async updateCourse(id: string, dto: UpdateCourseDto, currentUser: any): Promise<Course> {
        try {
            await this.findCourseById(id, currentUser);
            return this.courseModel.findByIdAndUpdate(id, dto, { new: true }).populate('programId', 'name code');
        } catch (error) {
            throw error;
        }
    }

    async deleteCourse(id: string, currentUser: any): Promise<any> {
        try {
            await this.findCourseById(id, currentUser);
            const result = await this.courseModel.findByIdAndDelete(id);
            if (!result) {
                throw new NotFoundException('Course not found');
            }
            return { message: 'Course deleted successfully' };
        } catch (error) {
            throw error;
        }
    }

    async getCoursesByProgram(programId: string, currentUser: any): Promise<Course[]> {
        try {
            await this.findProgramById(programId, currentUser);
            return await this.courseModel.find({ programId }).sort({ semester: 1 }).populate('facultyId', 'username email name').exec();
        } catch (error) {
            throw error;
        }
    }

    async assignFacultyToCourse(courseId: string, facultyId: string, currentUser: any): Promise<Course> {
        try {
            // Verify the course exists and user has access
            await this.findCourseById(courseId, currentUser);
            
            const course = await this.courseModel.findByIdAndUpdate(
                courseId, 
                { facultyId }, 
                { new: true }
            )
            .populate('facultyId', 'username email name')
            .populate('programId', 'name code')
            .populate('departmentId', 'name code');

            if (!course) {
                throw new NotFoundException('Course not found');
            }

            return course;
        } catch (error) {
            throw error;
        }
    }

    async generateAcademicYearReport(currentUser: any): Promise<any> {
        try {
            const filter: any = {};
            if (currentUser.role !== Role.SUPER_ADMIN) {
                filter.universityId = currentUser.universityId;
            }

            const activeYear = await this.academicYearModel.findOne({ isActive: true });
            
            // Isolation counts
            const depts = await this.departmentModel.find(filter).select('_id').exec();
            const deptIds = depts.map(d => d._id);
            
            const totalDepartments = deptIds.length;
            const totalPrograms = await this.programModel.countDocuments({ departmentId: { $in: deptIds } });
            const totalCourses = await this.courseModel.countDocuments({ departmentId: { $in: deptIds } });

            return {
                activeYear,
                totalDepartments,
                totalPrograms,
                totalCourses,
                timestamp: new Date(),
            };
        } catch (error) {
            throw error;
        }
    }
}


