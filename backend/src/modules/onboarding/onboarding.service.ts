import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OnboardingStatus, OnboardingStatusDocument } from './onboarding.schema';
import { University, UniversityDocument } from '../university/university.schema';

@Injectable()
export class OnboardingService {
    constructor(
        @InjectModel(OnboardingStatus.name) private onboardingModel: Model<OnboardingStatusDocument>,
        @InjectModel(University.name) private universityModel: Model<UniversityDocument>,
    ) { }

    async getStatus(universityId: string): Promise<OnboardingStatus> {
        let status = await this.onboardingModel.findOne({ universityId }).exec();
        if (!status) {
            status = await this.onboardingModel.create({ universityId, currentStage: 1, completedStages: [0] });
        }
        return status;
    }

    async updateStage(universityId: string, stage: number, data: any): Promise<OnboardingStatus> {
        const status = await this.getStatus(universityId);

        // Ensure stages are completed in order
        if (stage > status.currentStage) {
            throw new ForbiddenException(`Cannot jump to stage ${stage}. Complete current stage first.`);
        }

        // Update stage data
        const stageKey = `stageData.stage${stage}`;
        const updateDoc: any = {
            $set: { [stageKey]: data }
        };

        // If this completes the current stage, move to next
        if (stage === status.currentStage) {
            updateDoc.$set.currentStage = stage + 1;
            if (!status.completedStages.includes(stage)) {
                updateDoc.$addToSet = { completedStages: stage };
            }

            // Sync with University model
            await this.universityModel.findByIdAndUpdate(universityId, {
                onboardingStage: stage + 1
            });
        }

        return this.onboardingModel.findOneAndUpdate(
            { universityId },
            updateDoc,
            { new: true }
        ).exec();
    }

    async updateStageData(universityId: string, stage: number, data: any): Promise<OnboardingStatus> {
        // Update stage data without advancing the stage (for partial updates like file uploads)
        const stageKey = `stageData.stage${stage}`;

        return this.onboardingModel.findOneAndUpdate(
            { universityId },
            { $set: { [stageKey]: data } },
            { new: true, upsert: true }
        ).exec();
    }

    async completeOnboarding(universityId: string): Promise<University> {
        const university = await this.universityModel.findById(universityId);
        if (!university) {
            throw new NotFoundException('University not found');
        }

        const status = await this.getStatus(universityId);

        // Ensure stageData exists
        const stageData = status.stageData || {};

        // Comprehensive validation for Go-Live
        const validationErrors: string[] = [];

        // Stage 1: Profile must be set
        if (!stageData.stage1) {
            validationErrors.push('Stage 1: University profile is incomplete');
        }

        // Stage 2: At least one department required
        const stage2 = stageData.stage2;
        if (!stage2 || !stage2.departmentCount || stage2.departmentCount < 1) {
            validationErrors.push('Stage 2: At least one department is required');
        }

        // Stage 3: Mandatory staff roles
        const stage3 = stageData.stage3;
        if (!stage3 || !stage3.staffCount || stage3.staffCount < 2) {
            validationErrors.push('Stage 3: At least Registrar and Finance Officer are required');
        }

        // Stage 4: Module configuration
        if (!stageData.stage4) {
            validationErrors.push('Stage 4: Module configuration is incomplete');
        }

        // Stage 5 is optional (data import can be skipped)

        if (validationErrors.length > 0) {
            throw new ForbiddenException({
                message: 'Go-Live validation failed',
                errors: validationErrors
            });
        }

        // Mark stage 6 as complete
        await this.onboardingModel.findOneAndUpdate(
            { universityId },
            {
                $set: {
                    currentStage: 6,
                    'stageData.stage6': { activatedAt: new Date() }
                },
                $addToSet: { completedStages: 6 }
            }
        );

        // Update university status to active
        university.status = 'active';
        university.onboardingStage = 6;
        return university.save();
    }
}
