import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Exam, ExamSchema, MarkSheet, MarkSheetSchema } from './exam.schema';
import { ExamService } from './exam.service';
import { ExamController } from './exam.controller';
import { StudentProfile, StudentProfileSchema } from '../student/student-profile.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Exam.name, schema: ExamSchema },
            { name: MarkSheet.name, schema: MarkSheetSchema },
            { name: StudentProfile.name, schema: StudentProfileSchema },
        ]),
    ],
    controllers: [ExamController],
    providers: [ExamService],
    exports: [ExamService],
})
export class ExamModule { }
