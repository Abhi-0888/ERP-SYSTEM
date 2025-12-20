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

@Controller('universities')
@UseGuards(JwtAuthGuard, RolesGuard, UniversityIsolationGuard)
export class UniversityController {
    constructor(private readonly universityService: UniversityService) { }

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

    @Patch(':id')
    @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN)
    update(@Param('id') id: string, @Body() updateUniversityDto: any) {
        return this.universityService.update(id, updateUniversityDto);
    }

    @Delete(':id')
    @Roles(Role.SUPER_ADMIN)
    remove(@Param('id') id: string) {
        return this.universityService.remove(id);
    }
}
