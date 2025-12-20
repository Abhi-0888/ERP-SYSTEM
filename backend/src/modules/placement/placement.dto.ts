import { IsString, IsOptional, IsMongoId, IsEnum, IsDateString, IsObject } from 'class-validator';

export class CreateJobPostDto {
    @IsString()
    company: string;

    @IsString()
    role: string;

    @IsString()
    description: string;

    @IsMongoId()
    universityId: string;

    @IsOptional()
    @IsObject()
    eligibilityCriteria?: {
        minCGPA?: number;
        allowedPrograms?: string[];
        allowedDepartments?: string[];
        passingYear?: number;
    };

    @IsString()
    package: string;

    @IsDateString()
    deadline: string;

    @IsOptional()
    @IsDateString()
    driveDate?: string;

    @IsOptional()
    @IsMongoId()
    postedBy?: string;
}

export class ApplyJobDto {
    @IsMongoId()
    jobId: string;

    @IsMongoId()
    studentId: string;

    @IsOptional()
    @IsString()
    resumeUrl?: string;
}

export class UpdateApplicationStatusDto {
    @IsEnum(['Applied', 'Shortlisted', 'Rejected', 'Selected', 'Placed'])
    status: string;

    @IsOptional()
    @IsString()
    remarks?: string;
}
