import { IsString, IsEmail, IsEnum, MinLength, IsOptional, Matches } from 'class-validator';
import { Role } from '../../common/enums/role.enum';

export class CreateUserDto {
    @IsString()
    @MinLength(3, { message: 'Username must be at least 3 characters long' })
    username: string;

    @IsEmail({}, { message: 'Email must be a valid email address' })
    email: string;

    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(/[0-9]/, { message: 'Password must contain at least one number' })
    @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    password: string;

    @IsEnum(Role, { message: `Role must be one of: ${Object.values(Role).join(', ')}` })
    role: Role;

    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @IsOptional()
    @IsString()
    universityId?: string;
}

export class UpdateUserDto {
    @IsOptional()
    @IsEmail({}, { message: 'Email must be a valid email address' })
    email?: string;

    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @IsOptional()
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password?: string;

    @IsOptional()
    @IsString()
    isActive?: boolean;
}

export class LoginDto {
    @IsString()
    username: string;

    @IsString()
    password: string;
}
