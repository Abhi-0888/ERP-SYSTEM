import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SuperAdminController } from './super-admin.controller';
import { UniversityModule } from '../university/university.module';
import { forwardRef } from '@nestjs/common';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        forwardRef(() => UniversityModule),
    ],
    controllers: [UserController, SuperAdminController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule { }
