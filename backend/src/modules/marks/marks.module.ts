import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Mark, MarkSchema } from './marks.schema';
import { StudentProfile, StudentProfileSchema } from '../student/student-profile.schema';
import { MarksController } from './marks.controller';
import { MarksService } from './marks.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Mark.name, schema: MarkSchema },
            { name: StudentProfile.name, schema: StudentProfileSchema },
        ]),
    ],
    controllers: [MarksController],
    providers: [MarksService],
})
export class MarksModule {}
