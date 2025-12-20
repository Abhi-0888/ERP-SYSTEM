import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type StudentProfileDocument = StudentProfile & Document;

@Schema({ timestamps: true })
export class StudentProfile {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    userId: MongooseSchema.Types.ObjectId;

    @Prop({ required: true, unique: true })
    enrollmentNo: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Program', required: true })
    programId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Department', required: true })
    departmentId: MongooseSchema.Types.ObjectId;

    @Prop({ required: true })
    currentSemester: number;

    @Prop({ required: true })
    batch: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'AcademicYear' })
    academicYearId: MongooseSchema.Types.ObjectId;

    @Prop({ type: Object, default: {} })
    guardianDetails: {
        name?: string;
        relation?: string;
        phone?: string;
        email?: string;
    };

    @Prop()
    dateOfBirth: Date;

    @Prop()
    gender: string;

    @Prop()
    bloodGroup: string;

    @Prop()
    address: string;

    @Prop({ default: 'Active' })
    status: string;

    @Prop()
    admissionDate: Date;

    @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Course', default: [] })
    enrolledCourses: MongooseSchema.Types.ObjectId[];
}

export const StudentProfileSchema = SchemaFactory.createForClass(StudentProfile);
