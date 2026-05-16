import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { FeeStructure, FeeStructureDocument, Transaction, TransactionDocument, FeeStatusEnum, PaymentMethodEnum, TransactionSchema } from './fee.schema';
import { CreateFeeDto, UpdateFeeDto, RecordPaymentDto, AssignFeeToStudentDto, FeeFilterDto, InitiateOnlinePaymentDto, VerifyPaymentDto } from './fee.dto';
import { Role } from '../../common/enums/role.enum';
import { StudentProfile, StudentProfileDocument } from '../student/student-profile.schema';

@Injectable()
export class FeeService {
    private razorpay: any;

    constructor(
        @InjectModel(FeeStructure.name) private feeStructureModel: Model<FeeStructureDocument>,
        @InjectModel(Transaction.name) public transactionModel: Model<TransactionDocument>,
        @InjectModel(StudentProfile.name) private studentProfileModel: Model<StudentProfileDocument>,
        private configService: ConfigService,
    ) {
        this.razorpay = new Razorpay({
            key_id: this.configService.get<string>('RAZORPAY_KEY_ID') || 'rzp_test_placeholder',
            key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET') || 'secret_placeholder',
        });
    }

    async createFeeStructure(dto: CreateFeeDto, currentUser: any): Promise<FeeStructure> {
        try {
            // Business logic validation
            if (dto.amount <= 0) {
                throw new BadRequestException('Fee amount must be greater than 0');
            }
            
            if (dto.lateFeePerDay && dto.lateFeePerDay < 0) {
                throw new BadRequestException('Late fee per day cannot be negative');
            }
            
            if (dto.dueDate && new Date(dto.dueDate) < new Date()) {
                throw new BadRequestException('Due date cannot be in the past');
            }
            
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
            const fee = await this.findFeeById(dto.feeId, currentUser);

            // Check if already assigned
            const existing = await this.transactionModel.findOne({
                studentId: dto.studentId,
                feeId: dto.feeId,
            });
            if (existing) {
                throw new BadRequestException('Fee already assigned to this student');
            }

            const transaction = new this.transactionModel({
                studentId: dto.studentId,
                feeId: dto.feeId,
                amount: dto.customAmount || fee.amount,
                amountPaid: 0,
                status: 'PENDING',
                dueDate: fee.dueDate,
                universityId: currentUser.universityId,
                remarks: dto.remarks || `Fee assigned: ${fee.name}`,
            });
            const saved = await transaction.save();

            return {
                message: 'Fee assigned successfully',
                transaction: saved,
            };
        } catch (error) {
            throw error;
        }
    }

