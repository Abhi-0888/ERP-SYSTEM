import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PermissionOverride } from './override.schema';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('super-admin/overrides')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OverrideController {
    constructor(
        @InjectModel('PermissionOverride')
        private overrideModel: Model<any>,
    ) { }

    @Get()
    @Roles(Role.SUPER_ADMIN)
    findAll() {
        return this.overrideModel.find().populate('userId').exec();
    }

    @Post()
    @Roles(Role.SUPER_ADMIN)
    async create(@Body() data: any, @Request() req: any) {
        const override = new this.overrideModel({
            ...data,
            createdBy: req.user.id,
            status: 'active',
            expiresAt: new Date(Date.now() + (data.durationHours || 4) * 60 * 60 * 1000),
        });
        return override.save();
    }

    @Patch(':id/revoke')
    @Roles(Role.SUPER_ADMIN)
    revoke(@Param('id') id: string) {
        return this.overrideModel.findByIdAndUpdate(id, { status: 'revoked' }, { new: true }).exec();
    }
}
