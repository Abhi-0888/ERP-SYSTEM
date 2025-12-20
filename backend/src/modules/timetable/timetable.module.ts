import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Timetable, TimetableSchema } from './timetable.schema';
import { TimetableService } from './timetable.service';
import { TimetableController } from './timetable.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Timetable.name, schema: TimetableSchema },
        ]),
    ],
    controllers: [TimetableController],
    providers: [TimetableService],
    exports: [TimetableService],
})
export class TimetableModule { }
