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
        console.log(`[AuthDebug] Validating user: ${username}`);
        const user = await this.userModel.findOne({
            $or: [{ username }, { email: username }],
            isActive: true
        });

        console.log(`[AuthDebug] User found in DB: ${user ? user.username : 'NULL'}`);
        if (user) console.log(`[AuthDebug] Stored Hash: ${user.password.substring(0, 10)}...`);

        if (user && await bcrypt.compare(password, user.password)) {
            console.log(`[AuthDebug] Password MATCH`);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...result } = user.toObject();
            return result;
        }
        console.log(`[AuthDebug] Password MISMATCH or User NULL`);
        return null;
    }

    async login(username: string, password: string) {
        const user = await this.validateUser(username, password);
        if (!user) {
            console.log(`[AuthDebug] Login FAILED for user: ${username}`);
            throw new UnauthorizedException('Invalid credentials');
        }

        console.log(`[AuthDebug] Login SUCCESS for user: ${user.username}. Generating token...`);
        try {
            const payload = {
                username: user.username,
                sub: user._id,
                role: user.role,
                universityId: user.universityId,
            };
    
            // Update last login
            await this.userModel.findByIdAndUpdate(user._id, { lastLogin: new Date() });
            console.log(`[AuthDebug] Last login updated for user: ${user._id}`);
    
            // Fetch university details
            const university = await this.universityModel.findById(user.universityId).exec();
            console.log(`[AuthDebug] University lookup for: ${user.universityId} -> ${university ? 'FOUND' : 'NULL'}`);
    
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
            console.error(`[AuthDebug] Error during login finalization: ${error.message}`);
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

        console.log(`[AuthDebug] Reset token for ${email}: ${token}`);
        console.log(`[AuthDebug] Reset URL: http://localhost:3000/reset-password?token=${token}`);

        return { message: 'If an account with that email exists, a reset link has been sent.' };
    }

    async resetPassword(token: string, newPassword: string) {
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
