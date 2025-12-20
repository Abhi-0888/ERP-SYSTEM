import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AcademicYear, AcademicYearDocument } from './academic-year.schema';
import { Department, DepartmentDocument } from './department.schema';
import { Program, ProgramDocument } from './program.schema';
import { Course, CourseDocument } from './course.schema';
import { CreateAcademicYearDto, UpdateAcademicYearDto, CreateDepartmentDto, UpdateDepartmentDto, CreateProgramDto, UpdateProgramDto, CreateCourseDto, UpdateCourseDto } from './academic.dto';

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

    async createDepartment(dto: CreateDepartmentDto): Promise<Department> {
        try {
            const existingDept = await this.departmentModel.findOne({ code: dto.code });
            if (existingDept) {
                throw new BadRequestException('Department with this code already exists');
            }

            const department = new this.departmentModel(dto);
            return await department.save();
        } catch (error) {
            throw error;
        }
    }

    async findAllDepartments(page: number = 1, limit: number = 10): Promise<any> {
        try {
            const skip = (page - 1) * limit;
            const departments = await this.departmentModel
                .find()
                .skip(skip)
                .limit(limit)
                .populate('headOfDepartment', 'name email')
                .exec();

            const total = await this.departmentModel.countDocuments();

            return {
                data: departments,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            };
        } catch (error) {
            throw error;
        }
    }

    async findDepartmentById(id: string): Promise<Department> {
        try {
            const dept = await this.departmentModel.findById(id).populate('headOfDepartment', 'name email');
            if (!dept) {
                throw new NotFoundException('Department not found');
            }
            return dept;
        } catch (error) {
            throw error;
        }
    }

    async updateDepartment(id: string, dto: UpdateDepartmentDto): Promise<Department> {
        try {
            const dept = await this.departmentModel.findByIdAndUpdate(id, dto, { new: true }).populate('headOfDepartment', 'name email');
            if (!dept) {
                throw new NotFoundException('Department not found');
            }
            return dept;
        } catch (error) {
            throw error;
        }
    }

    async deleteDepartment(id: string): Promise<any> {
        try {
            const dept = await this.departmentModel.findByIdAndDelete(id);
            if (!dept) {
                throw new NotFoundException('Department not found');
            }
            return { message: 'Department deleted successfully' };
        } catch (error) {
            throw error;
        }
    }

    // ============= PROGRAM METHODS =============

    async createProgram(dto: CreateProgramDto): Promise<Program> {
        try {
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

    async findAllPrograms(departmentId?: string, page: number = 1, limit: number = 10): Promise<any> {
        try {
            const skip = (page - 1) * limit;
            const filter = departmentId ? { departmentId } : {};

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

    async findProgramById(id: string): Promise<Program> {
        try {
            const program = await this.programModel.findById(id).populate('departmentId', 'name code');
            if (!program) {
                throw new NotFoundException('Program not found');
            }
            return program;
        } catch (error) {
            throw error;
        }
    }

    async updateProgram(id: string, dto: UpdateProgramDto): Promise<Program> {
        try {
            const program = await this.programModel.findByIdAndUpdate(id, dto, { new: true }).populate('departmentId', 'name code');
            if (!program) {
                throw new NotFoundException('Program not found');
            }
            return program;
        } catch (error) {
            throw error;
        }
    }

    async deleteProgram(id: string): Promise<any> {
        try {
            const program = await this.programModel.findByIdAndDelete(id);
            if (!program) {
                throw new NotFoundException('Program not found');
            }
            return { message: 'Program deleted successfully' };
        } catch (error) {
            throw error;
        }
    }

    // ============= COURSE METHODS =============

    async createCourse(dto: CreateCourseDto): Promise<Course> {
        try {
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

    async findAllCourses(programId?: string, semester?: number, page: number = 1, limit: number = 10): Promise<any> {
        try {
            const skip = (page - 1) * limit;
            const filter: any = {};

            if (programId) filter.programId = programId;
            if (semester) filter.semester = semester;

            const courses = await this.courseModel
                .find(filter)
                .skip(skip)
                .limit(limit)
                .populate('programId', 'name code')
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

    async findCourseById(id: string): Promise<Course> {
        try {
            const course = await this.courseModel.findById(id).populate('programId', 'name code');
            if (!course) {
                throw new NotFoundException('Course not found');
            }
            return course;
        } catch (error) {
            throw error;
        }
    }

    async updateCourse(id: string, dto: UpdateCourseDto): Promise<Course> {
        try {
            const course = await this.courseModel.findByIdAndUpdate(id, dto, { new: true }).populate('programId', 'name code');
            if (!course) {
                throw new NotFoundException('Course not found');
            }
            return course;
        } catch (error) {
            throw error;
        }
    }

    async deleteCourse(id: string): Promise<any> {
        try {
            const course = await this.courseModel.findByIdAndDelete(id);
            if (!course) {
                throw new NotFoundException('Course not found');
            }
            return { message: 'Course deleted successfully' };
        } catch (error) {
            throw error;
        }
    }

    async getCoursesByProgram(programId: string): Promise<Course[]> {
        try {
            return await this.courseModel.find({ programId }).sort({ semester: 1 });
        } catch (error) {
            throw error;
        }
    }

    async generateAcademicYearReport(): Promise<any> {
        try {
            const activeYear = await this.academicYearModel.findOne({ isActive: true });
            const totalDepartments = await this.departmentModel.countDocuments();
            const totalPrograms = await this.programModel.countDocuments();
            const totalCourses = await this.courseModel.countDocuments();

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


