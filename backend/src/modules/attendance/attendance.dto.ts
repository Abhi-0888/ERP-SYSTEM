import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export enum AttendanceStatus {
    PRESENT = 'PRESENT',
    ABSENT = 'ABSENT',
    LATE = 'LATE',
    LEAVE = 'LEAVE',
    EXCUSED = 'EXCUSED',
}

export class MarkAttendanceDto {
    @IsString()
    studentId: string;

    @IsString()
    courseId: string;

    @IsEnum(AttendanceStatus)
    status: AttendanceStatus;

    @IsString()
    @Type(() => Date)
    @IsOptional()
    date?: Date;

    @IsString()
    @IsOptional()
    remarks?: string;
}

export class BulkMarkAttendanceDto {
    @IsString()
    courseId: string;

    @IsString()
    @Type(() => Date)
    @IsOptional()
    date?: Date;

    @Type(() => MarkAttendanceDto)
    attendance: MarkAttendanceDto[];

    @IsString()
    @IsOptional()
    remarks?: string;
}

export class UpdateAttendanceDto {
    @IsEnum(AttendanceStatus)
    @IsOptional()
    status?: AttendanceStatus;

    @IsString()
    @IsOptional()
    remarks?: string;
}

export class AttendanceFilterDto {
    @IsString()
    @IsOptional()
    studentId?: string;

    @IsString()
    @IsOptional()
    courseId?: string;

    @IsString()
    @IsOptional()
    academicYearId?: string;

    @IsEnum(AttendanceStatus)
    @IsOptional()
    status?: AttendanceStatus;

    @IsOptional()
    @Type(() => Date)
    startDate?: Date;

    @IsOptional()
    @Type(() => Date)
    endDate?: Date;

    @IsOptional()
    page?: number;

    @IsOptional()
    limit?: number;
}

export class AttendanceReportDto {
    @IsString()
    @IsOptional()
    studentId?: string;

    @IsString()
    @IsOptional()
    courseId?: string;

    @IsString()
    @IsOptional()
    academicYearId?: string;

    @IsOptional()
    @Type(() => Date)
    startDate?: Date;

    @IsOptional()
    @Type(() => Date)
    endDate?: Date;

    @IsString()
    @IsOptional()
    reportType?: string;
}

export class StudentAttendanceDto {
    @IsString()
    studentId: string;

    @IsNumber()
    totalClasses: number;

    @IsNumber()
    presentClasses: number;

    @IsNumber()
    absentClasses: number;

    @IsNumber()
    attendancePercentage: number;

    @IsString()
    @IsOptional()
    remarks?: string;
}

export class CourseAttendanceSummaryDto {
    @IsString()
    courseId: string;

    @IsNumber()
    totalStudents: number;

    @IsNumber()
    averageAttendance: number;

    @IsNumber()
    presentCount: number;

    @IsNumber()
    absentCount: number;

    @IsNumber()
    lateCount: number;
}
