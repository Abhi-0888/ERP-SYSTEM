import { IsString, IsNumber, IsOptional, IsEnum, Min, Max, IsMongoId } from 'class-validator';

export class CreateMarkDto {
    @IsString()
    studentId: string;

    @IsString()
    examId: string;

    @IsNumber()
    @Min(0)
    @Max(100)
    marksObtained: number;

    @IsOptional()
    @IsString()
    remarks?: string;
}

export class UpdateMarkDto {
    @IsOptional()
    @IsString()
    marksObtained?: number;

    @IsOptional()
    @IsString()
    remarks?: string;
}

export class MarkFilterDto {
    @IsOptional()
    @IsString()
    studentId?: string;

    @IsOptional()
    @IsString()
    examId?: string;

    @IsOptional()
    @IsString()
    courseId?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    page?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number;
}
