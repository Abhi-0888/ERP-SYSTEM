import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { StudentProfile, StudentProfileSchema } from '../student/student-profile.schema';
import { User, UserSchema } from '../user/user.schema';
import { Attendance, AttendanceSchema } from '../attendance/attendance.schema';
import { Transaction, TransactionSchema } from '../fee/fee.schema';
import { Hostel, HostelSchema, Room, RoomSchema } from '../hostel/hostel.schema';
import { Book, BookSchema, BookIssue, BookIssueSchema } from '../library/library.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: StudentProfile.name, schema: StudentProfileSchema },
            { name: User.name, schema: UserSchema },
            { name: Attendance.name, schema: AttendanceSchema },
            { name: Transaction.name, schema: TransactionSchema },
            { name: Hostel.name, schema: HostelSchema },
            { name: Room.name, schema: RoomSchema },
            { name: Book.name, schema: BookSchema },
            { name: BookIssue.name, schema: BookIssueSchema },
        ]),
    ],
    controllers: [StatsController],
    providers: [StatsService],
    exports: [StatsService],
})
export class StatsModule { }
