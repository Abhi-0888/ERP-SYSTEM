import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StudentProfile, StudentProfileDocument } from '../student/student-profile.schema';
import { User, UserDocument } from '../user/user.schema';
import { Attendance, AttendanceDocument } from '../attendance/attendance.schema';
import { Transaction, TransactionDocument } from '../fee/fee.schema';
import { Hostel, HostelDocument, Room, RoomDocument } from '../hostel/hostel.schema';
import { Book, BookDocument, BookIssue, BookIssueDocument } from '../library/library.schema';

@Injectable()
export class StatsService {
    constructor(
        @InjectModel(StudentProfile.name) private studentModel: Model<StudentProfileDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>,
        @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
        @InjectModel(Hostel.name) private hostelModel: Model<HostelDocument>,
        @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
        @InjectModel(Book.name) private bookModel: Model<BookDocument>,
    ) { }

    async getGlobalStats(universityId: string) {
        const [students, faculty, attendance, fees] = await Promise.all([
            this.studentModel.countDocuments({ universityId }),
            this.userModel.countDocuments({ universityId, role: 'FACULTY', isActive: true }),
            this.attendanceModel.aggregate([
                { $match: { universityId } },
                { $group: { _id: null, avg: { $avg: { $cond: [{ $eq: ['$status', 'PRESENT'] }, 1, 0] } } } }
            ]),
            this.transactionModel.aggregate([
                { $match: { universityId } },
                { $group: { _id: null, total: { $sum: '$amount' }, paid: { $sum: '$amountPaid' } } }
            ])
        ]);

        return {
            students,
            faculty,
            attendance: attendance[0] ? (attendance[0].avg * 100).toFixed(1) + '%' : '0%',
            fees: fees[0] ? `₹${(fees[0].paid / 100000).toFixed(1)}L / ₹${(fees[0].total / 100000).toFixed(1)}L` : '₹0L'
        };
    }

    async getModuleStats(universityId: string) {
        const [hostels, library] = await Promise.all([
            this.getHostelStats(universityId),
            this.getLibraryStats(universityId)
        ]);

        return { hostels, library };
    }

    private async getHostelStats(universityId: string) {
        const rooms = await this.roomModel.find({ universityId, isActive: true });
        const totalCapacity = rooms.reduce((acc, r) => acc + r.capacity, 0);
        const totalOccupants = rooms.reduce((acc, r) => acc + r.occupants.length, 0);
        return {
            totalHostels: await this.hostelModel.countDocuments({ universityId, isActive: true }),
            occupancy: totalCapacity > 0 ? ((totalOccupants / totalCapacity) * 100).toFixed(1) + '%' : '0%'
        };
    }

    private async getLibraryStats(universityId: string) {
        const books = await this.bookModel.find({ universityId, isActive: true });
        const totalBooks = books.reduce((acc, b) => acc + b.totalCopies, 0);
        const availableBooks = books.reduce((acc, b) => acc + b.availableCopies, 0);
        return {
            totalTitles: books.length,
            availableBooks,
            issuedBooks: totalBooks - availableBooks
        };
    }
}
