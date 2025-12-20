import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { OnboardingStatus, OnboardingStatusSchema } from './onboarding.schema';
import { UniversityModule } from '../university/university.module';
import { University, UniversitySchema } from '../university/university.schema';
import { APP_GUARD } from '@nestjs/core';
import { OnboardingGuard } from '../../common/guards/onboarding.guard';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: OnboardingStatus.name, schema: OnboardingStatusSchema },
            { name: University.name, schema: UniversitySchema },
        ]),
        UniversityModule,
    ],
    controllers: [OnboardingController],
    providers: [
        OnboardingService,
        {
            provide: APP_GUARD,
            useClass: OnboardingGuard,
        },
    ],
    exports: [OnboardingService],
})
export class OnboardingModule { }
