import { IsString, IsNumber, IsEnum, IsOptional, MinLength, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum FeeType {
    TUITION = 'TUITION',
    HOSTEL = 'HOSTEL',
    LIBRARY = 'LIBRARY',
    ACTIVITY = 'ACTIVITY',
    TRANSPORT = 'TRANSPORT',
    EXAMINATION = 'EXAMINATION',
    OTHER = 'OTHER',
}

export enum FeeStatus {
    PENDING = 'PENDING',
    PARTIALLY_PAID = 'PARTIALLY_PAID',
    FULLY_PAID = 'FULLY_PAID',
    OVERDUE = 'OVERDUE',
    WAIVED = 'WAIVED',
}

export enum PaymentMethod {
    CASH = 'CASH',
    CHEQUE = 'CHEQUE',
    BANK_TRANSFER = 'BANK_TRANSFER',
    CARD = 'CARD',
    ONLINE = 'ONLINE',
}

export class CreateFeeDto {
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    name: string;

    @IsEnum(FeeType)
    type: FeeType;

    @IsNumber()
    @Min(0)
    amount: number;

    @IsString()
    academicYearId: string;

    @IsString()
    @IsOptional()
    programId?: string;

    @IsString()
    @Type(() => Date)
    dueDate: Date;

    @IsNumber()
    @IsOptional()
    @Min(0)
    lateFeePerDay?: number;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(FeeStatus)
    @IsOptional()
    status?: FeeStatus;
}

export class UpdateFeeDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsEnum(FeeType)
    @IsOptional()
    type?: FeeType;

    @IsNumber()
    @IsOptional()
    amount?: number;

    @IsString()
    @IsOptional()
    dueDate?: string;

    @IsNumber()
    @IsOptional()
    lateFeePerDay?: number;

    @IsString()
    @IsOptional()
    description?: string;
}

export class AssignFeeToStudentDto {
    @IsString()
    studentId: string;

    @IsString()
    feeId: string;

    @IsNumber()
    @IsOptional()
    customAmount?: number;

    @IsString()
    @IsOptional()
    remarks?: string;
}

export class RecordPaymentDto {
    @IsString()
    feeId: string;

    @IsNumber()
    @Min(0)
    amountPaid: number;

    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;

    @IsString()
    @IsOptional()
    transactionId?: string;

    @IsString()
    @IsOptional()
    remarks?: string;

    @IsString()
    @IsOptional()
    @Type(() => Date)
    paymentDate?: Date;
}

export class BulkAssignFeeDto {
    @IsString()
    studentIds: string[];

    @IsString()
    feeId: string;

    @IsString()
    @IsOptional()
    remarks?: string;
}

export class FeeFilterDto {
    @IsString()
    @IsOptional()
    studentId?: string;

    @IsString()
    @IsOptional()
    academicYearId?: string;

    @IsEnum(FeeType)
    @IsOptional()
    type?: FeeType;

    @IsEnum(FeeStatus)
    @IsOptional()
    status?: FeeStatus;

    @IsString()
    @IsOptional()
    search?: string;

    @IsOptional()
    page?: number;

    @IsOptional()
    limit?: number;
}

export class FeeReportDto {
    @IsString()
    @IsOptional()
    academicYearId?: string;

    @IsString()
    @IsOptional()
    programId?: string;

    @IsEnum(FeeStatus)
    @IsOptional()
    status?: FeeStatus;

    @IsOptional()
    startDate?: Date;

    @IsOptional()
    endDate?: Date;
}
