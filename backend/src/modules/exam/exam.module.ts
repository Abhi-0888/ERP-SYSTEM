import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Exam, ExamSchema, MarkSheet, MarkSheetSchema } from './exam.schema';
import { ExamService } from './exam.service';
import { ExamController } from './exam.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Exam.name, schema: ExamSchema },
            { name: MarkSheet.name, schema: MarkSheetSchema },
        ]),
    ],
    controllers: [ExamController],
    providers: [ExamService],
    exports: [ExamService],
})
export class ExamModule { }
