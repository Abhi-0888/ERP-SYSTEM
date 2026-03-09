import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import * as bcrypt from 'bcrypt';
import { ROLE_RANKS } from '../../common/constants/role-ranks';
import { Role } from '../../common/enums/role.enum';
import { CreateUserDto, UpdateUserDto } from './user.dto';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    private validateRoleHierarchy(currentUserRole: Role, targetRole: Role) {
        const currentRank = ROLE_RANKS[currentUserRole] || 0;
        const targetRank = ROLE_RANKS[targetRole] || 0;

        if (targetRank > currentRank) {
            throw new ForbiddenException(`You cannot create or manage a user with a higher role rank than yours (${targetRole} > ${currentUserRole})`);
        }
    }

    async create(createUserDto: CreateUserDto, currentUser: any): Promise<User> {
        // Enforce hierarchy
        this.validateRoleHierarchy(currentUser.role, createUserDto.role);

        // Enforce department scope for HOD
        if (currentUser.role === Role.HOD && createUserDto.departmentId !== currentUser.departmentId?.toString()) {
            throw new ForbiddenException('HOD can only create faculty within their own department');
        }

        // Enforce university isolation
        const universityId = currentUser.role === Role.SUPER_ADMIN ? createUserDto.universityId : currentUser.universityId;

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const createdUser = new this.userModel({
            ...createUserDto,
            universityId,
            password: hashedPassword,
        });
        return createdUser.save();
    }

    async findAll(universityId?: string, currentUser?: any): Promise<User[]> {
        const filter: any = { isDeleted: false };
        
        // Apply isolation
        if (currentUser?.role !== Role.SUPER_ADMIN) {
            filter.universityId = currentUser.universityId;
        } else if (universityId) {
            filter.universityId = universityId;
        }

        // Apply departmental scoping for HOD
        if (currentUser?.role === Role.HOD) {
            filter.departmentId = currentUser.departmentId;
        }

        return this.userModel.find(filter)
            .select('-password')
            .populate('universityId', 'name')
            .populate('departmentId', 'name')
            .exec();
    }

    async findOne(id: string, currentUser?: any): Promise<User> {
        const user = await this.userModel.findById(id).select('-password').exec();
        if (!user || user.isDeleted) {
            throw new NotFoundException('User not found');
        }

        // Access check
        if (currentUser?.role !== Role.SUPER_ADMIN) {
            if (user.universityId.toString() !== currentUser.universityId.toString()) {
                throw new ForbiddenException('You do not have permission to access this user');
            }
            if (currentUser.role === Role.HOD && user.departmentId?.toString() !== currentUser.departmentId?.toString()) {
                throw new ForbiddenException('HOD can only access users within their own department');
            }
        }

        return user;
    }

    async findByUsername(username: string): Promise<User> {
        return this.userModel.findOne({ username, isDeleted: false }).exec();
    }

    async update(id: string, updateUserDto: UpdateUserDto, currentUser: any): Promise<User> {
        const user = await this.findOne(id, currentUser);

        // Hierarchy check for role update
        if (updateUserDto.role) {
            this.validateRoleHierarchy(currentUser.role, updateUserDto.role);
        }

        // Target user rank check
        if (ROLE_RANKS[user.role] > ROLE_RANKS[currentUser.role]) {
            throw new ForbiddenException('You cannot manage a user with a higher role rank than yours');
        }

        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }

        return this.userModel
            .findByIdAndUpdate(id, updateUserDto, { new: true })
            .select('-password')
            .exec();
    }

    async remove(id: string, currentUser: any): Promise<User> {
        const user = await this.findOne(id, currentUser);

        // Hierarchy check
        if (ROLE_RANKS[user.role] > ROLE_RANKS[currentUser.role]) {
            throw new ForbiddenException('You cannot delete a user with a higher role rank than yours');
        }

        return this.userModel.findByIdAndUpdate(
            id,
            { isDeleted: true, deletedAt: new Date(), isActive: false, status: 'inactive' },
            { new: true }
        ).exec();
    }

    async findByRole(role: string, universityId?: string, currentUser?: any): Promise<User[]> {
        const filter: any = { role, isDeleted: false };
        
        if (currentUser?.role !== Role.SUPER_ADMIN) {
            filter.universityId = currentUser.universityId;
        } else if (universityId) {
            filter.universityId = universityId;
        }

        return this.userModel.find(filter).select('-password').exec();
    }

    async forceLogout(id: string): Promise<User> {
        return this.userModel.findByIdAndUpdate(id, { lastLogoutAllNodes: new Date() }, { new: true }).exec();
    }

    async updateStatus(id: string, status: string, currentUser: any): Promise<User> {
        const user = await this.findOne(id, currentUser);

        // Hierarchy check
        if (ROLE_RANKS[user.role] > ROLE_RANKS[currentUser.role]) {
            throw new ForbiddenException('You cannot manage status for a user with a higher role rank than yours');
        }

        const isActive = status === 'active';
        return this.userModel.findByIdAndUpdate(id, { status, isActive }, { new: true }).exec();
    }

    async resetPassword(id: string, currentUser: any): Promise<User> {
        const user = await this.findOne(id, currentUser);

        // Hierarchy check
        if (ROLE_RANKS[user.role] > ROLE_RANKS[currentUser.role]) {
            throw new ForbiddenException('You cannot reset credentials for a user with a higher role rank than yours');
        }

        const tempPassword = Math.random().toString(36).substring(2, 10);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        return this.userModel.findByIdAndUpdate(id, {
            password: hashedPassword,
            mustChangePassword: true
        }, { new: true }).exec();
    }

    async bulkCreate(users: CreateUserDto[], currentUser: any) {
        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        for (const userDto of users) {
            try {
                await this.create(userDto, currentUser);
                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push({
                    username: userDto.username,
                    error: error.message
                });
            }
        }

        return results;
    }
}
