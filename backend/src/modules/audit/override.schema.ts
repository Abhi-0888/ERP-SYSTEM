import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PermissionOverrideDocument = PermissionOverride & Document;

@Schema({ timestamps: true })
export class PermissionOverride {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    userId: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'University', required: true })
    universityId: string;

    @Prop({ required: true })
    originalRole: string;

    @Prop({ required: true })
    temporaryRole: string;

    @Prop({ required: true })
    reason: string;

    @Prop({ required: true })
    expiresAt: Date;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    createdBy: string; // The Super Admin who issued the override

    @Prop({ default: 'active', enum: ['active', 'revoked', 'expired'] })
    status: string;
}

export const PermissionOverrideSchema = SchemaFactory.createForClass(PermissionOverride);
