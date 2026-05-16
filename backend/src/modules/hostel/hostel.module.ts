import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HostelController } from './hostel.controller';
import { HostelService } from './hostel.service';
import { FeeModule } from '../fee/fee.module';
import { Hostel, HostelSchema, Room, RoomSchema, HostelEnrollment, HostelEnrollmentSchema } from './hostel.schema';

@Module({
    imports: [
        FeeModule,
        MongooseModule.forFeature([
            { name: Hostel.name, schema: HostelSchema },
            { name: Room.name, schema: RoomSchema },
            { name: HostelEnrollment.name, schema: HostelEnrollmentSchema },
        ]),
    ],
    controllers: [HostelController],
    providers: [HostelService],
    exports: [HostelService],
})
export class HostelModule { }
