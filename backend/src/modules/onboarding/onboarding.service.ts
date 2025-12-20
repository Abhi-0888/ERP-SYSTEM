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

    async completeOnboarding(universityId: string): Promise<University> {
        const university = await this.universityModel.findById(universityId);
        if (!university) throw new NotFoundException('University not found');

        // Final validation logic here (Stage 6)

        university.status = 'active';
        university.onboardingStage = 6;
        return university.save();
    }
}
