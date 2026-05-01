import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type SectionDocument = Section & Document;

@Schema({ timestamps: true })
export class Section {
    @Prop({ required: true })
    name: string; // e.g., "A", "B", "C"

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Department', required: true })
    departmentId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Program', required: true })
    programId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'AcademicYear', required: true })
    academicYearId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'University', required: true })
    universityId: MongooseSchema.Types.ObjectId;

    @Prop({ required: true })
    semester: number;

    @Prop({ required: true })
    batch: string; // e.g., "2026"

    @Prop({ default: 60 })
    maxStrength: number;

    @Prop({ default: 0 })
    currentStrength: number;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
    classAdvisorId: MongooseSchema.Types.ObjectId;

    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'StudentProfile' }], default: [] })
    students: MongooseSchema.Types.ObjectId[];

    @Prop({ default: true })
    isActive: boolean;
}

export const SectionSchema = SchemaFactory.createForClass(Section);
SectionSchema.index({ programId: 1, semester: 1, name: 1, batch: 1, universityId: 1 }, { unique: true });
