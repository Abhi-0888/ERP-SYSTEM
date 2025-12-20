import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../user/user.schema';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
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
