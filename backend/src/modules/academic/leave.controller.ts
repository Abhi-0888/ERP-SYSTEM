import { Controller, Get, Post, Patch, Body, Param, Query, Request, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { LeaveService } from '../academic/leave.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { UniversityIsolationGuard } from '../../common/guards/university-isolation.guard';

@Controller('leaves')
@UseGuards(JwtAuthGuard, RolesGuard, UniversityIsolationGuard)
export class LeaveController {
    constructor(private readonly leaveService: LeaveService) { }

    @Post()
    @Roles(Role.FACULTY, Role.HOD, Role.STAFF, Role.UNIVERSITY_ADMIN, Role.REGISTRAR, Role.PRINCIPAL)
    async create(@Body() createLeaveDto: any, @Request() req) {
        try {
            return await this.leaveService.create(createLeaveDto, req.user);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to create leave request',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get()
    @Roles(Role.UNIVERSITY_ADMIN, Role.HOD, Role.REGISTRAR, Role.PRINCIPAL, Role.FACULTY)
    async findAll(@Request() req, @Query() filters: any) {
        try {
            return await this.leaveService.findAll(req.user, filters);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch leaves',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('stats')
    @Roles(Role.UNIVERSITY_ADMIN, Role.HOD, Role.REGISTRAR, Role.PRINCIPAL)
    async getStats(@Request() req, @Query('month') month?: number, @Query('year') year?: number) {
        try {
            return await this.leaveService.getLeaveStats(req.user.universityId, month, year);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch leave stats',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('pending')
    @Roles(Role.HOD, Role.UNIVERSITY_ADMIN, Role.REGISTRAR, Role.PRINCIPAL)
    async getPending(@Request() req) {
        try {
            return await this.leaveService.getPendingApprovals(req.user.departmentId, req.user.role);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch pending approvals',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('user/:userId')
    @Roles(Role.FACULTY, Role.HOD, Role.UNIVERSITY_ADMIN, Role.REGISTRAR, Role.PRINCIPAL)
    async findByUser(@Param('userId') userId: string) {
        try {
            return await this.leaveService.findByUser(userId);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch user leaves',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('user/:userId/balance')
    @Roles(Role.FACULTY, Role.HOD, Role.UNIVERSITY_ADMIN, Role.REGISTRAR, Role.PRINCIPAL)
    async getBalance(@Param('userId') userId: string, @Query('year') year: number = new Date().getFullYear()) {
        try {
            return await this.leaveService.getLeaveBalance(userId, year);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch leave balance',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get(':id')
    @Roles(Role.FACULTY, Role.HOD, Role.UNIVERSITY_ADMIN, Role.REGISTRAR, Role.PRINCIPAL)
    async findById(@Param('id') id: string) {
        try {
            return await this.leaveService.findById(id);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch leave',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Patch(':id/approve')
    @Roles(Role.HOD, Role.UNIVERSITY_ADMIN, Role.REGISTRAR, Role.PRINCIPAL)
    async approve(@Param('id') id: string, @Body() body: { remarks?: string }, @Request() req) {
        try {
            return await this.leaveService.approveLeave(id, req.user.userId || req.user._id, body.remarks);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to approve leave',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Patch(':id/reject')
    @Roles(Role.HOD, Role.UNIVERSITY_ADMIN, Role.REGISTRAR, Role.PRINCIPAL)
    async reject(@Param('id') id: string, @Body() body: { reason: string }, @Request() req) {
        try {
            return await this.leaveService.rejectLeave(id, req.user.userId || req.user._id, body.reason);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to reject leave',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Patch(':id/cancel')
    @Roles(Role.FACULTY, Role.HOD, Role.UNIVERSITY_ADMIN, Role.REGISTRAR, Role.PRINCIPAL)
    async cancel(@Param('id') id: string) {
        try {
            return await this.leaveService.cancelLeave(id);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to cancel leave',
                HttpStatus.BAD_REQUEST,
            );
        }
    }
}
