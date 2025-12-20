import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { University, UniversityDocument } from './university.schema';

@Injectable()
export class UniversityService {
    constructor(
        @InjectModel(University.name)
        private universityModel: Model<UniversityDocument>,
    ) { }

    async create(createUniversityDto: any): Promise<University> {
        const createdUniversity = new this.universityModel(createUniversityDto);
        return createdUniversity.save();
    }

    async findAll(): Promise<University[]> {
        return this.universityModel.find().exec();
    }

    async findOne(id: string): Promise<University> {
        return this.universityModel.findById(id).exec();
    }

    async update(id: string, updateUniversityDto: any): Promise<University> {
        return this.universityModel
            .findByIdAndUpdate(id, updateUniversityDto, { new: true })
            .exec();
    }

    async remove(id: string): Promise<University> {
        return this.universityModel.findByIdAndDelete(id).exec();
    }

    async findByCode(code: string): Promise<University> {
        return this.universityModel.findOne({ code }).exec();
    }
}
