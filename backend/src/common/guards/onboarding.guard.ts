import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { University, UniversityDocument } from '../../modules/university/university.schema';
import { Role } from '../enums/role.enum';

@Injectable()
export class OnboardingGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        @InjectModel(University.name) private universityModel: Model<UniversityDocument>,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // Super admins are never blocked by onboarding
        if (user?.role === Role.SUPER_ADMIN) {
            return true;
        }

        // Check if the current controller/handler is allowed during onboarding
        // (Like the OnboardingController itself)
        const isOnboardingRoute = request.url.startsWith('/onboarding');
        const isAuthRoute = request.url.startsWith('/auth');

        if (isOnboardingRoute || isAuthRoute) {
            return true;
        }

        if (!user?.universityId) {
            return true; // Or block? Usually guest routes are fine
        }

        const university = await this.universityModel.findById(user.universityId).exec();

        if (university && university.status === 'setup') {
            throw new ForbiddenException({
                message: 'Institutional onboarding is incomplete.',
                currentStage: university.onboardingStage,
                setupUrl: '/onboarding'
            });
        }

        return true;
    }
}
