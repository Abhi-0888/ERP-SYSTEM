import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { University, UniversityDocument } from './university.schema';
import { User, UserDocument } from '../user/user.schema';
import { Role } from '../../common/enums/role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UniversityService {
    constructor(
        @InjectModel(University.name)
        private universityModel: Model<UniversityDocument>,
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
    ) { }

    async create(createUniversityDto: any): Promise<University> {
        const { adminEmail, adminUsername, adminPassword, ...universityData } = createUniversityDto;

        const createdUniversity = new this.universityModel({
            ...universityData,
            status: 'setup',
            onboardingStage: 1, // Stage 0 is completed once created
        });
        const university = await createdUniversity.save();

        // Create Root Admin
        if (adminEmail && adminPassword) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            await this.userModel.create({
                username: adminUsername || adminEmail.split('@')[0],
                email: adminEmail,
                password: hashedPassword,
                role: Role.UNIVERSITY_ADMIN,
                universityId: university._id,
                isActive: true
            });
        }

        return university;
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
