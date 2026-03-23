import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FeeStructure, FeeStructureDocument, Transaction, TransactionDocument } from './fee.schema';
import { CreateFeeDto, UpdateFeeDto, RecordPaymentDto, AssignFeeToStudentDto, FeeFilterDto } from './fee.dto';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class FeeService {
    constructor(
        @InjectModel(FeeStructure.name) private feeStructureModel: Model<FeeStructureDocument>,
        @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    ) { }

    async createFeeStructure(dto: CreateFeeDto, currentUser: any): Promise<FeeStructure> {
        try {
            const universityId = currentUser.role === Role.SUPER_ADMIN ? (dto as any).universityId : currentUser.universityId;
            if (!universityId) throw new BadRequestException('University ID is required');

            const fee = new this.feeStructureModel({
                ...dto,
                universityId,
                dueDate: new Date(dto.dueDate),
                status: dto.status || 'PENDING',
            });
            return await fee.save();
        } catch (error) {
            throw error;
        }
    }

    async findAllFees(currentUser: any, filter: FeeFilterDto, page: number = 1, limit: number = 10): Promise<any> {
        try {
            const skip = (page - 1) * limit;
            const query: any = {};

            if (currentUser.role !== Role.SUPER_ADMIN) {
                query.universityId = currentUser.universityId;
            }

            if (filter.academicYearId) query.academicYearId = filter.academicYearId;
            if (filter.type) query.type = filter.type;
            if (filter.status) query.status = filter.status;
            if (filter.search) {
                query.name = { $regex: filter.search, $options: 'i' };
            }

            const fees = await this.feeStructureModel
                .find(query)
                .skip(skip)
                .limit(limit)
                .exec();

            const total = await this.feeStructureModel.countDocuments(query);

            return {
                data: fees,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            };
        } catch (error) {
            throw error;
        }
    }

    async findFeeById(id: string, currentUser: any): Promise<FeeStructure> {
        try {
            const fee = await this.feeStructureModel.findById(id);
            if (!fee) {
                throw new NotFoundException('Fee not found');
            }

            // Isolation
            if (currentUser.role !== Role.SUPER_ADMIN && fee.universityId?.toString() !== currentUser.universityId.toString()) {
                throw new ForbiddenException('Access denied');
            }

            return fee;
        } catch (error) {
            throw error;
        }
    }

    async updateFee(id: string, dto: UpdateFeeDto, currentUser: any): Promise<FeeStructure> {
        try {
            await this.findFeeById(id, currentUser);
            
            const updateData = { ...dto };
            if (dto.dueDate) updateData.dueDate = new Date(dto.dueDate) as any;

            return this.feeStructureModel.findByIdAndUpdate(id, updateData, { new: true });
        } catch (error) {
            throw error;
        }
    }

    async deleteFee(id: string, currentUser: any): Promise<any> {
        try {
            await this.findFeeById(id, currentUser);
            const fee = await this.feeStructureModel.findByIdAndDelete(id);
            if (!fee) {
                throw new NotFoundException('Fee not found');
            }
            return { message: 'Fee deleted successfully' };
        } catch (error) {
            throw error;
        }
    }

    async assignFeeToStudent(dto: AssignFeeToStudentDto, currentUser: any): Promise<any> {
        try {
            await this.findFeeById(dto.feeId, currentUser);
            
            // Logic to assign fee to student...
            // Usually this means creating a Transaction or updating StudentProfile
            return { message: 'Fee assigned successfully' };
        } catch (error) {
            throw error;
        }
    }

    async recordPayment(dto: RecordPaymentDto, currentUser: any): Promise<Transaction> {
        try {
            // Isolation check for student/fee could be added here
            const transaction = new this.transactionModel({
                ...dto,
                universityId: currentUser.universityId,
                paymentDate: new Date(),
                status: 'COMPLETED',
            });
            return await transaction.save();
        } catch (error) {
            throw error;
        }
    }

    async getStudentFees(studentId: string, currentUser: any): Promise<any> {
        try {
            // Find transactions and pending fees for student
            const query: any = { studentId };
            if (currentUser.role !== Role.SUPER_ADMIN) {
                query.universityId = currentUser.universityId;
            }

            const transactions = await this.transactionModel.find(query).populate('feeId').exec();
            return transactions;
        } catch (error) {
            throw error;
        }
    }

    async generateFeeReport(academicYearId?: string): Promise<any> {
        try {
            const query: any = {};
            if (academicYearId) query.academicYearId = academicYearId;

            const stats = await this.transactionModel.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$amount' },
                        totalPaid: { $sum: '$amountPaid' },
                    },
                },
            ]);

            return { stats, timestamp: new Date() };
        } catch (error) {
            throw error;
        }
    }
}
