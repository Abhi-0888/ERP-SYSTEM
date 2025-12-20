import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

// Exam Schema
export type ExamDocument = Exam & Document;

@Schema({ timestamps: true })
export class Exam {
    @Prop({ required: true })
    name: string;

    @Prop({ type: String, enum: ['Internal', 'External', 'Midterm', 'Final'], required: true })
    type: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
    courseId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'AcademicYear', required: true })
    academicYearId: MongooseSchema.Types.ObjectId;

    @Prop({ required: true })
    examDate: Date;

    @Prop()
    duration: number; // in minutes

    @Prop({ required: true })
    totalMarks: number;

    @Prop()
    passingMarks: number;

    @Prop({ default: 'Scheduled' })
    status: string; // Scheduled, Ongoing, Completed, Cancelled
}

export const ExamSchema = SchemaFactory.createForClass(Exam);

// MarkSheet Schema
export type MarkSheetDocument = MarkSheet & Document;

@Schema({ timestamps: true })
export class MarkSheet {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'StudentProfile', required: true })
    studentId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Exam', required: true })
    examId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
    courseId: MongooseSchema.Types.ObjectId;

    @Prop({ required: true })
    marksObtained: number;

    @Prop()
    grade: string; // A, B, C, D, F

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
    enteredBy: MongooseSchema.Types.ObjectId; // Faculty/Exam Controller

    @Prop({ default: 'Pending' })
    status: string; // Pending, Approved, Revaluation

    @Prop()
    remarks: string;

    @Prop()
    isPass: boolean;

    @Prop()
    percentage: number;
}

export const MarkSheetSchema = SchemaFactory.createForClass(MarkSheet);
MarkSheetSchema.index({ studentId: 1, examId: 1, courseId: 1 }, { unique: true });
