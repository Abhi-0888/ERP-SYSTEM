import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UniversityIsolationGuard } from '../../common/guards/university-isolation.guard';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard, UniversityIsolationGuard)
export class AuditController {
    constructor(private readonly auditService: AuditService) {}

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

