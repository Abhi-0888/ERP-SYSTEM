import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Department, DepartmentSchema } from './department.schema';
import { Program, ProgramSchema } from './program.schema';
import { Course, CourseSchema } from './course.schema';
import { AcademicYear, AcademicYearSchema } from './academic-year.schema';
import { AcademicService } from './academic.service';
import { AcademicController } from './academic.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Department.name, schema: DepartmentSchema },
            { name: Program.name, schema: ProgramSchema },
            { name: Course.name, schema: CourseSchema },
            { name: AcademicYear.name, schema: AcademicYearSchema },
        ]),
    ],
    controllers: [AcademicController],
    providers: [AcademicService],
    exports: [AcademicService],
})
export class AcademicModule { }
