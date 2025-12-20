import { IsString, IsEmail, IsEnum, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export enum StudentStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
    GRADUATED = 'GRADUATED',
    WITHDRAWN = 'WITHDRAWN',
}

export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    OTHER = 'OTHER',
}

export class CreateStudentDto {
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    firstName: string;

    @IsString()
    @MinLength(3)
    @MaxLength(100)
    lastName: string;

    @IsEmail()
    email: string;

    @Matches(/^[0-9]{10}$/, { message: 'Phone number must be 10 digits' })
    @IsOptional()
    phoneNumber?: string;

    @IsEnum(Gender)
    gender: Gender;

    @IsString()
    @Type(() => Date)
    dateOfBirth: Date;

    @IsString()
    @MinLength(5)
    @MaxLength(50)
    registrationNumber: string;

    @IsString()
    programId: string;

    @IsString()
    academicYearId: string;

    @IsEnum(StudentStatus)
    @IsOptional()
    status?: StudentStatus;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    city?: string;

    @IsString()
    @IsOptional()
    state?: string;

    @IsString()
    @IsOptional()
    postalCode?: string;

    @IsString()
    @IsOptional()
    fatherName?: string;

    @IsString()
    @IsOptional()
    motherName?: string;

    @IsString()
    @IsOptional()
    guardianPhoneNumber?: string;
}

export class UpdateStudentDto {
    @IsString()
    @IsOptional()
    firstName?: string;

    @IsString()
    @IsOptional()
    lastName?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @Matches(/^[0-9]{10}$/, { message: 'Phone number must be 10 digits' })
    @IsOptional()
    phoneNumber?: string;

    @IsEnum(Gender)
    @IsOptional()
    gender?: Gender;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    city?: string;

    @IsString()
    @IsOptional()
    state?: string;

    @IsString()
    @IsOptional()
    postalCode?: string;

    @IsEnum(StudentStatus)
    @IsOptional()
    status?: StudentStatus;

    @IsString()
    @IsOptional()
    fatherName?: string;

    @IsString()
    @IsOptional()
    motherName?: string;

    @IsString()
    @IsOptional()
    guardianPhoneNumber?: string;
}

export class UpdateStudentEnrollmentDto {
    @IsString()
    programId: string;

    @IsString()
    academicYearId: string;

    @IsOptional()
    semester?: number;
}

export class StudentFilterDto {
    @IsString()
    @IsOptional()
    programId?: string;

    @IsString()
    @IsOptional()
    academicYearId?: string;

    @IsEnum(StudentStatus)
    @IsOptional()
    status?: StudentStatus;

    @IsString()
    @IsOptional()
    city?: string;

    @IsString()
    @IsOptional()
    search?: string;

    @IsOptional()
    page?: number;

    @IsOptional()
    limit?: number;
}
