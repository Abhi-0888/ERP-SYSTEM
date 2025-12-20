import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

// Hostel Schema
export type HostelDocument = Hostel & Document;

@Schema({ timestamps: true })
export class Hostel {
    @Prop({ required: true })
    name: string;

    @Prop({ type: String, enum: ['Boys', 'Girls', 'Mixed'], required: true })
    type: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'University', required: true })
    universityId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
    wardenId: MongooseSchema.Types.ObjectId;

    @Prop()
    address: string;

    @Prop({ required: true })
    totalRooms: number;

    @Prop({ default: true })
    isActive: boolean;
}

export const HostelSchema = SchemaFactory.createForClass(Hostel);

// Room Schema
export type RoomDocument = Room & Document;

@Schema({ timestamps: true })
export class Room {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Hostel', required: true })
    hostelId: MongooseSchema.Types.ObjectId;

    @Prop({ required: true })
    roomNumber: string;

    @Prop({ required: true })
    capacity: number;

    @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'StudentProfile', default: [] })
    occupants: MongooseSchema.Types.ObjectId[];

    @Prop({ type: String, enum: ['AC', 'Non-AC'] })
    roomType: string;

    @Prop()
    floor: number;

    @Prop({ default: true })
    isActive: boolean;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
RoomSchema.index({ hostelId: 1, roomNumber: 1 }, { unique: true });
