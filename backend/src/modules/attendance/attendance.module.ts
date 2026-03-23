import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Attendance, AttendanceSchema } from './attendance.schema';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { StudentProfile, StudentProfileSchema } from '../student/student-profile.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Attendance.name, schema: AttendanceSchema },
            { name: StudentProfile.name, schema: StudentProfileSchema },
        ]),
    ],
    controllers: [AttendanceController],
    providers: [AttendanceService],
    exports: [AttendanceService],
})
export class AttendanceModule { }
