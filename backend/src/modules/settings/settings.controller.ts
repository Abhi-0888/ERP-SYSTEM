import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('settings/global')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    @Roles(Role.SUPER_ADMIN)
    getSettings() {
        return this.settingsService.getSettings();
    }

    @Patch()
    @Roles(Role.SUPER_ADMIN)
    updateSettings(@Body() data: any) {
        return this.settingsService.updateSettings(data);
    }
}
