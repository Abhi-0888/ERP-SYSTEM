import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { UniversityService } from './university.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

import { UniversityIsolationGuard } from '../../common/guards/university-isolation.guard';
import { StatsService } from '../stats/stats.service';

@Controller('universities')
@UseGuards(JwtAuthGuard, RolesGuard, UniversityIsolationGuard)
export class UniversityController {
    constructor(
        private readonly universityService: UniversityService,
        private readonly statsService: StatsService,
    ) { }

    @Post()
    @Roles(Role.SUPER_ADMIN)
    create(@Body() createUniversityDto: any) {
        return this.universityService.create(createUniversityDto);
    }

    @Get()
    @Roles(Role.SUPER_ADMIN)
    findAll() {
        return this.universityService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.universityService.findOne(id);
    }

    @Get(':id/summary')
    @Roles(Role.SUPER_ADMIN)
    async getSummary(@Param('id') id: string) {
        return this.universityService.getTenantSummary(id, this.statsService);
    }

    @Patch(':id')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN)
    update(@Param('id') id: string, @Body() updateUniversityDto: any) {
        return this.universityService.update(id, updateUniversityDto);
    }

    @Post(':id/assign-admin')
    @Roles(Role.SUPER_ADMIN)
    assignAdmin(@Param('id') id: string, @Body() body: { adminEmail: string; adminUsername?: string; adminPassword: string }) {
        return this.universityService.assignGlobalAdmin(id, body);
    }

    @Patch(':id/upgrade-license')
    @Roles(Role.SUPER_ADMIN)
    upgradeLicense(@Param('id') id: string, @Body() body: { subscriptionPlan: string; subscriptionDetails?: Record<string, any> }) {
        return this.universityService.upgradeLicense(id, body.subscriptionPlan, body.subscriptionDetails);
    }

    @Delete(':id')
    @Roles(Role.SUPER_ADMIN)
    remove(@Param('id') id: string) {
        return this.universityService.remove(id);
    }
}
