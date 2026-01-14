import { IsString, IsEmail, IsNotEmpty, IsEnum, IsOptional, IsArray } from 'class-validator';

export class CreateUniversityDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    code: string;

    @IsNotEmpty()
    @IsString()
    address: string;

    @IsNotEmpty()
    @IsEmail()
    adminEmail: string;

    @IsNotEmpty()
    @IsString()
    adminPassword: string;

    @IsOptional()
    @IsString()
    adminUsername?: string;

    @IsEnum(['basic', 'pro', 'enterprise'])
    subscriptionPlan: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    enabledModules?: string[];
}
