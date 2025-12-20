import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type JobPostDocument = JobPost & Document;

@Schema({ timestamps: true })
export class JobPost {
    @Prop({ required: true })
    company: string;

    @Prop({ required: true })
    role: string;

    @Prop()
    description: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'University', required: true })
    universityId: MongooseSchema.Types.ObjectId;

    @Prop({ type: Object, default: {} })
    eligibilityCriteria: {
        minCGPA?: number;
        allowedPrograms?: string[];
        allowedDepartments?: string[];
        passingYear?: number;
    };

    @Prop()
    package: string;

    @Prop({ required: true })
    deadline: Date;

    @Prop({ default: 'Active' })
    status: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
    postedBy: MongooseSchema.Types.ObjectId;

    @Prop()
    driveDate: Date;
}

export const JobPostSchema = SchemaFactory.createForClass(JobPost);

export type ApplicationDocument = Application & Document;

@Schema({ timestamps: true })
export class Application {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'JobPost', required: true })
    jobId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'StudentProfile', required: true })
    studentId: MongooseSchema.Types.ObjectId;

    @Prop({ required: true })
    appliedDate: Date;

    @Prop({ type: String, enum: ['Applied', 'Shortlisted', 'Rejected', 'Selected', 'Placed'], default: 'Applied' })
    status: string;

    @Prop()
    resumeUrl: string;

    @Prop()
    remarks: string;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
ApplicationSchema.index({ jobId: 1, studentId: 1 }, { unique: true });
