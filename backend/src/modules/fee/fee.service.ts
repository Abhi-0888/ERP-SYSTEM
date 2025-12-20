import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FeeStructure, FeeStructureDocument, Transaction, TransactionDocument } from './fee.schema';
import { CreateFeeDto, UpdateFeeDto, RecordPaymentDto, AssignFeeToStudentDto, FeeFilterDto } from './fee.dto';

@Injectable()
export class FeeService {
    constructor(
        @InjectModel(FeeStructure.name) private feeStructureModel: Model<FeeStructureDocument>,
        @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    ) { }

    async createFeeStructure(dto: CreateFeeDto): Promise<FeeStructure> {
        try {
            const fee = new this.feeStructureModel({
                ...dto,
                dueDate: new Date(dto.dueDate),
                status: dto.status || 'PENDING',
            });
            return await fee.save();
        } catch (error) {
            throw error;
        }
    }

    async findAllFees(filter: FeeFilterDto, page: number = 1, limit: number = 10): Promise<any> {
        try {
            const skip = (page - 1) * limit;
            const query: any = {};

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

    async findFeeById(id: string): Promise<FeeStructure> {
        try {
            const fee = await this.feeStructureModel.findById(id);
            if (!fee) {
                throw new NotFoundException('Fee not found');
            }
            return fee;
        } catch (error) {
            throw error;
        }
    }

    async updateFee(id: string, dto: UpdateFeeDto): Promise<FeeStructure> {
        try {
            const updateData = { ...dto };
            if (dto.dueDate) updateData.dueDate = new Date(dto.dueDate) as any;

            const fee = await this.feeStructureModel.findByIdAndUpdate(id, updateData, { new: true });
            if (!fee) {
                throw new NotFoundException('Fee not found');
            }
            return fee;
        } catch (error) {
            throw error;
        }
    }

    async deleteFee(id: string): Promise<any> {
        try {
            const fee = await this.feeStructureModel.findByIdAndDelete(id);
            if (!fee) {
                throw new NotFoundException('Fee not found');
            }
            return { message: 'Fee deleted successfully' };
        } catch (error) {
            throw error;
        }
    }

    async assignFeeToStudent(dto: AssignFeeToStudentDto): Promise<any> {
        try {
            const fee = await this.feeStructureModel.findById(dto.feeId);
            if (!fee) {
                throw new NotFoundException('Fee not found');
            }

            const amount = dto.customAmount || fee.amount;

            const transaction = new this.transactionModel({
                studentId: dto.studentId,
                feeId: dto.feeId,
                amount,
                amountPaid: 0,
                status: 'PENDING',
                dueDate: fee.dueDate,
                remarks: dto.remarks,
            });

            return await transaction.save();
        } catch (error) {
            throw error;
        }
    }

    async recordPayment(studentId: string, dto: RecordPaymentDto): Promise<Transaction> {
        try {
            const transaction = await this.transactionModel.findOne({
                studentId,
                feeId: dto.feeId,
            });

            if (!transaction) {
                throw new NotFoundException('Student fee record not found');
            }

            const newPaidAmount = transaction.amountPaid + dto.amountPaid;

            if (newPaidAmount > transaction.amount) {
                throw new BadRequestException('Payment exceeds fee amount');
            }

            const newStatus = newPaidAmount === transaction.amount ? 'FULLY_PAID' : 'PARTIALLY_PAID';

            const updatedTransaction = await this.transactionModel.findByIdAndUpdate(
                transaction._id,
                {
                    amountPaid: newPaidAmount,
                    status: newStatus,
                    lastPaymentDate: dto.paymentDate || new Date(),
                    paymentMethod: dto.paymentMethod,
                    transactionId: dto.transactionId,
                },
                { new: true },
            );

            return updatedTransaction;
        } catch (error) {
            throw error;
        }
    }

    async getStudentFeeStatus(studentId: string, page: number = 1, limit: number = 10): Promise<any> {
        try {
            const skip = (page - 1) * limit;
            const fees = await this.transactionModel
                .find({ studentId })
                .skip(skip)
                .limit(limit)
                .populate('feeId', 'name type amount')
                .exec();

            const total = await this.transactionModel.countDocuments({ studentId });
            const totalAmount = await this.transactionModel.aggregate([
                { $match: { studentId } },
                { $group: { _id: null, total: { $sum: '$amount' }, paid: { $sum: '$amountPaid' } } },
            ]);

            return {
                data: fees,
                summary: totalAmount[0] || { total: 0, paid: 0 },
                pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            };
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
