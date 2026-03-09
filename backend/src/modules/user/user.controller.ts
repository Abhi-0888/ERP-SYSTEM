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
    Request,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { UniversityIsolationGuard } from '../../common/guards/university-isolation.guard';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { parse } from 'csv-parse/sync';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard, UniversityIsolationGuard)
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post()
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN, Role.REGISTRAR, Role.HOD)
    create(@Body() createUserDto: CreateUserDto, @Request() req) {
        return this.userService.create(createUserDto, req.user);
    }

    @Get()
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN, Role.REGISTRAR, Role.HOD)
    findAll(@Query('universityId') universityId?: string, @Request() req?) {
        return this.userService.findAll(universityId, req.user);
    }

    @Get('role/:role')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN, Role.HOD)
    findByRole(
        @Param('role') role: string,
        @Query('universityId') universityId?: string,
        @Request() req?
    ) {
        return this.userService.findByRole(role, universityId, req.user);
    }

    @Get(':id')
    @Roles(Role.STUDENT, Role.FACULTY, Role.HOD, Role.REGISTRAR, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN)
    findOne(@Param('id') id: string, @Request() req) {
        return this.userService.findOne(id, req.user);
    }

    @Patch(':id')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN, Role.REGISTRAR, Role.HOD)
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
        return this.userService.update(id, updateUserDto, req.user);
    }

    @Delete(':id')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN, Role.REGISTRAR, Role.HOD)
    remove(@Param('id') id: string, @Request() req) {
        return this.userService.remove(id, req.user);
    }

    @Post('bulk-import')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN, Role.REGISTRAR)
    @UseInterceptors(FileInterceptor('file'))
    async bulkImport(@UploadedFile() file: Express.Multer.File, @Request() req) {
        const records: any[] = parse(file.buffer, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });

        // Map CSV records to CreateUserDto
        const userDtos: CreateUserDto[] = records.map(record => ({
            username: record.username || record.email.split('@')[0],
            email: record.email,
            password: record.password || 'EduCore@123', // Default temporary password
            role: record.role as Role,
            departmentId: record.departmentId,
            universityId: record.universityId || req.user.universityId,
        }));

        return this.userService.bulkCreate(userDtos, req.user);
    }

    @Patch(':id/force-logout')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN)
    forceLogout(@Param('id') id: string) {
        return this.userService.forceLogout(id);
    }

    @Patch(':id/status')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN, Role.REGISTRAR, Role.HOD)
    updateStatus(@Param('id') id: string, @Body('status') status: string, @Request() req) {
        return this.userService.updateStatus(id, status, req.user);
    }

    @Patch(':id/reset-password')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN, Role.REGISTRAR)
    resetPassword(@Param('id') id: string, @Request() req) {
        return this.userService.resetPassword(id, req.user);
    }
}
