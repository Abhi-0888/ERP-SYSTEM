import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Department, DepartmentSchema } from './department.schema';
import { Program, ProgramSchema } from './program.schema';
import { Course, CourseSchema } from './course.schema';
import { AcademicYear, AcademicYearSchema } from './academic-year.schema';
import { Section, SectionSchema } from './section.schema';
import { Leave, LeaveSchema } from './leave.schema';
import { AcademicService } from './academic.service';
import { AcademicController } from './academic.controller';
import { SectionService } from './section.service';
import { SectionController } from './section.controller';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Department.name, schema: DepartmentSchema },
            { name: Program.name, schema: ProgramSchema },
            { name: Course.name, schema: CourseSchema },
            { name: AcademicYear.name, schema: AcademicYearSchema },
            { name: Section.name, schema: SectionSchema },
            { name: Leave.name, schema: LeaveSchema },
        ]),
    ],
    controllers: [AcademicController, SectionController, LeaveController],
    providers: [AcademicService, SectionService, LeaveService],
    exports: [AcademicService, SectionService, LeaveService],
})
export class AcademicModule { }
