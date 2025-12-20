import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('support')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SupportController {
    constructor(private readonly supportService: SupportService) { }

    @Get('tickets')
    @Roles(Role.SUPER_ADMIN)
    findAll() {
        return this.supportService.findAll();
    }

    @Patch('tickets/:id/status')
    @Roles(Role.SUPER_ADMIN)
    updateStatus(@Param('id') id: string, @Body('status') status: string) {
        return this.supportService.updateStatus(id, status);
    }
}
