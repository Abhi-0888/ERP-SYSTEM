import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { University, UniversityDocument } from './university.schema';
import { User, UserDocument } from '../user/user.schema';
import { Role } from '../../common/enums/role.enum';
import * as bcrypt from 'bcrypt';
import { StatsService } from '../stats/stats.service';

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
        return this.universityModel.find({ isDeleted: false }).exec();
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
        // Soft delete the university
        const deletedUniversity = await this.universityModel.findByIdAndUpdate(
            id,
            {
                isDeleted: true,
                deletedAt: new Date(),
                status: 'inactive'
            },
            { new: true }
        ).exec();

        if (deletedUniversity) {
            // Soft delete all associated users
            await this.userModel.updateMany(
                { universityId: id },
                {
                    isDeleted: true,
                    deletedAt: new Date()
                }
            ).exec();
        }

        // Future: Add soft deletion for other related resources (Students, Faculty, etc.) here

        return deletedUniversity;
    }

    async findByCode(code: string): Promise<University> {
        return this.universityModel.findOne({ code }).exec();
    }

    async getTenantSummary(universityId: string, statsService: StatsService) {
        const [university, global, modules, usersTotal, usersActive] = await Promise.all([
            this.universityModel.findById(universityId).exec(),
            statsService.getGlobalStats(universityId),
            statsService.getModuleStats(universityId),
            this.userModel.countDocuments({ universityId }),
            this.userModel.countDocuments({ universityId, isActive: true }),
        ]);

        return {
            university: {
                id: university?._id,
                name: university?.name,
                code: university?.code,
                status: university?.status,
                subscriptionPlan: university?.subscriptionPlan,
                subscriptionDetails: university?.subscriptionDetails,
                onboardingStage: university?.onboardingStage,
                contactEmail: university?.contactEmail,
            },
            global,
            modules,
            users: {
                total: usersTotal,
                active: usersActive,
            },
        };
    }

    async assignGlobalAdmin(universityId: string, body: { adminEmail: string; adminUsername?: string; adminPassword: string }) {
        const { adminEmail, adminUsername, adminPassword } = body;
        const hashed = await bcrypt.hash(adminPassword, 10);
        const user = await this.userModel.create({
            username: adminUsername || adminEmail.split('@')[0],
            email: adminEmail,
            password: hashed,
            role: Role.UNIVERSITY_ADMIN,
            universityId,
            isActive: true,
            status: 'active',
        });
        await this.universityModel.findByIdAndUpdate(universityId, { contactEmail: adminEmail }).exec();
        return { success: true, userId: user._id };
    }

    async upgradeLicense(universityId: string, plan: string, details?: Record<string, any>) {
        const update: any = { subscriptionPlan: plan };
        if (details) {
            update.subscriptionDetails = details;
        }
        const uni = await this.universityModel.findByIdAndUpdate(universityId, update, { new: true }).exec();
        return { success: true, subscriptionPlan: uni.subscriptionPlan, subscriptionDetails: uni.subscriptionDetails };
    }
}
