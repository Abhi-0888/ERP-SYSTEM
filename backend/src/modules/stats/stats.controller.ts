import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UniversityIsolationGuard } from '../../common/guards/university-isolation.guard';

@Controller('stats')
@UseGuards(JwtAuthGuard, RolesGuard, UniversityIsolationGuard)
export class StatsController {
    constructor(private readonly statsService: StatsService) { }

    @Get('global')
    getGlobalStats(@Request() req) {
        return this.statsService.getGlobalStats(req.user.universityId);
    }

    @Get('modules')
    getModuleStats(@Request() req) {
        return this.statsService.getModuleStats(req.user.universityId);
    }
}
