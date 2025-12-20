import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type DepartmentDocument = Department & Document;

@Schema({ timestamps: true })
export class Department {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    code: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'University', required: true })
    universityId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
    hodId: MongooseSchema.Types.ObjectId;

    @Prop()
    description: string;

    @Prop({ default: true })
    isActive: boolean;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);
