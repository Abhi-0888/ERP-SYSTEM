import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Timetable, TimetableSchema } from './timetable.schema';
import { TimetableService } from './timetable.service';
import { TimetableController } from './timetable.controller';
import { StudentProfile, StudentProfileSchema } from '../student/student-profile.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Timetable.name, schema: TimetableSchema },
            { name: StudentProfile.name, schema: StudentProfileSchema },
        ]),
    ],
    controllers: [TimetableController],
    providers: [TimetableService],
    exports: [TimetableService],
})
export class TimetableModule { }
