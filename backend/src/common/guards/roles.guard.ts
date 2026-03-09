import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLE_RANKS } from '../constants/role-ranks';

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
        const userRank = ROLE_RANKS[user.role] || 0;
        return requiredRoles.some((role) => userRank >= (ROLE_RANKS[role] || 0));
    }
}
