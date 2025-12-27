import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UniversityIsolationGuard } from '../../common/guards/university-isolation.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('super-admin')
@UseGuards(JwtAuthGuard, RolesGuard, UniversityIsolationGuard)
export class SuperAdminController {
    constructor(private readonly superAdminService: SuperAdminService) { }

    @Get('stats/dashboard')
    @Roles(Role.SUPER_ADMIN)
    getDashboardStats() {
        return this.superAdminService.getDashboardStats();
    }

    @Get('stats/security')
    @Roles(Role.SUPER_ADMIN)
    getSecurityStats() {
        return this.superAdminService.getSecurityStats();
    }

    @Get('stats/modules')
    @Roles(Role.SUPER_ADMIN)
    getModuleStats() {
        return this.superAdminService.getModuleStats();
    }

    @Get('audit-logs')
    @Roles(Role.SUPER_ADMIN)
    getAuditLogs(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 50,
        @Query('userId') userId?: string
    ) {
        return this.superAdminService.getAuditLogs(Number(page), Number(limit), userId);
    }

    @Get('stats/security-events')
    @Roles(Role.SUPER_ADMIN)
    getSecurityEvents() {
        return this.superAdminService.getSecurityEvents();
    }

    @Get('stats/sessions')
    @Roles(Role.SUPER_ADMIN)
    getActiveSessions() {
        return this.superAdminService.getActiveSessions();
    }
}
