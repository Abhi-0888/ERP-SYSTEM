import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentProfile, StudentProfileSchema } from './student-profile.schema';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: StudentProfile.name, schema: StudentProfileSchema },
        ]),
    ],
    controllers: [StudentController],
    providers: [StudentService],
    exports: [StudentService],
})
export class StudentModule { }
