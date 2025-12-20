import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type FeeStructureDocument = FeeStructure & Document;

@Schema({ timestamps: true })
export class FeeStructure {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Program', required: true })
    programId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'University', required: true })
    universityId: MongooseSchema.Types.ObjectId;

    @Prop({ required: true })
    year: number;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    type: string;

    @Prop({ required: true })
    amount: number;

    @Prop()
    dueDate: Date;

    @Prop()
    description: string;

    @Prop({ default: 'PENDING' })
    status: string;
}

export const FeeStructureSchema = SchemaFactory.createForClass(FeeStructure);

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'StudentProfile', required: true })
    studentId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'FeeStructure', required: true })
    feeId: MongooseSchema.Types.ObjectId; // Service uses feeId

    @Prop({ required: true })
    amount: number;

    @Prop({ default: 0 })
    amountPaid: number;

    @Prop()
    paymentMethod: string; // Service uses paymentMethod

    @Prop({ default: 'PENDING' })
    status: string;

    @Prop()
    transactionId: string;

    @Prop()
    lastPaymentDate: Date; // Service uses lastPaymentDate

    @Prop()
    dueDate: Date; // Service uses dueDate

    @Prop()
    paymentDate: Date;

    @Prop()
    receiptNumber: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
    processedBy: MongooseSchema.Types.ObjectId;

    @Prop()
    remarks: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
