import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    code: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Department', required: true })
    departmentId: MongooseSchema.Types.ObjectId;

    @Prop({ required: true })
    credits: number;

    @Prop({ required: true })
    semester: number;

    @Prop({ type: String, enum: ['Theory', 'Practical', 'TheoryPractical'] })
    type: string;

    @Prop()
    description: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
    facultyId: MongooseSchema.Types.ObjectId;

    @Prop({ default: true })
    isActive: boolean;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
