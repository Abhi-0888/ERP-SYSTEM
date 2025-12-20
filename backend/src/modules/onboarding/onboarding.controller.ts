import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { UniversityService } from '../university/university.service';

@Controller('onboarding')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OnboardingController {
    constructor(
        private readonly onboardingService: OnboardingService,
        private readonly universityService: UniversityService,
    ) { }

    @Get('status')
    @Roles(Role.UNIVERSITY_ADMIN)
    getStatus(@Request() req: any) {
        return this.onboardingService.getStatus(req.user.universityId);
    }

    @Post('profile')
    @Roles(Role.UNIVERSITY_ADMIN)
    async setupProfile(@Request() req: any, @Body() profileData: any) {
        // Stage 1: University Profile Setup
        // Update university data first
        await this.universityService.update(req.user.universityId, profileData);
        return this.onboardingService.updateStage(req.user.universityId, 1, profileData);
    }

    @Post('academics')
    @Roles(Role.UNIVERSITY_ADMIN)
    async setupAcademics(@Request() req: any, @Body() academicData: any) {
        // Stage 2: Academic Structure Setup
        // This usually involves creating Depts, Programs, etc. 
        // Here we just mark the stage as progress.
        return this.onboardingService.updateStage(req.user.universityId, 2, academicData);
    }

    @Post('staff')
    @Roles(Role.UNIVERSITY_ADMIN)
    async setupStaff(@Request() req: any, @Body() staffData: any) {
        // Stage 3: Role & Staff Setup
        return this.onboardingService.updateStage(req.user.universityId, 3, staffData);
    }

    @Post('modules')
    @Roles(Role.UNIVERSITY_ADMIN)
    async setupModules(@Request() req: any, @Body() modulesData: any) {
        // Stage 4: Module Configuration
        if (modulesData.enabledModules) {
            await this.universityService.update(req.user.universityId, {
                enabledModules: modulesData.enabledModules
            });
        }
        return this.onboardingService.updateStage(req.user.universityId, 4, modulesData);
    }

    @Post('activate')
    @Roles(Role.UNIVERSITY_ADMIN)
    async activate(@Request() req: any) {
        // Stage 6: Go Live
        return this.onboardingService.completeOnboarding(req.user.universityId);
    }
}
