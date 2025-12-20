import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    async create(createUserDto: any): Promise<User> {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const createdUser = new this.userModel({
            ...createUserDto,
            password: hashedPassword,
        });
        return createdUser.save();
    }

    async findAll(universityId?: string): Promise<User[]> {
        const filter = universityId ? { universityId } : {};
        return this.userModel.find(filter).select('-password').exec();
    }

    async findOne(id: string): Promise<User> {
        return this.userModel.findById(id).select('-password').exec();
    }

    async findByUsername(username: string): Promise<User> {
        return this.userModel.findOne({ username }).exec();
    }

    async update(id: string, updateUserDto: any): Promise<User> {
        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }
        return this.userModel
            .findByIdAndUpdate(id, updateUserDto, { new: true })
            .select('-password')
            .exec();
    }

    async remove(id: string): Promise<User> {
        return this.userModel.findByIdAndDelete(id).exec();
    }

    async findByRole(role: string, universityId?: string): Promise<User[]> {
        const filter: any = { role };
        if (universityId) filter.universityId = universityId;
        return this.userModel.find(filter).select('-password').exec();
    }
}
