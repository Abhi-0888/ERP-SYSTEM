import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

import { UniversityIsolationGuard } from '../../common/guards/university-isolation.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard, UniversityIsolationGuard)
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post()
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN)
    create(@Body() createUserDto: any) {
        return this.userService.create(createUserDto);
    }

    @Get()
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN, Role.REGISTRAR)
    findAll(@Query('universityId') universityId?: string) {
        return this.userService.findAll(universityId);
    }

    @Get('role/:role')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN, Role.HOD)
    findByRole(
        @Param('role') role: string,
        @Query('universityId') universityId?: string,
    ) {
        return this.userService.findByRole(role, universityId);
    }

    @Get(':id')
    @Roles(Role.STUDENT, Role.FACULTY, Role.HOD, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN)
    findOne(@Param('id') id: string) {
        return this.userService.findOne(id);
    }

    @Patch(':id')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN)
    update(@Param('id') id: string, @Body() updateUserDto: any) {
        return this.userService.update(id, updateUserDto);
    }

    @Delete(':id')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN)
    remove(@Param('id') id: string) {
        return this.userService.remove(id);
    }

    @Patch(':id/force-logout')
    @Roles(Role.SUPER_ADMIN)
    forceLogout(@Param('id') id: string) {
        return this.userService.forceLogout(id);
    }

    @Patch(':id/status')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN)
    updateStatus(@Param('id') id: string, @Body('status') status: string) {
        return this.userService.updateStatus(id, status);
    }

    @Patch(':id/reset-password')
    @Roles(Role.SUPER_ADMIN)
    resetPassword(@Param('id') id: string) {
        return this.userService.resetPassword(id);
    }
}
