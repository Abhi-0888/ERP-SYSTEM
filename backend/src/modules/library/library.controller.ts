import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { LibraryService } from './library.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CreateBookDto, IssueBookDto, PayFineDto } from './library.dto';

import { UniversityIsolationGuard } from '../../common/guards/university-isolation.guard';

@Controller('library')
@UseGuards(JwtAuthGuard, RolesGuard, UniversityIsolationGuard)
export class LibraryController {
    constructor(private readonly libraryService: LibraryService) { }

    // ============= BOOK MANAGEMENT =============

    @Post('books')
    @Roles(Role.LIBRARIAN, Role.UNIVERSITY_ADMIN)
    async createBook(@Body() createBookDto: CreateBookDto) {
        try {
            return await this.libraryService.createBook(createBookDto);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to create book',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get('books')
    @Roles(Role.STUDENT, Role.FACULTY, Role.HOD, Role.LIBRARIAN, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN)
    async findAllBooks(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('category') category?: string,
        @Query('search') search?: string,
    ) {
        try {
            return await this.libraryService.findAllBooks({
                page,
                limit,
                category,
                search,
            });
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch books',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('books/:id')
    @Roles(Role.STUDENT, Role.FACULTY, Role.HOD, Role.LIBRARIAN, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN)
    async getBook(@Param('id') id: string) {
        try {
            const book = await this.libraryService.findBookById(id);
            if (!book) {
                throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
            }
            return book;
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch book',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Patch('books/:id')
    @Roles(Role.LIBRARIAN, Role.UNIVERSITY_ADMIN)
    async updateBook(@Param('id') id: string, @Body() updateBookDto: any) {
        try {
            const book = await this.libraryService.updateBook(id, updateBookDto);
            if (!book) {
                throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
            }
            return book;
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to update book',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Delete('books/:id')
    @Roles(Role.LIBRARIAN, Role.UNIVERSITY_ADMIN)
    async deleteBook(@Param('id') id: string) {
        try {
            await this.libraryService.deleteBook(id);
            return { message: 'Book deleted successfully' };
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to delete book',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    // ============= BOOK ISSUE/RETURN =============

    @Post('issue')
    @Roles(Role.LIBRARIAN, Role.UNIVERSITY_ADMIN)
    async issueBook(@Body() issueDto: IssueBookDto) {
        try {
            return await this.libraryService.issueBook(issueDto);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to issue book',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Post('return/:issueId')
    @Roles(Role.LIBRARIAN, Role.UNIVERSITY_ADMIN)
    async returnBook(@Param('issueId') issueId: string) {
        try {
            return await this.libraryService.returnBook(issueId);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to return book',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get('issued-books/user/:userId')
    @Roles(Role.STUDENT, Role.FACULTY, Role.HOD, Role.LIBRARIAN, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN)
    async getUserIssuedBooks(@Param('userId') userId: string) {
        try {
            return await this.libraryService.getUserIssuedBooks(userId);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch issued books',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('issues')
    @Roles(Role.LIBRARIAN, Role.UNIVERSITY_ADMIN)
    async getAllIssues(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('status') status?: string,
    ) {
        try {
            return await this.libraryService.getAllIssues({ page, limit, status });
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch issues',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('overdue-books')
    @Roles(Role.LIBRARIAN, Role.UNIVERSITY_ADMIN)
    async getOverdueBooks() {
        try {
            return await this.libraryService.getOverdueBooks();
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch overdue books',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // ============= FINE MANAGEMENT =============

    @Get('fine/:userId')
    @Roles(Role.STUDENT, Role.FACULTY, Role.HOD, Role.LIBRARIAN, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN)
    async getUserFine(@Param('userId') userId: string) {
        try {
            return await this.libraryService.calculateUserFine(userId);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to calculate fine',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('fine/:userId/pay')
    @Roles(Role.LIBRARIAN, Role.ACCOUNTANT)
    async payFine(@Param('userId') userId: string, @Body() paymentDto: PayFineDto) {
        try {
            return await this.libraryService.payFine(userId, paymentDto);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to process fine payment',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    // ============= REPORTS =============

    @Get('reports/availability')
    @Roles(Role.LIBRARIAN, Role.UNIVERSITY_ADMIN)
    async getAvailabilityReport() {
        try {
            return await this.libraryService.generateAvailabilityReport();
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to generate availability report',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('reports/usage')
    @Roles(Role.LIBRARIAN, Role.UNIVERSITY_ADMIN)
    async getUsageReport(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ) {
        try {
            return await this.libraryService.generateUsageReport(startDate, endDate);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to generate usage report',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
