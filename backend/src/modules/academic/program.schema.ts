import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ProgramDocument = Program & Document;

@Schema({ timestamps: true })
export class Program {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    code: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Department', required: true })
    departmentId: MongooseSchema.Types.ObjectId;

    @Prop({ required: true })
    duration: number; // in years

    @Prop({ type: String, enum: ['UG', 'PG', 'Diploma', 'PhD'] })
    level: string;

    @Prop()
    description: string;

    @Prop({ default: true })
    isActive: boolean;
}

export const ProgramSchema = SchemaFactory.createForClass(Program);
