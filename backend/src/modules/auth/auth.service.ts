import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
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

        const payload = {
            username: user.username,
            sub: user._id,
            role: user.role,
            universityId: user.universityId,
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
                role: user.role,
                universityId: user.universityId,
                universityStatus: university?.status || 'active',
                onboardingStage: university?.onboardingStage || 0
            },
        };
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
                role: user.role,
                universityId: user.universityId,
            },
        };
    }

    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }
}
