import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type LeaveDocument = Leave & Document;

export enum LeaveType {
    CASUAL = 'CASUAL',
    MEDICAL = 'MEDICAL',
    EARNED = 'EARNED',
    MATERNITY = 'MATERNITY',
    PATERNITY = 'PATERNITY',
    STUDY = 'STUDY',
    SICK = 'SICK',
    OTHER = 'OTHER'
}

export enum LeaveStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED'
}

@Schema({ timestamps: true })
export class Leave {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    userId: MongooseSchema.Types.ObjectId;

    @Prop({ required: true, type: String, enum: Object.values(LeaveType) })
    leaveType: LeaveType;

    @Prop({ required: true })
    startDate: Date;

    @Prop({ required: true })
    endDate: Date;

    @Prop({ required: true })
    totalDays: number;

    @Prop({ required: true })
    reason: string;

    @Prop({ type: String, enum: Object.values(LeaveStatus), default: LeaveStatus.PENDING })
    status: LeaveStatus;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
    approvedBy: MongooseSchema.Types.ObjectId;

    @Prop()
    approvedAt: Date;

    @Prop()
    rejectionReason: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'University', required: true })
    universityId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Department' })
    departmentId: MongooseSchema.Types.ObjectId;

    @Prop()
    isHalfDay: boolean;

    @Prop({ type: String, enum: ['FIRST_HALF', 'SECOND_HALF'] })
    halfDayType: string;

    @Prop({ default: false })
    isEmergency: boolean;

    @Prop()
    attachmentUrl: string;

    @Prop({ default: false })
    isActive: boolean;
}

export const LeaveSchema = SchemaFactory.createForClass(Leave);
