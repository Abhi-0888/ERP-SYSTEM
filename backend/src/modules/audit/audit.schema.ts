import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class AuditLog extends Document {
    @Prop({ required: true })
    action: string; // e.g., 'CREATE', 'UPDATE', 'DELETE'

    @Prop({ required: true })
    module: string; // e.g., 'STUDENT', 'COURSE', 'FEE'

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    userId: string;

    @Prop({ required: true })
    username: string;

    @Prop({ type: MongooseSchema.Types.Mixed })
    payload: any; // The request body or changes

    @Prop()
    endpoint: string;

    @Prop()
    method: string;

    @Prop()
    universityId: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
