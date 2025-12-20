import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Role } from '../enums/role.enum';

@Injectable()
export class UniversityIsolationGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const { user, params, query, body } = request;

        // SUPER_ADMIN has global access
        if (user.role === Role.SUPER_ADMIN) {
            return true;
        }

        // 1. Ensure user is associated with a university
        if (!user.universityId) {
            throw new ForbiddenException('User is not associated with any university');
        }

        // 2. Strict Parameter Validation
        // If a universityId is provided in params, query, or body, it MUST match the user's universityId
        const targetUnivId = params.universityId || query.universityId || body.universityId;

        if (targetUnivId && targetUnivId !== user.universityId.toString()) {
            throw new ForbiddenException('Access denied: You cannot access data from another university');
        }

        // 3. Entity Context Check (Optional but strict)
        // If the route is 'universities/:id', the :id must be the user's universityId
        if (request.url.includes('/universities/') && params.id) {
            if (params.id !== user.universityId.toString()) {
                throw new ForbiddenException('Access denied: You can only manage your own university');
            }
        }

        return true;
    }
}
