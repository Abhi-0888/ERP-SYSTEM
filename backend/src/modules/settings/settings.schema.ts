import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class GlobalSettings extends Document {
    @Prop({ default: 60 })
    jwtAccessExpiry: number;

    @Prop({ default: 7 })
    jwtRefreshExpiry: number;

    @Prop({ default: true })
    strictPasswordComplexity: boolean;

    @Prop({ default: true })
    sessionHeartbeatEnabled: boolean;

    @Prop({ default: 600 })
    globalRateLimit: number;

    @Prop({ default: 25 })
    maxFileUploadSizeMB: number;

    @Prop({ type: Object, default: {} })
    emailProvider: {
        host: string;
        apiKey: string;
        sender: string;
    };

    @Prop({ type: Object, default: {} })
    smsProvider: {
        accountSid: string;
        authToken: string;
    };

    @Prop({ type: Object, default: {} })
    storageProvider: {
        bucket: string;
        region: string;
        accessKey: string;
        secretKey: string;
    };
}

export const GlobalSettingsSchema = SchemaFactory.createForClass(GlobalSettings);
