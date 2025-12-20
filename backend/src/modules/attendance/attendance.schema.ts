import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type AttendanceDocument = Attendance & Document;

@Schema({ timestamps: true })
export class Attendance {
    @Prop({ required: true })
    date: Date;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
    courseId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'StudentProfile', required: true })
    studentId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    markedBy: MongooseSchema.Types.ObjectId; // Faculty

    @Prop({ type: String, enum: ['Present', 'Absent', 'Late', 'Excused'], required: true })
    status: string;

    @Prop()
    remarks: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'AcademicYear' })
    academicYearId: MongooseSchema.Types.ObjectId;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
// Create compound index for efficient queries
AttendanceSchema.index({ courseId: 1, studentId: 1, date: 1 }, { unique: true });
