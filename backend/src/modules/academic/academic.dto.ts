import { IsString, IsNumber, IsEnum, IsOptional, MinLength, MaxLength, Min, Max } from 'class-validator';

export enum ProgramType {
    BACHELOR = 'BACHELOR',
    MASTER = 'MASTER',
    DIPLOMA = 'DIPLOMA',
    PHD = 'PHD',
}

export enum Semester {
    ONE = 1,
    TWO = 2,
    THREE = 3,
    FOUR = 4,
    FIVE = 5,
    SIX = 6,
    SEVEN = 7,
    EIGHT = 8,
}

export class CreateAcademicYearDto {
    @IsString()
    @MinLength(4)
    @MaxLength(9)
    year: string;

    @IsString()
    @MinLength(10)
    startDate: string;

    @IsString()
    @MinLength(10)
    endDate: string;

    @IsString()
    @IsOptional()
    description?: string;
}

export class UpdateAcademicYearDto {
    @IsString()
    @IsOptional()
    year?: string;

    @IsString()
    @IsOptional()
    startDate?: string;

    @IsString()
    @IsOptional()
    endDate?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsOptional()
    isActive?: boolean;
}

export class CreateDepartmentDto {
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    name: string;

    @IsString()
    @MinLength(2)
    @MaxLength(10)
    code: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    headOfDepartment?: string;
}

export class UpdateDepartmentDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    code?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    headOfDepartment?: string;
}

export class CreateProgramDto {
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    name: string;

    @IsString()
    @MinLength(2)
    @MaxLength(10)
    code: string;

    @IsEnum(ProgramType)
    type: ProgramType;

    @IsString()
    departmentId: string;

    @IsNumber()
    @Min(1)
    @Max(8)
    totalSemesters: number;

    @IsString()
    @IsOptional()
    description?: string;
}

export class UpdateProgramDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    code?: string;

    @IsEnum(ProgramType)
    @IsOptional()
    type?: ProgramType;

    @IsNumber()
    @IsOptional()
    totalSemesters?: number;

    @IsString()
    @IsOptional()
    description?: string;
}

export class CreateCourseDto {
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    name: string;

    @IsString()
    @MinLength(3)
    @MaxLength(10)
    code: string;

    @IsNumber()
    @Min(0)
    @Max(4)
    credits: number;

    @IsEnum(Semester)
    semester: Semester;

    @IsString()
    programId: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsOptional()
    @Min(0)
    minMarksForPass?: number;
}

export class UpdateCourseDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    code?: string;

    @IsNumber()
    @IsOptional()
    credits?: number;

    @IsEnum(Semester)
    @IsOptional()
    semester?: Semester;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsOptional()
    minMarksForPass?: number;
}
