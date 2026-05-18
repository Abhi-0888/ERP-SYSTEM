import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserDocument } from '../user/user.schema';
import { University, UniversityDocument } from '../university/university.schema';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(University.name) private universityModel: Model<UniversityDocument>,
        private jwtService: JwtService,
    ) { }

    async validateUser(username: string, password: string): Promise<any> {
        const user = await this.userModel.findOne({
            $or: [{ username }, { email: username }],
            isActive: true
        });

        if (user && await bcrypt.compare(password, user.password)) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...result } = user.toObject();
            return result;
        }
        return null;
    }

    async login(username: string, password: string) {
        const user = await this.validateUser(username, password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        try {
            const payload = {
                username: user.username,
                sub: user._id,
                role: user.role,
                universityId: user.universityId,
                departmentId: user.departmentId,
            };
    
            // Update last login
            await this.userModel.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    
            // Fetch university details
            const university = await this.universityModel.findById(user.universityId).exec();
    
            return {
                access_token: this.jwtService.sign(payload),
                user: {
                    id: user._id,
                    username: user.username,
                    name: user.name || user.username,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    role: user.role,
                    universityId: user.universityId,
                    universityStatus: university?.status || 'active',
                    onboardingStage: university?.onboardingStage || 0
                },
            };
        } catch (error) {
            throw error;
        }
    }

    async impersonate(targetUserId: string) {
        const user = await this.userModel.findById(targetUserId).exec();
        if (!user) {
            throw new UnauthorizedException('Target user not found');
        }

        const payload = {
            username: user.username,
            sub: user._id,
            role: user.role,
            universityId: user.universityId,
            isImpersonated: true,
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user._id,
                username: user.username,
                name: user.name || user.username,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role,
                universityId: user.universityId,
            },
        };
    }

    async forgotPassword(email: string) {
        const user = await this.userModel.findOne({ email, isActive: true });
        if (!user) {
            return { message: 'If an account with that email exists, a reset link has been sent.' };
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date();
        expires.setHours(expires.getHours() + 1);

        user.resetPasswordToken = token;
        user.resetPasswordExpires = expires;
        await user.save();

        return { message: 'If an account with that email exists, a reset link has been sent.' };
    }

    private validatePasswordStrength(password: string): void {
        if (!password || password.length < 8) {
            throw new BadRequestException('Password must be at least 8 characters long');
        }
        if (!/[A-Z]/.test(password)) {
            throw new BadRequestException('Password must contain at least one uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
            throw new BadRequestException('Password must contain at least one lowercase letter');
        }
        if (!/[0-9]/.test(password)) {
            throw new BadRequestException('Password must contain at least one number');
        }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            throw new BadRequestException('Password must contain at least one special character');
        }
    }

    async resetPassword(token: string, newPassword: string) {
        this.validatePasswordStrength(newPassword);

        const user = await this.userModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() },
            isActive: true
        });

        if (!user) {
            throw new BadRequestException('Invalid or expired password reset token');
        }

        user.password = await this.hashPassword(newPassword);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.mustChangePassword = false;
        await user.save();

        return { message: 'Password has been successfully reset' };
    }

    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }
}
