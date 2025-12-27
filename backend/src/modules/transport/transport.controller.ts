import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { TransportService } from './transport.service';
import { CreateVehicleDto, CreateRouteDto, UpdateVehicleDto, UpdateRouteDto } from './transport.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UniversityIsolationGuard } from '../../common/guards/university-isolation.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('transport')
@UseGuards(JwtAuthGuard, RolesGuard, UniversityIsolationGuard)
export class TransportController {
    constructor(private readonly transportService: TransportService) { }

    @Post('vehicles')
    @Roles(Role.UNIVERSITY_ADMIN, Role.REGISTRAR)
    createVehicle(@Request() req, @Body() dto: CreateVehicleDto) {
        return this.transportService.createVehicle(req.user.universityId, dto);
    }

    @Get('vehicles')
    findAllVehicles(@Request() req) {
        return this.transportService.findAllVehicles(req.user.universityId);
    }

    @Patch('vehicles/:id')
    @Roles(Role.UNIVERSITY_ADMIN, Role.REGISTRAR)
    updateVehicle(@Param('id') id: string, @Body() dto: UpdateVehicleDto) {
        return this.transportService.updateVehicle(id, dto);
    }

    @Delete('vehicles/:id')
    @Roles(Role.UNIVERSITY_ADMIN, Role.REGISTRAR)
    deleteVehicle(@Param('id') id: string) {
        return this.transportService.deleteVehicle(id);
    }

    @Post('routes')
    @Roles(Role.UNIVERSITY_ADMIN, Role.REGISTRAR)
    createRoute(@Request() req, @Body() dto: CreateRouteDto) {
        return this.transportService.createRoute(req.user.universityId, dto);
    }

    @Get('routes')
    findAllRoutes(@Request() req) {
        return this.transportService.findAllRoutes(req.user.universityId);
    }

    @Patch('routes/:id')
    @Roles(Role.UNIVERSITY_ADMIN, Role.REGISTRAR)
    updateRoute(@Param('id') id: string, @Body() dto: UpdateRouteDto) {
        return this.transportService.updateRoute(id, dto);
    }

    @Delete('routes/:id')
    @Roles(Role.UNIVERSITY_ADMIN, Role.REGISTRAR)
    deleteRoute(@Param('id') id: string) {
        return this.transportService.deleteRoute(id);
    }
}