    async recordPayment(dto: RecordPaymentDto, currentUser: any): Promise<any> {
        try {
            // Find existing pending transaction for this fee
            const existing = await this.transactionModel.findOne({
                feeId: dto.feeId,
                ...(dto['studentId'] ? { studentId: dto['studentId'] } : {}),
            });

            if (existing) {
                // Update existing transaction
                existing.amountPaid = (existing.amountPaid || 0) + dto.amountPaid;
                existing.paymentMethod = dto.paymentMethod as any;
                existing.status = 'COMPLETED' as FeeStatusEnum;
                existing.paymentDate = new Date();
                existing.transactionId = dto.transactionId || `TXN-${Date.now()}`;
                existing.remarks = dto.remarks || existing.remarks;
                existing.processedBy = currentUser.userId || currentUser._id;

                if (existing.amountPaid >= existing.amount) {
                    existing.status = 'FULLY_PAID' as FeeStatusEnum;
                } else {
                    existing.status = 'PARTIALLY_PAID' as FeeStatusEnum;
                }
                existing.lastPaymentDate = new Date();
                const saved = await existing.save();
                return {
                    message: existing.amountPaid >= existing.amount ? 'Payment completed' : 'Partial payment recorded',
                    transaction: saved,
                };
            }

            // Create new transaction if none exists
            const transaction = new this.transactionModel({
                ...dto,
                universityId: currentUser.universityId,
                paymentDate: new Date(),
                transactionId: dto.transactionId || `TXN-${Date.now()}`,
                status: 'COMPLETED',
                processedBy: currentUser.userId || currentUser._id,
            });
            const saved = await transaction.save();
            return { message: 'Payment recorded', transaction: saved };
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

    async initiateOnlinePayment(dto: InitiateOnlinePaymentDto, currentUser: any): Promise<any> {
        try {
            const studentId = currentUser.profileId || currentUser.userId || currentUser._id;
            
            // Validate fee exists and is assigned
            const transaction = await this.transactionModel.findOne({
                feeId: dto.feeId,
                studentId: studentId,
            });

            if (!transaction) {
                throw new NotFoundException('Fee not assigned to this student');
            }

            if (transaction.status === FeeStatusEnum.FULLY_PAID) {
                throw new BadRequestException('Fee already fully paid');
            }

            const options = {
                amount: Math.round(dto.amount * 100), // amount in the smallest currency unit
                currency: 'INR',
                receipt: `receipt_${transaction._id}`,
            };

            const order = await this.razorpay.orders.create(options);

            // Save order ID to transaction
            transaction.razorpayOrderId = order.id;
            await transaction.save();

            return {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                key: this.configService.get<string>('RAZORPAY_KEY_ID'),
            };
        } catch (error) {
            throw error;
        }
    }

    async verifyPayment(dto: VerifyPaymentDto, currentUser: any): Promise<any> {
        try {
            const body = dto.razorpayOrderId + '|' + dto.razorpayPaymentId;
            const expectedSignature = crypto
                .createHmac('sha256', this.configService.get<string>('RAZORPAY_KEY_SECRET') || 'secret_placeholder')
                .update(body.toString())
                .digest('hex');

            if (expectedSignature !== dto.razorpaySignature) {
                throw new BadRequestException('Invalid payment signature');
            }

            // Update transaction
            const transaction = await this.transactionModel.findOne({
                feeId: dto.feeId,
                razorpayOrderId: dto.razorpayOrderId,
            });

            if (!transaction) {
                throw new NotFoundException('Transaction not found');
            }

            const amountPaid = transaction.razorpayOrderId === dto.razorpayOrderId ? transaction.amount : 0; // Simplified for demo
            
            transaction.amountPaid = transaction.amount; // Mark as fully paid for demo if verified
            transaction.status = FeeStatusEnum.FULLY_PAID;
            transaction.razorpayPaymentId = dto.razorpayPaymentId;
            transaction.razorpaySignature = dto.razorpaySignature;
            transaction.paymentDate = new Date();
            transaction.paymentMethod = PaymentMethodEnum.ONLINE;
            transaction.lastPaymentDate = new Date();

            await transaction.save();

            return {
                message: 'Payment verified and recorded successfully',
                transaction,
            };
        } catch (error) {
            throw error;
        }
    }

    async getStudentsPaymentStatus(currentUser: any, filter: FeeFilterDto): Promise<any> {
        try {
            const page = filter.page || 1;
            const limit = filter.limit || 10;
            const skip = (page - 1) * limit;

            const studentQuery: any = {};
            if (currentUser.role !== Role.SUPER_ADMIN) {
                studentQuery.universityId = currentUser.universityId;
            }

            if (filter.departmentId) studentQuery.departmentId = filter.departmentId;
            if (filter.semester) studentQuery.currentSemester = filter.semester;
            if (filter.academicYearId) studentQuery.academicYearId = filter.academicYearId;

            const students = await this.studentProfileModel
                .find(studentQuery)
                .populate('userId', 'name email')
                .populate('departmentId', 'name')
                .skip(skip)
                .limit(limit)
                .exec();

            const total = await this.studentProfileModel.countDocuments(studentQuery);

            const result = await Promise.all(students.map(async (student) => {
                const transactions = await this.transactionModel.find({ studentId: student._id }).populate('feeId');
                
                const totalAmount = transactions.reduce((acc, curr) => acc + curr.amount, 0);
                const totalPaid = transactions.reduce((acc, curr) => acc + curr.amountPaid, 0);
                const pendingAmount = totalAmount - totalPaid;

                let overallStatus = 'Not Paid';
                if (totalAmount > 0) {
                    if (pendingAmount === 0) overallStatus = 'Paid';
                    else if (totalPaid > 0) overallStatus = 'Partially Paid';
                }

                return {
                    studentId: student._id,
                    enrollmentNo: student.enrollmentNo,
                    name: (student.userId as any)?.name,
                    department: (student.departmentId as any)?.name,
                    semester: student.currentSemester,
                    totalAmount,
                    totalPaid,
                    pendingAmount,
                    status: overallStatus,
                    transactions: transactions.map(t => ({
                        feeName: (t.feeId as any)?.name,
                        amount: t.amount,
                        paid: t.amountPaid,
                        status: t.status,
                        dueDate: t.dueDate
                    }))
                };
            }));

            return {
                data: result,
                pagination: { total, page, limit, pages: Math.ceil(total / limit) }
            };
        } catch (error) {
            throw error;
        }
    }

    async getTransactions(filter: any, page: number = 1, limit: number = 20): Promise<any> {
        try {
            const skip = (page - 1) * limit;
            const query: any = {};

            if (filter.universityId) query.universityId = filter.universityId;
            if (filter.status) query.status = filter.status;
            if (filter.paymentMethod) query.paymentMethod = filter.paymentMethod;

            const transactions = await this.transactionModel
                .find(query)
                .populate('studentId')
                .populate({
                    path: 'studentId',
                    populate: { path: 'userId', select: 'name' }
                })
                .populate('feeId')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec();

            const total = await this.transactionModel.countDocuments(query);

            return {
                data: transactions,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            console.error('Error in getTransactions:', error);
            throw new Error(`Failed to fetch transactions: ${error.message}`);
        }
    }
    async getStudentsPaymentStatusCSV(currentUser: any, filter: FeeFilterDto): Promise<string> {
        const { data } = await this.getStudentsPaymentStatus(currentUser, { ...filter, limit: 1000, page: 1 });
        
        const header = 'Enrollment No,Name,Department,Semester,Total Amount,Paid,Pending,Status\n';
        const rows = data.map(s => 
            `${s.enrollmentNo},${s.name},${s.department},${s.semester},${s.totalAmount},${s.totalPaid},${s.pendingAmount},${s.status}`
        ).join('\n');

        return header + rows;
    }
}
