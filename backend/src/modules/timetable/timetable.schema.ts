import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type TimetableDocument = Timetable & Document;

@Schema({ timestamps: true })
export class Timetable {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
    courseId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    facultyId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Department', required: true })
    departmentId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'University', required: true })
    universityId: MongooseSchema.Types.ObjectId;

    @Prop({ required: true })
    semester: number;

    @Prop({ required: true })
    batch: string;

    @Prop({ type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], required: true })
    day: string;

    @Prop({ required: true })
    startTime: string; // e.g., "09:00"

    @Prop({ required: true })
    endTime: string; // e.g., "10:00"

    @Prop()
    roomNumber: string;

    @Prop({ type: String, enum: ['Lecture', 'Lab', 'Tutorial'] })
    sessionType: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'AcademicYear', required: true })
    academicYearId: MongooseSchema.Types.ObjectId;

    @Prop({ default: true })
    isActive: boolean;
}

@Schema()
export class TimetableSlot {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
    courseId: MongooseSchema.Types.ObjectId;

    @Prop({ type: String, enum: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'], required: true })
    dayOfWeek: string;

    @Prop({ required: true })
    startTime: string;

    @Prop({ required: true })
    endTime: string;

    @Prop()
    classroom: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
    instructor: MongooseSchema.Types.ObjectId;

    @Prop()
    capacity: number;

    @Prop()
    remarks: string;
}

export const TimetableSlotSchema = SchemaFactory.createForClass(TimetableSlot);

// add slots array to timetable
@Schema({ timestamps: true })
export class TimetableWithSlots extends Timetable { }

// Attach slots property dynamically using SchemaFactory
const _TimetableSchema = SchemaFactory.createForClass(Timetable);
(_TimetableSchema as any).add({ slots: { type: [TimetableSlotSchema], default: [] } });

export const TimetableSchema = _TimetableSchema;
