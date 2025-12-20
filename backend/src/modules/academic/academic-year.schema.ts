import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type AcademicYearDocument = AcademicYear & Document;

@Schema({ timestamps: true })
export class AcademicYear {
    @Prop({ required: true })
    year: string; // e.g., "2024-2025"

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'University', required: true })
    universityId: MongooseSchema.Types.ObjectId;

    @Prop({ required: true })
    startDate: Date;

    @Prop({ required: true })
    endDate: Date;

    @Prop({ default: false })
    isCurrent: boolean;

    @Prop({ default: true })
    isActive: boolean;
}

export const AcademicYearSchema = SchemaFactory.createForClass(AcademicYear);
