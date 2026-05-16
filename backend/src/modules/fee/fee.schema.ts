import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum FeeStatusEnum {
    PENDING = 'PENDING',
    PARTIALLY_PAID = 'PARTIALLY_PAID',
    FULLY_PAID = 'FULLY_PAID',
    OVERDUE = 'OVERDUE',
    WAIVED = 'WAIVED',
}

export enum PaymentMethodEnum {
    CASH = 'CASH',
    CHEQUE = 'CHEQUE',
    BANK_TRANSFER = 'BANK_TRANSFER',
    CARD = 'CARD',
    ONLINE = 'ONLINE',
}

export type FeeStructureDocument = FeeStructure & Document;

@Schema({ timestamps: true })
export class FeeStructure {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Program' })
    programId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'University', required: true })
    universityId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'AcademicYear', required: true })
    academicYearId: MongooseSchema.Types.ObjectId;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    type: string;

    @Prop({ required: true, min: 1, max: 1000000 })
    amount: number;

    @Prop()
    dueDate: Date;

    @Prop({ default: 0 })
    lateFeePerDay: number;

    @Prop({ maxlength: 500 })
    description: string;

    @Prop({ enum: Object.values(FeeStatusEnum), default: FeeStatusEnum.PENDING })
    status: FeeStatusEnum;
}

export const FeeStructureSchema = SchemaFactory.createForClass(FeeStructure);

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'StudentProfile', required: true })
    studentId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'FeeStructure', required: true })
    feeId: MongooseSchema.Types.ObjectId;

    @Prop({ required: true, min: 1, max: 1000000 })
    amount: number;

    @Prop({ default: 0, min: 0, max: 1000000 })
    amountPaid: number;

    @Prop({ default: 0 })
    lateFeesApplied: number;

    @Prop({ default: 0 })
    discountAmount: number;

    @Prop({ maxlength: 200 })
    discountReason: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Scholarship' })
    scholarshipId: MongooseSchema.Types.ObjectId;

    @Prop({ enum: Object.values(PaymentMethodEnum) })
    paymentMethod: PaymentMethodEnum;

    @Prop({ enum: Object.values(FeeStatusEnum), default: FeeStatusEnum.PENDING })
    status: FeeStatusEnum;

    @Prop({ maxlength: 100 })
    transactionId: string;

    @Prop({ maxlength: 100 })
    razorpayOrderId: string;

    @Prop({ maxlength: 100 })
    razorpayPaymentId: string;

    @Prop({ maxlength: 200 })
    razorpaySignature: string;

    @Prop()
    lastPaymentDate: Date;

    @Prop()
    dueDate: Date;

    @Prop()
    paymentDate: Date;

    @Prop({ maxlength: 100 })
    receiptNumber: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
    processedBy: MongooseSchema.Types.ObjectId;

    @Prop({ maxlength: 500 })
    remarks: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'University' })
    universityId: MongooseSchema.Types.ObjectId;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
