import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateBookDto {
    @IsString()
    title: string;

    @IsString()
    author: string;

    @IsString()
    isbn: string;

    @IsString()
    category: string;

    @IsNumber()
    totalCopies: number;

    @IsOptional()
    @IsString()
    publisher?: string;

    @IsOptional()
    @IsString()
    edition?: string;

    @IsString()
    universityId: string;
}

export class IssueBookDto {
    @IsString()
    bookId: string;

    @IsString()
    userId: string;

    @IsDateString()
    dueDate: string;

    @IsString()
    issuedBy: string;
}

export class PayFineDto {
    @IsNumber()
    amount: number;
}
