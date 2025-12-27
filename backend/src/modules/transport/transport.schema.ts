import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type VehicleDocument = Vehicle & Document;
export type RouteDocument = Route & Document;

@Schema({ timestamps: true })
export class Vehicle {
    @Prop({ required: true })
    registrationNumber: string;

    @Prop({ required: true })
    type: string; // Bus, Van, etc.

    @Prop({ required: true })
    capacity: number;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
    driverId: MongooseSchema.Types.ObjectId;

    @Prop({ default: 'active', enum: ['active', 'maintenance', 'inactive'] })
    status: string;

    @Prop({ default: '100%' })
    health: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'University', required: true })
    universityId: MongooseSchema.Types.ObjectId;

    @Prop({ default: true })
    isActive: boolean;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);

@Schema({ timestamps: true })
export class Route {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    startPoint: string;

    @Prop({ required: true })
    endPoint: string;

    @Prop({ type: [String], default: [] })
    stops: string[];

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Vehicle' })
    vehicleId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'University', required: true })
    universityId: MongooseSchema.Types.ObjectId;

    @Prop({ default: true })
    isActive: boolean;
}

export const RouteSchema = SchemaFactory.createForClass(Route);
