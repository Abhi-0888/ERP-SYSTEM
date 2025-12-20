import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';

const ROLE_RANK = {
    [Role.SUPER_ADMIN]: 100,
    [Role.UNIVERSITY_ADMIN]: 80,
    [Role.REGISTRAR]: 60,
    [Role.HOD]: 50,
    [Role.ACADEMIC_COORDINATOR]: 45,
    [Role.EXAM_CONTROLLER]: 40,
    [Role.FINANCE]: 40,
    [Role.ACCOUNTANT]: 35,
    [Role.LIBRARIAN]: 30,
    [Role.HOSTEL_WARDEN]: 30,
    [Role.PLACEMENT_CELL]: 30,
    [Role.PLACEMENT_OFFICER]: 25,
    [Role.FACULTY]: 20,
    [Role.STUDENT]: 10,
};

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();
        if (!user || !user.role) return false;

        // Hierarchical check: User ranks higher or equal to ANY of the required roles
        const userRank = ROLE_RANK[user.role] || 0;
        return requiredRoles.some((role) => userRank >= (ROLE_RANK[role] || 0));
    }
}
