import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StudentProfile, StudentProfileDocument } from '../student/student-profile.schema';
import { User, UserDocument } from '../user/user.schema';
import { Attendance, AttendanceDocument } from '../attendance/attendance.schema';
import { Transaction, TransactionDocument } from '../fee/fee.schema';
import { Hostel, HostelDocument, Room, RoomDocument } from '../hostel/hostel.schema';
import { Book, BookDocument } from '../library/library.schema';

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
        // StudentProfile doesn't have universityId directly; get student user IDs first
        const studentUserIds = await this.userModel.find(
            { universityId, role: 'STUDENT', isActive: true }
        ).select('_id');
        const studentUserIdList = studentUserIds.map(u => u._id);

        const [students, faculty, attendance, fees] = await Promise.all([
            this.studentModel.countDocuments({ userId: { $in: studentUserIdList } }),
            this.userModel.countDocuments({ universityId, role: 'FACULTY', isActive: true }),
            // Attendance doesn't have universityId; aggregate all records (scoped by student profiles)
            this.attendanceModel.aggregate([
                { $group: { _id: null, total: { $sum: 1 }, present: { $sum: { $cond: [{ $eq: ['$status', 'PRESENT'] }, 1, 0] } } } }
            ]),
            this.transactionModel.aggregate([
                { $match: { universityId: { $in: [universityId, new Types.ObjectId(universityId)] } } },
                { $group: { _id: null, total: { $sum: '$amount' }, paid: { $sum: '$amountPaid' } } }
            ])
        ]);

        const attendanceAvg = attendance[0] && attendance[0].total > 0
            ? ((attendance[0].present / attendance[0].total) * 100).toFixed(1) + '%'
            : 'N/A';

        return {
            students,
            faculty,
            attendance: attendanceAvg,
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
        const hostels = await this.hostelModel.find({ universityId, isActive: true }).select('_id');
        const hostelIds = hostels.map(h => h._id);
        const rooms = await this.roomModel.find({ hostelId: { $in: hostelIds }, isActive: true });
        const totalCapacity = rooms.reduce((acc, r) => acc + r.capacity, 0);
        const totalOccupants = rooms.reduce((acc, r) => acc + r.occupants.length, 0);
        return {
            totalHostels: hostels.length,
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
