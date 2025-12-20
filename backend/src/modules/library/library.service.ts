import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book, BookDocument } from './library.schema';
import { BookIssue, BookIssueDocument } from './library.schema';
import { CreateBookDto, IssueBookDto, PayFineDto } from './library.dto';

@Injectable()
export class LibraryService {
    constructor(
        @InjectModel(Book.name) private bookModel: Model<BookDocument>,
        @InjectModel(BookIssue.name) private bookIssueModel: Model<BookIssueDocument>,
    ) {}

    // ============= BOOK MANAGEMENT =============

    async createBook(createBookDto: CreateBookDto): Promise<Book> {
        // Check if book with same ISBN already exists
        const existingBook = await this.bookModel.findOne({
            isbn: createBookDto.isbn,
        });
        if (existingBook) {
            throw new BadRequestException('Book with this ISBN already exists');
        }

        const newBook = new this.bookModel({
            ...createBookDto,
            availableCopies: createBookDto.totalCopies,
        });

        return newBook.save();
    }

    async findAllBooks(filters: any): Promise<any> {
        const { page = 1, limit = 10, category, search } = filters;
        const query: any = { isActive: true };

        if (category) {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { author: { $regex: search, $options: 'i' } },
                { isbn: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (page - 1) * limit;
        const books = await this.bookModel
            .find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .exec();

        const total = await this.bookModel.countDocuments(query);

        return {
            data: books,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findBookById(id: string): Promise<Book> {
        const book = await this.bookModel.findById(id).exec();
        if (!book) {
            throw new NotFoundException('Book not found');
        }
        return book;
    }

    async updateBook(id: string, updateBookDto: any): Promise<Book> {
        const book = await this.bookModel
            .findByIdAndUpdate(id, updateBookDto, { new: true })
            .exec();

        if (!book) {
            throw new NotFoundException('Book not found');
        }
        return book;
    }

    async deleteBook(id: string): Promise<void> {
        const book = await this.bookModel
            .findByIdAndUpdate(id, { isActive: false }, { new: true })
            .exec();

        if (!book) {
            throw new NotFoundException('Book not found');
        }
    }

    // ============= BOOK ISSUE/RETURN =============

    async issueBook(issueDto: IssueBookDto): Promise<BookIssue> {
        // Check if book exists and has copies available
        const book = await this.bookModel.findById(issueDto.bookId);
        if (!book) {
            throw new NotFoundException('Book not found');
        }

        if (book.availableCopies <= 0) {
            throw new BadRequestException('No copies available for this book');
        }

        // Check if user already has this book issued (not returned)
        const existingIssue = await this.bookIssueModel.findOne({
            bookId: issueDto.bookId,
            userId: issueDto.userId,
            status: 'Issued',
        });

        if (existingIssue) {
            throw new BadRequestException('User already has this book issued');
        }

        // Create issue record
        const newIssue = new this.bookIssueModel({
            ...issueDto,
            issueDate: new Date(),
            status: 'Issued',
        });

        await newIssue.save();

        // Decrease available copies
        await this.bookModel.findByIdAndUpdate(
            issueDto.bookId,
            { $inc: { availableCopies: -1 } },
        );

        return newIssue;
    }

    async returnBook(issueId: string): Promise<BookIssue> {
        const issue = await this.bookIssueModel.findById(issueId);
        if (!issue) {
            throw new NotFoundException('Issue record not found');
        }

        if (issue.status !== 'Issued') {
            throw new BadRequestException('Book is not currently issued');
        }

        const returnDate = new Date();
        const dueDate = new Date(issue.dueDate);

        // Calculate fine if overdue (10 rupees per day)
        let fine = 0;
        if (returnDate > dueDate) {
            const daysOverdue = Math.ceil(
                (returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
            );
            fine = daysOverdue * 10;
        }

        // Update issue
        const updatedIssue = await this.bookIssueModel.findByIdAndUpdate(
            issueId,
            {
                returnDate,
                status: 'Returned',
                fineAmount: fine,
            },
            { new: true },
        );

        // Increase available copies
        await this.bookModel.findByIdAndUpdate(
            issue.bookId,
            { $inc: { availableCopies: 1 } },
        );

        return updatedIssue;
    }

    async getUserIssuedBooks(userId: string): Promise<BookIssue[]> {
        return this.bookIssueModel
            .find({ userId, status: 'Issued' })
            .populate('bookId')
            .sort({ issueDate: -1 })
            .exec();
    }

    async getAllIssues(filters: any): Promise<any> {
        const { page = 1, limit = 10, status } = filters;
        const query: any = {};

        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;
        const issues = await this.bookIssueModel
            .find(query)
            .populate('bookId userId issuedBy')
            .skip(skip)
            .limit(limit)
            .sort({ issueDate: -1 })
            .exec();

        const total = await this.bookIssueModel.countDocuments(query);

        return {
            data: issues,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getOverdueBooks(): Promise<BookIssue[]> {
        const today = new Date();
        return this.bookIssueModel
            .find({
                status: 'Issued',
                dueDate: { $lt: today },
            })
            .populate('bookId userId')
            .sort({ dueDate: 1 })
            .exec();
    }

    // ============= FINE MANAGEMENT =============

    async calculateUserFine(userId: string): Promise<any> {
        const overdueIssues = await this.bookIssueModel.find({
            userId,
            status: 'Issued',
            dueDate: { $lt: new Date() },
        });

        let totalFine = 0;
        const today = new Date();

        for (const issue of overdueIssues) {
            const daysOverdue = Math.ceil(
                (today.getTime() - new Date(issue.dueDate).getTime()) /
                    (1000 * 60 * 60 * 24),
            );
            totalFine += daysOverdue * 10;
        }

        return {
            userId,
            totalFine,
            overdueBooks: overdueIssues.length,
            details: overdueIssues.map((issue) => ({
                issueId: issue._id,
                bookId: issue.bookId,
                dueDate: issue.dueDate,
                daysOverdue: Math.ceil(
                    (today.getTime() - new Date(issue.dueDate).getTime()) /
                        (1000 * 60 * 60 * 24),
                ),
                fineAmount:
                    Math.ceil(
                        (today.getTime() - new Date(issue.dueDate).getTime()) /
                            (1000 * 60 * 60 * 24),
                    ) * 10,
            })),
        };
    }

    async payFine(userId: string, paymentDto: PayFineDto): Promise<any> {
        const { amount } = paymentDto;

        // Get all overdue issues for user
        const overdueIssues = await this.bookIssueModel.find({
            userId,
            status: 'Issued',
            dueDate: { $lt: new Date() },
        });

        if (overdueIssues.length === 0) {
            throw new BadRequestException('No outstanding fines for this user');
        }

        // Deduct fine from issues (oldest first)
        let remainingAmount = amount;
        const paidIssues = [];

        for (const issue of overdueIssues) {
            const today = new Date();
            const daysOverdue = Math.ceil(
                (today.getTime() - new Date(issue.dueDate).getTime()) /
                    (1000 * 60 * 60 * 24),
            );
            const issueFine = daysOverdue * 10;

            if (remainingAmount >= issueFine) {
                await this.bookIssueModel.findByIdAndUpdate(
                    issue._id,
                    { fineAmount: 0 },
                );
                paidIssues.push(issue._id);
                remainingAmount -= issueFine;
            } else {
                break;
            }
        }

        return {
            message: 'Fine payment recorded successfully',
            amountPaid: amount - remainingAmount,
            remainingBalance: remainingAmount,
            paidIssueCount: paidIssues.length,
        };
    }

    // ============= REPORTS =============

    async generateAvailabilityReport(): Promise<any> {
        const books = await this.bookModel.find({ isActive: true });

        const byCategory = await this.bookModel.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    totalCopies: { $sum: '$totalCopies' },
                    availableCopies: { $sum: '$availableCopies' },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        return {
            summary: {
                totalBooks: books.length,
                totalCopies: books.reduce((sum, b) => sum + b.totalCopies, 0),
                availableCopies: books.reduce((sum, b) => sum + b.availableCopies, 0),
                issuedCopies: books.reduce(
                    (sum, b) => sum + (b.totalCopies - b.availableCopies),
                    0,
                ),
            },
            byCategory,
            generatedAt: new Date(),
        };
    }

    async generateUsageReport(startDate: string, endDate: string): Promise<any> {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new BadRequestException('Invalid date format');
        }

        const issues = await this.bookIssueModel.aggregate([
            {
                $match: {
                    issueDate: { $gte: start, $lte: end },
                },
            },
            {
                $group: {
                    _id: '$bookId',
                    issueCount: { $sum: 1 },
                },
            },
            { $sort: { issueCount: -1 } },
            { $limit: 10 },
        ]);

        return {
            period: { startDate, endDate },
            totalIssues: issues.reduce((sum, i) => sum + i.issueCount, 0),
            topBooks: issues,
            generatedAt: new Date(),
        };
    }
}
