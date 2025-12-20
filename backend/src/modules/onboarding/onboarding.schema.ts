import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type OnboardingStatusDocument = OnboardingStatus & Document;

@Schema({ timestamps: true })
export class OnboardingStatus {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'University', required: true, unique: true })
    universityId: MongooseSchema.Types.ObjectId;

    @Prop({ default: 0 })
    currentStage: number;

    @Prop({ type: [Number], default: [] })
    completedStages: number[];

    @Prop({ type: Object, default: {} })
    stageData: Record<string, any>;
}

export const OnboardingStatusSchema = SchemaFactory.createForClass(OnboardingStatus);
