import { IsString, IsNumber, IsEnum, IsOptional, IsMongoId } from 'class-validator';

export class CreateHostelDto {
    @IsString()
    name: string;

    @IsEnum(['Boys', 'Girls', 'Mixed'])
    type: 'Boys' | 'Girls' | 'Mixed';

    @IsString()
    universityId: string;

    @IsOptional()
    @IsString()
    wardenId?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsNumber()
    totalRooms: number;
}

export class CreateRoomDto {
    @IsMongoId()
    hostelId: string;

    @IsString()
    roomNumber: string;

    @IsNumber()
    capacity: number;

    @IsOptional()
    @IsEnum(['AC', 'Non-AC'])
    roomType?: string;

    @IsOptional()
    @IsNumber()
    floor?: number;
}

export class AllocateRoomDto {
    @IsMongoId()
    roomId: string;

    @IsMongoId()
    studentId: string;
}
