import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class SupportTicket extends Document {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    userId: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'University', required: true })
    universityId: string;

    @Prop({ required: true })
    subject: string;

    @Prop({ required: true })
    description: string;

    @Prop({ default: 'open', enum: ['open', 'in-progress', 'resolved', 'closed'] })
    status: string;

    @Prop({ default: 'medium', enum: ['low', 'medium', 'high', 'critical'] })
    priority: string;

    @Prop({ type: [Object], default: [] })
    updates: {
        message: string;
        updatedBy: string;
        at: Date;
    }[];
}

export const SupportTicketSchema = SchemaFactory.createForClass(SupportTicket);
