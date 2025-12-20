import { IsString, IsNumber, IsEnum, IsOptional, MinLength, MaxLength, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum ExamType {
    MIDTERM = 'MIDTERM',
    ENDTERM = 'ENDTERM',
    PRACTICAL = 'PRACTICAL',
    ASSIGNMENT = 'ASSIGNMENT',
}

export enum ExamStatus {
    SCHEDULED = 'SCHEDULED',
    ONGOING = 'ONGOING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export class CreateExamDto {
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    name: string;

    @IsEnum(ExamType)
    type: ExamType;

    @IsString()
    courseId: string;

    @IsString()
    academicYearId: string;

    @IsString()
    @Type(() => Date)
    examDate: Date;

    @IsString()
    @Type(() => Date)
    startTime: Date;

    @IsString()
    @Type(() => Date)
    endTime: Date;

    @IsNumber()
    @Min(0)
    @Max(300)
    totalMarks: number;

    @IsNumber()
    @Min(0)
    @Max(300)
    passingMarks: number;

    @IsString()
    @IsOptional()
    location?: string;

    @IsString()
    @IsOptional()
    description?: string;
}

export class UpdateExamDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsEnum(ExamType)
    @IsOptional()
    type?: ExamType;

    @IsString()
    @IsOptional()
    examDate?: string;

    @IsString()
    @IsOptional()
    startTime?: string;

    @IsString()
    @IsOptional()
    endTime?: string;

    @IsNumber()
    @IsOptional()
    totalMarks?: number;

    @IsNumber()
    @IsOptional()
    passingMarks?: number;

    @IsString()
    @IsOptional()
    location?: string;

    @IsEnum(ExamStatus)
    @IsOptional()
    status?: ExamStatus;

    @IsString()
    @IsOptional()
    description?: string;
}

export class RecordExamMarksDto {
    @IsString()
    studentId: string;

    @IsNumber()
    @Min(0)
    @Max(300)
    obtainedMarks: number;

    @IsString()
    @IsOptional()
    remarks?: string;
}

export class BulkExamMarksDto {
    @IsString()
    examId: string;

    @Type(() => RecordExamMarksDto)
    marks: RecordExamMarksDto[];
}

export class ExamFilterDto {
    @IsString()
    @IsOptional()
    courseId?: string;

    @IsString()
    @IsOptional()
    academicYearId?: string;

    @IsEnum(ExamType)
    @IsOptional()
    type?: ExamType;

    @IsEnum(ExamStatus)
    @IsOptional()
    status?: ExamStatus;

    @IsString()
    @IsOptional()
    search?: string;

    @IsOptional()
    page?: number;

    @IsOptional()
    limit?: number;
}

export class ExamResultDto {
    @IsString()
    studentId: string;

    @IsNumber()
    marks: number;

    @IsNumber()
    percentage: number;

    @IsString()
    grade: string;

    @IsString()
    @IsOptional()
    remarks?: string;
}
