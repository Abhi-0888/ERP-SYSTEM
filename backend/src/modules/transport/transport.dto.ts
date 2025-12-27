import { IsString, IsNumber, IsOptional, IsEnum, IsMongoId, IsArray } from 'class-validator';

export class CreateVehicleDto {
    @IsString()
    registrationNumber: string;

    @IsString()
    type: string;

    @IsNumber()
    capacity: number;

    @IsOptional()
    @IsMongoId()
    driverId?: string;

    @IsOptional()
    @IsEnum(['active', 'maintenance', 'inactive'])
    status?: string;

    @IsOptional()
    @IsString()
    health?: string;
}

export class CreateRouteDto {
    @IsString()
    name: string;

    @IsString()
    startPoint: string;

    @IsString()
    endPoint: string;

    @IsArray()
    @IsString({ each: true })
    stops: string[];

    @IsOptional()
    @IsMongoId()
    vehicleId?: string;
}

export class UpdateVehicleDto extends CreateVehicleDto { }
export class UpdateRouteDto extends CreateRouteDto { }
