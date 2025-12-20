import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';
import { Book, BookSchema, BookIssue, BookIssueSchema } from './library.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Book.name, schema: BookSchema },
            { name: BookIssue.name, schema: BookIssueSchema },
        ]),
    ],
    controllers: [LibraryController],
    providers: [LibraryService],
    exports: [LibraryService],
})
export class LibraryModule { }


