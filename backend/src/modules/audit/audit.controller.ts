import { Controller, Get, Post, Body, UseGuards, Req, Query } from '@nestjs/common';
import { Request } from 'express';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { UniversityIsolationGuard } from '../../common/guards/university-isolation.guard';

@Controller('audit')
export class AuditController {
    constructor(private readonly auditService: AuditService) {}

    @Get('logs')
    @UseGuards(JwtAuthGuard, RolesGuard, UniversityIsolationGuard)
    @Roles(Role.UNIVERSITY_ADMIN, Role.REGISTRAR, Role.SUPER_ADMIN)
    async getLogs(
        @Req() req: Request,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 50,
    ) {
        const user: any = (req as any).user || {};
        const universityId = user.universityId;
        const logs = await this.auditService.findAll(universityId);
        const start = (page - 1) * limit;
        const paginatedLogs = logs.slice(start, start + limit);
        return {
            data: paginatedLogs,
            pagination: {
                total: logs.length,
                page,
                limit,
                totalPages: Math.ceil(logs.length / limit),
            },
        };
    }

    @Post('logs')
    async createLog(
        @Body() body: { action?: string; module?: string; details?: string; metadata?: any },
        @Req() req: Request,
    ) {
        const user: any = (req as any).user || {};

        await this.auditService.create({
            action: body.action || 'CUSTOM',
            module: (body.module || 'SYSTEM').toUpperCase(),
            userId: user.userId || user.id || user._id,
            username: user.username,
            payload: { details: body.details, metadata: body.metadata },
            endpoint: 'client/audit',
            method: 'POST',
            universityId: user.universityId,
        });

        return { status: 'ok' };
    }
}

