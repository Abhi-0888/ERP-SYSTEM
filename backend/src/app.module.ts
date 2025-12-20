import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/auth/auth.module';
import { UniversityModule } from './modules/university/university.module';
import { UserModule } from './modules/user/user.module';
import { AcademicModule } from './modules/academic/academic.module';
import { StudentModule } from './modules/student/student.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { TimetableModule } from './modules/timetable/timetable.module';
import { ExamModule } from './modules/exam/exam.module';
import { FeeModule } from './modules/fee/fee.module';
import { LibraryModule } from './modules/library/library.module';
import { HostelModule } from './modules/hostel/hostel.module';
import { PlacementModule } from './modules/placement/placement.module';
import { AuditModule } from './modules/audit/audit.module';
import { SettingsModule } from './modules/settings/settings.module';
import { SupportModule } from './modules/support/support.module';
import { AppController } from './app.controller';

import { APP_INTERCEPTOR } from '@nestjs/core';
import { DataIsolationInterceptor } from './common/interceptors/data-isolation.interceptor';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        ScheduleModule.forRoot(),
        MongooseModule.forRoot(
            process.env.DATABASE_URL || 'mongodb://localhost:27017/university-erp',
        ),
        AuthModule,
        UniversityModule,
        UserModule,
        AcademicModule,
        StudentModule,
        AttendanceModule,
        TimetableModule,
        ExamModule,
        FeeModule,
        LibraryModule,
        HostelModule,
        PlacementModule,
        AuditModule,
        SettingsModule,
        SupportModule,
    ],
    controllers: [AppController],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: DataIsolationInterceptor,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: AuditInterceptor,
        },
    ],
})
export class AppModule { }
