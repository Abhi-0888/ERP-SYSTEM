import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type TimetableDocument = Timetable & Document;

@Schema()
export class TimetableSlot {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
    courseId: MongooseSchema.Types.ObjectId;

    @Prop({ type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], required: true })
    day: string;

    @Prop({ required: true })
    startTime: string;

    @Prop({ required: true })
    endTime: string;

    @Prop()
    room: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
    facultyId: MongooseSchema.Types.ObjectId;
}

export const TimetableSlotSchema = SchemaFactory.createForClass(TimetableSlot);

@Schema({ timestamps: true })
export class Timetable {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course' })
    courseId?: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
    facultyId?: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Department', required: true })
    departmentId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'University', required: true })
    universityId: MongooseSchema.Types.ObjectId;

    @Prop({ required: true })
    semester: number;

    @Prop({ required: true })
    batch: string;

    @Prop({ type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] })
    day?: string;

    @Prop()
    startTime?: string;

    @Prop()
    endTime?: string;

    @Prop()
    roomNumber?: string;

    @Prop({ type: String, enum: ['Lecture', 'Lab', 'Tutorial'] })
    sessionType?: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'AcademicYear', required: true })
    academicYearId: MongooseSchema.Types.ObjectId;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ type: [TimetableSlotSchema], default: [] })
    slots: TimetableSlot[];
}

export const TimetableSchema = SchemaFactory.createForClass(Timetable);
