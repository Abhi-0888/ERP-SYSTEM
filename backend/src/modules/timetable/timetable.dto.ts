import { IsString, IsEnum, IsOptional, MinLength, MaxLength, IsNumber } from 'class-validator';

export enum TimetableStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED = 'ARCHIVED',
    CANCELLED = 'CANCELLED',
}

export enum DayOfWeek {
    MONDAY = 'MONDAY',
    TUESDAY = 'TUESDAY',
    WEDNESDAY = 'WEDNESDAY',
    THURSDAY = 'THURSDAY',
    FRIDAY = 'FRIDAY',
    SATURDAY = 'SATURDAY',
    SUNDAY = 'SUNDAY',
}

export class CreateTimetableDto {
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    name: string;

    @IsString()
    academicYearId: string;

    @IsString()
    @IsOptional()
    programId?: string;

    @IsString()
    @IsOptional()
    semesterId?: string;

    @IsEnum(TimetableStatus)
    @IsOptional()
    status?: TimetableStatus;

    @IsString()
    @IsOptional()
    description?: string;
}

export class UpdateTimetableDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsEnum(TimetableStatus)
    @IsOptional()
    status?: TimetableStatus;

    @IsString()
    @IsOptional()
    description?: string;
}

export class CreateTimetableSlotDto {
    @IsString()
    timetableId: string;

    @IsString()
    courseId: string;

    @IsEnum(DayOfWeek)
    dayOfWeek: DayOfWeek;

    @IsString()
    startTime: string;

    @IsString()
    endTime: string;

    @IsString()
    @IsOptional()
    classroom?: string;

    @IsString()
    @IsOptional()
    instructor?: string;

    @IsNumber()
    @IsOptional()
    capacity?: number;

    @IsString()
    @IsOptional()
    remarks?: string;
}

export class UpdateTimetableSlotDto {
    @IsString()
    @IsOptional()
    courseId?: string;

    @IsEnum(DayOfWeek)
    @IsOptional()
    dayOfWeek?: DayOfWeek;

    @IsString()
    @IsOptional()
    startTime?: string;

    @IsString()
    @IsOptional()
    endTime?: string;

    @IsString()
    @IsOptional()
    classroom?: string;

    @IsString()
    @IsOptional()
    instructor?: string;

    @IsNumber()
    @IsOptional()
    capacity?: number;

    @IsString()
    @IsOptional()
    remarks?: string;
}

export class TimetableFilterDto {
    @IsString()
    @IsOptional()
    academicYearId?: string;

    @IsString()
    @IsOptional()
    programId?: string;

    @IsString()
    @IsOptional()
    semesterId?: string;

    @IsEnum(TimetableStatus)
    @IsOptional()
    status?: TimetableStatus;

    @IsString()
    @IsOptional()
    search?: string;

    @IsOptional()
    page?: number;

    @IsOptional()
    limit?: number;
}

export class GetStudentTimetableDto {
    @IsString()
    studentId: string;

    @IsString()
    @IsOptional()
    academicYearId?: string;

    @IsString()
    @IsOptional()
    @IsOptional()
    dayOfWeek?: DayOfWeek;
}

export class GetInstructorTimetableDto {
    @IsString()
    instructorId: string;

    @IsString()
    @IsOptional()
    academicYearId?: string;

    @IsString()
    @IsOptional()
    dayOfWeek?: DayOfWeek;
}

export class TimetableConflictCheckDto {
    @IsString()
    timetableId: string;

    @IsString()
    courseId: string;

    @IsEnum(DayOfWeek)
    dayOfWeek: DayOfWeek;

    @IsString()
    startTime: string;

    @IsString()
    endTime: string;

    @IsString()
    @IsOptional()
    classroom?: string;

    @IsString()
    @IsOptional()
    instructor?: string;
}
