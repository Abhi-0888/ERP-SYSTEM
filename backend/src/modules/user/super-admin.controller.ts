import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { UniversityService } from '../university/university.service';
import { UserService } from '../user/user.service';

@Controller('super-admin/stats')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SuperAdminController {
    constructor(
        private readonly universityService: UniversityService,
        private readonly userService: UserService,
    ) { }

    @Get('dashboard')
    @Roles(Role.SUPER_ADMIN)
    async getDashboardStats() {
        const universities = await this.universityService.findAll();
        const users = await this.userService.findAll();

        return {
            totalUniversities: universities.length,
            activeUniversities: universities.filter(u => u.status === 'active').length,
            totalUsers: users.length,
            activeSessions: 142, // Mocked until session management is fully implemented
            systemStatus: 'Healthy',
            failedLogins: 12,
            permissionOverrides: 2,
            auditAlerts: 0,
            pendingTickets: 5,
        };
    }
}
