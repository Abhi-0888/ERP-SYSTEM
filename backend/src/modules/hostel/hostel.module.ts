import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HostelController } from './hostel.controller';
import { HostelService } from './hostel.service';
import { Hostel, HostelSchema, Room, RoomSchema } from './hostel.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Hostel.name, schema: HostelSchema },
            { name: Room.name, schema: RoomSchema },
        ]),
    ],
    controllers: [HostelController],
    providers: [HostelService],
    exports: [HostelService],
})
export class HostelModule { }
