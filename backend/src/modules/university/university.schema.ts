import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UniversityDocument = University & Document;

@Schema({ timestamps: true })
export class University {
    @Prop({ required: true, unique: true })
    name: string;

    @Prop({ required: true, unique: true })
    code: string;

    @Prop()
    address: string;

    @Prop({ default: false })
    isDeleted: boolean;

    @Prop({ type: Date, default: null })
    deletedAt: Date;

    @Prop({ default: 'basic' })
    subscriptionPlan: string;

    @Prop({ type: Object, default: {} })
    settings: Record<string, any>;

    @Prop({ type: [String], default: [] })
    enabledModules: string[];

    @Prop({
        type: Object, default: {
            maxUsers: 5000,
            maxStudents: 10000,
            storageLimitGB: 100,
            expiryDate: null,
            isTrial: false
        }
    })
    subscriptionDetails: Record<string, any>;

    @Prop({ default: 'setup' })
    status: string; // 'setup' | 'active' | 'suspended'

    @Prop({ default: 0 })
    onboardingStage: number;

    @Prop()
    logo: string;

    @Prop()
    contactEmail: string;

    @Prop()
    contactPhone: string;
}

export const UniversitySchema = SchemaFactory.createForClass(University);
