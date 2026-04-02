import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { TransportService } from './transport.service';
import { CreateVehicleDto, CreateRouteDto, UpdateVehicleDto, UpdateRouteDto, EnrollTransportDto } from './transport.dto';
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

    @Get('routes/:id')
    getRoute(@Param('id') id: string) {
        return this.transportService.getRoute(id);
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

    // ============= ENROLLMENT ENDPOINTS =============
    @Post('enroll')
    @Roles(Role.STUDENT)
    enrollStudent(@Request() req, @Body() dto: EnrollTransportDto) {
        // Here we assume req.user.profileId is the student profile ID
        // In this ERP, we might need to find the student profile first if not in req.user
        return this.transportService.enrollStudent(req.user.universityId, req.user.profileId || req.user.id, dto);
    }

    @Get('my-route')
    @Roles(Role.STUDENT)
    getStudentRoute(@Request() req) {
        return this.transportService.getStudentEnrollment(req.user.profileId || req.user.id);
    }

    @Get('student/:id')
    @Roles(Role.TRANSPORT_MANAGER, Role.UNIVERSITY_ADMIN)
    getStudentEnrollmentAdmin(@Param('id') id: string) {
        return this.transportService.getStudentEnrollment(id);
    }

    @Patch('enrollment/:id/status')
    @Roles(Role.UNIVERSITY_ADMIN, Role.REGISTRAR)
    updateEnrollmentStatus(@Param('id') id: string, @Body('status') status: string) {
        return this.transportService.updateEnrollmentStatus(id, status);
    }
}
