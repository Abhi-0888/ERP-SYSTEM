import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Role } from '../../common/enums/role.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true, type: String, enum: Role })
    role: Role;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'University', index: true })
    universityId: MongooseSchema.Types.ObjectId;

    @Prop({ default: false })
    isDeleted: boolean;

    @Prop({ type: Date, default: null })
    deletedAt: Date;

    @Prop({ type: MongooseSchema.Types.ObjectId })
    profileId: MongooseSchema.Types.ObjectId;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ default: 'active' })
    status: string;

    @Prop()
    email: string;

    @Prop()
    phoneNumber: string;

    @Prop()
    lastLogin: Date;

    @Prop()
    lastLogoutAllNodes: Date;

    @Prop({ default: false })
    mustChangePassword: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
