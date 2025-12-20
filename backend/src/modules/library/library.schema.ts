import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

// Book Schema
export type BookDocument = Book & Document;

@Schema({ timestamps: true })
export class Book {
    @Prop({ required: true })
    title: string;

    @Prop()
    author: string;

    @Prop({ unique: true, sparse: true })
    isbn: string;

    @Prop()
    publisher: string;

    @Prop()
    edition: string;

    @Prop({ required: true })
    category: string;

    @Prop({ required: true, default: 1 })
    totalCopies: number;

    @Prop({ required: true, default: 1 })
    availableCopies: number;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'University', required: true })
    universityId: MongooseSchema.Types.ObjectId;

    @Prop({ default: true })
    isActive: boolean;
}

export const BookSchema = SchemaFactory.createForClass(Book);

// Book Issue Schema
export type BookIssueDocument = BookIssue & Document;

@Schema({ timestamps: true })
export class BookIssue {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Book', required: true })
    bookId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    userId: MongooseSchema.Types.ObjectId; // Student or Faculty

    @Prop({ required: true })
    issueDate: Date;

    @Prop({ required: true })
    dueDate: Date;

    @Prop()
    returnDate: Date;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    issuedBy: MongooseSchema.Types.ObjectId; // Librarian

    @Prop({ default: 0 })
    fineAmount: number;

    @Prop({ type: String, enum: ['Issued', 'Returned', 'Overdue'], default: 'Issued' })
    status: string;

    @Prop()
    remarks: string;
}

export const BookIssueSchema = SchemaFactory.createForClass(BookIssue);
