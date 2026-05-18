import { IsString, IsNumber, IsEnum, IsOptional, MinLength, MaxLength, Min, Max, IsNotEmpty, IsArray, Matches } from 'class-validator';
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
    @Matches(/^[a-zA-Z0-9\s\-]+$/, { message: 'Name can only contain letters, numbers, spaces, and hyphens' })
    name: string;

    @IsEnum(FeeType)
    type: FeeType;

    @IsNumber()
    @Min(1)
    @Max(1000000)
    amount: number;

    @IsString()
    @IsNotEmpty()
    academicYearId: string;

    @IsString()
    @IsOptional()
    @Matches(/^[0-9a-fA-F]{24}$/, { message: 'Invalid program ID format' })
    programId?: string;

    @IsNotEmpty()
    @Type(() => Date)
    dueDate: Date;

    @IsNumber()
    @IsOptional()
    @Min(0)
    @Max(1000)
    lateFeePerDay?: number;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    @Matches(/^[a-zA-Z0-9\s\-.,]+$/, { message: 'Description contains invalid characters' })
    description?: string;

    @IsEnum(FeeStatus)
    @IsOptional()
    status?: FeeStatus;

    @IsString()
    @IsOptional()
    @Matches(/^[0-9a-fA-F]{24}$/, { message: 'Invalid university ID format' })
    universityId?: string;
}

export class UpdateFeeDto {
    @IsString()
    @IsOptional()
    @MinLength(3)
    @MaxLength(100)
    @Matches(/^[a-zA-Z0-9\s\-]+$/, { message: 'Name can only contain letters, numbers, spaces, and hyphens' })
    name?: string;

    @IsEnum(FeeType)
    @IsOptional()
    type?: FeeType;

    @IsNumber()
    @IsOptional()
    @Min(1)
    @Max(1000000)
    amount?: number;

    @IsString()
    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Due date must be in YYYY-MM-DD format' })
    dueDate?: string;

    @IsNumber()
    @IsOptional()
    @Min(0)
    @Max(1000)
    lateFeePerDay?: number;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    @Matches(/^[a-zA-Z0-9\s\-.,]+$/, { message: 'Description contains invalid characters' })
    description?: string;

    @IsString()
    @IsOptional()
    @Matches(/^[0-9a-fA-F]{24}$/, { message: 'Invalid university ID format' })
    universityId?: string;
}

export class AssignFeeToStudentDto {
    @IsString()
    @Matches(/^[0-9a-fA-F]{24}$/, { message: 'Invalid student ID format' })
    studentId: string;

    @IsString()
    @Matches(/^[0-9a-fA-F]{24}$/, { message: 'Invalid fee ID format' })
    feeId: string;

    @IsNumber()
    @IsOptional()
    @Min(1)
    @Max(1000000)
    customAmount?: number;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    @Matches(/^[a-zA-Z0-9\s\-.,]+$/, { message: 'Remarks contains invalid characters' })
    remarks?: string;

    @IsString()
    @IsOptional()
    @Matches(/^[0-9a-fA-F]{24}$/, { message: 'Invalid university ID format' })
    universityId?: string;
}

export class RecordPaymentDto {
    @IsString()
    @IsOptional()
    @Matches(/^[0-9a-fA-F]{24}$/, { message: 'Invalid student ID format' })
    studentId?: string;

    @IsString()
    @Matches(/^[0-9a-fA-F]{24}$/, { message: 'Invalid fee ID format' })
    feeId: string;

    @IsNumber()
    @Min(1)
    @Max(1000000)
    amountPaid: number;

    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    @Matches(/^[A-Z0-9\-]+$/, { message: 'Transaction ID can only contain uppercase letters, numbers, and hyphens' })
    transactionId?: string;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    @Matches(/^[a-zA-Z0-9\s\-.,]+$/, { message: 'Remarks contains invalid characters' })
    remarks?: string;

    @IsString()
    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Payment date must be in YYYY-MM-DD format' })
    @Type(() => Date)
    paymentDate?: Date;
}

export class BulkAssignFeeDto {
    @IsArray()
    @IsString({ each: true })
    studentIds: string[];

    @IsString()
    feeId: string;

    @IsString()
    @IsOptional()
    remarks?: string;

    @IsString()
    @IsOptional()
    @Matches(/^[0-9a-fA-F]{24}$/)
    universityId?: string;
}

export class FeeFilterDto {
    @IsString()
    @IsOptional()
    studentId?: string;

    @IsString()
    @IsOptional()
    academicYearId?: string;

    @IsString()
    @IsOptional()
    departmentId?: string;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    semester?: number;

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
    @Type(() => Number)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    limit?: number;

    @IsString()
    @IsOptional()
    universityId?: string;
}

export class InitiateOnlinePaymentDto {
    @IsString()
    @IsNotEmpty()
    feeId: string;

    @IsNumber()
    @Min(1)
    amount: number;

    @IsString()
    @IsOptional()
    universityId?: string;
}

export class VerifyPaymentDto {
    @IsString()
    @IsNotEmpty()
    razorpayOrderId: string;

    @IsString()
    @IsNotEmpty()
    razorpayPaymentId: string;

    @IsString()
    @IsNotEmpty()
    razorpaySignature: string;

    @IsString()
    @IsNotEmpty()
    feeId: string;

    @IsString()
    @IsOptional()
    universityId?: string;
}

export class FeeReportDto {
    @IsString()
    @IsOptional()
    academicYearId?: string;

    @IsString()
    @IsOptional()
    programId?: string;

    @IsString()
    @IsOptional()
    departmentId?: string;

    @IsEnum(FeeStatus)
    @IsOptional()
    status?: FeeStatus;

    @IsOptional()
    @Type(() => Date)
    startDate?: Date;

    @IsOptional()
    @Type(() => Date)
    endDate?: Date;
}
export class AddFineDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^[0-9a-fA-F]{24}$/)
    studentId: string;

    @IsNumber()
    @Min(1)
    amount: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    reason: string;

    @IsOptional()
    @IsString()
    @Matches(/^[0-9a-fA-F]{24}$/)
    feeId?: string;

    @IsOptional()
    @IsString()
    @Matches(/^[0-9a-fA-F]{24}$/)
    universityId?: string;
}

export class BulkAddFineDto {
    @IsArray()
    @IsString({ each: true })
    studentIds: string[];

    @IsNumber()
    @Min(1)
    amount: number;

    @IsString()
    @IsNotEmpty()
    reason: string;

    @IsOptional()
    @IsString()
    @Matches(/^[0-9a-fA-F]{24}$/)
    universityId?: string;
}
