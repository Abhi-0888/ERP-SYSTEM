import { Controller, Get, UseGuards, Query, ParseIntPipe, Res } from '@nestjs/common';
import { Response } from 'express';
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
        @Query('page', ParseIntPipe) page = 1,
        @Query('limit', ParseIntPipe) limit = 50,
        @Query('userId') userId?: string,
        @Query('module') module?: string,
        @Query('severity') severity?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        return this.superAdminService.getAuditLogs(page, limit, userId, module, severity, startDate, endDate);
    }

    @Get('stats/security-events')
    @Roles(Role.SUPER_ADMIN)
    getSecurityEvents() {
        return this.superAdminService.getSecurityEvents();
    }

    @Get('notifications')
    @Roles(Role.SUPER_ADMIN)
    getNotifications() {
        return this.superAdminService.getNotifications();
    }

    @Get('stats/sessions')
    @Roles(Role.SUPER_ADMIN)
    getActiveSessions() {
        return this.superAdminService.getActiveSessions();
    }

    @Get('reports/export')
    @Roles(Role.SUPER_ADMIN)
    async exportReport(
        @Query('type') type: 'USER_ACTIVITY' | 'SECURITY_EVENTS',
        @Query('startDate') startDate: string | undefined, // Explicit type for clarity
        @Query('endDate') endDate: string | undefined,
        @Res() res: Response
    ) {
        const csvContent = await this.superAdminService.exportReports(type, startDate, endDate);

        res.set({
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="report-${type.toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv"`,
        });

        return res.send(csvContent);
    }
}
