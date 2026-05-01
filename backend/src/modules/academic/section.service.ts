import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Section, SectionDocument } from '../academic/section.schema';

@Injectable()
export class SectionService {
    constructor(
        @InjectModel(Section.name) private sectionModel: Model<SectionDocument>,
    ) { }

    async create(createSectionDto: any, user: any) {
        const section = new this.sectionModel({
            ...createSectionDto,
            universityId: user.universityId,
        });
        return await section.save();
    }

    async findAll(user: any, filters: any = {}) {
        const query: any = { universityId: user.universityId };
        
        if (filters.programId) query.programId = filters.programId;
        if (filters.departmentId) query.departmentId = filters.departmentId;
        if (filters.semester) query.semester = parseInt(filters.semester);
        if (filters.batch) query.batch = filters.batch;
        if (filters.academicYearId) query.academicYearId = filters.academicYearId;
        if (filters.isActive !== undefined) query.isActive = filters.isActive;

        return await this.sectionModel.find(query)
            .populate('programId', 'name code')
            .populate('departmentId', 'name code')
            .populate('academicYearId', 'year')
            .populate('classAdvisorId', 'name username')
            .populate('students', 'enrollmentNo userId')
            .sort({ name: 1 })
            .exec();
    }

    async findById(id: string) {
        return await this.sectionModel.findById(id)
            .populate('programId', 'name code')
            .populate('departmentId', 'name code')
            .populate('academicYearId', 'year')
            .populate('classAdvisorId', 'name username')
            .populate({
                path: 'students',
                populate: {
                    path: 'userId',
                    select: 'name email username'
                }
            })
            .exec();
    }

    async update(id: string, updateSectionDto: any) {
        return await this.sectionModel.findByIdAndUpdate(
            id,
            { $set: updateSectionDto },
            { new: true }
        ).exec();
    }

    async delete(id: string) {
        return await this.sectionModel.findByIdAndDelete(id);
    }

    async addStudentToSection(sectionId: string, studentId: string) {
        return await this.sectionModel.findByIdAndUpdate(
            sectionId,
            { 
                $addToSet: { students: new Types.ObjectId(studentId) },
                $inc: { currentStrength: 1 }
            },
            { new: true }
        ).exec();
    }

    async removeStudentFromSection(sectionId: string, studentId: string) {
        return await this.sectionModel.findByIdAndUpdate(
            sectionId,
            { 
                $pull: { students: new Types.ObjectId(studentId) },
                $inc: { currentStrength: -1 }
            },
            { new: true }
        ).exec();
    }

    async assignClassAdvisor(sectionId: string, facultyId: string) {
        return await this.sectionModel.findByIdAndUpdate(
            sectionId,
            { $set: { classAdvisorId: new Types.ObjectId(facultyId) } },
            { new: true }
        ).exec();
    }

    async getSectionsByFaculty(facultyId: string) {
        return await this.sectionModel.find({ classAdvisorId: facultyId })
            .populate('programId', 'name code')
            .populate('departmentId', 'name code')
            .exec();
    }

    async getSectionStats(universityId: string) {
        const total = await this.sectionModel.countDocuments({ universityId });
        const withAdvisor = await this.sectionModel.countDocuments({ universityId, classAdvisorId: { $exists: true } });
        const fullSections = await this.sectionModel.countDocuments({ 
            universityId, 
            $expr: { $gte: ['$currentStrength', '$maxStrength'] }
        });
        
        return { total, withAdvisor, fullSections };
    }
}
