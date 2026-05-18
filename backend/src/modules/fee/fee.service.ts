import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { FeeStructure, FeeStructureDocument, Transaction, TransactionDocument, FeeStatusEnum, PaymentMethodEnum, TransactionSchema } from './fee.schema';
import { CreateFeeDto, UpdateFeeDto, RecordPaymentDto, AssignFeeToStudentDto, FeeFilterDto, InitiateOnlinePaymentDto, VerifyPaymentDto, BulkAddFineDto, BulkAssignFeeDto } from './fee.dto';
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
            const userId = currentUser.userId || currentUser._id || currentUser.sub;
            let studentId = currentUser.profileId;
            
            if (!studentId) {
                const student = await this.studentProfileModel.findOne({ userId });
                if (!student) {
                    throw new NotFoundException('Student profile not found for this user');
                }
                studentId = student._id;
            }
            
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

            let orderId = `order_${Date.now()}`;
            let orderAmount = Math.round(dto.amount * 100);
            let orderCurrency = 'INR';

            const isTestKey = this.configService.get<string>('RAZORPAY_KEY_ID') === 'rzp_test_placeholder' || !this.configService.get<string>('RAZORPAY_KEY_ID');

            if (!isTestKey) {
                const options = {
                    amount: orderAmount,
                    currency: orderCurrency,
                    receipt: `receipt_${transaction._id}`,
                };

                try {
                    const order = await this.razorpay.orders.create(options);
                    orderId = order.id;
                    orderAmount = order.amount;
                    orderCurrency = order.currency;
                } catch (rzpErr: any) {
                    throw new BadRequestException(rzpErr.error?.description || 'Razorpay order creation failed');
                }
            }

            // Save order ID to transaction
            transaction.razorpayOrderId = orderId;
            await transaction.save();

            return {
                orderId: orderId,
                amount: orderAmount,
                currency: orderCurrency,
                key: this.configService.get<string>('RAZORPAY_KEY_ID') || 'rzp_test_placeholder',
            };
        } catch (error) {
            throw error;
        }
    }

    async verifyPayment(dto: VerifyPaymentDto, currentUser: any): Promise<any> {
        try {
            const isTestKey = this.configService.get<string>('RAZORPAY_KEY_SECRET') === 'secret_placeholder' || !this.configService.get<string>('RAZORPAY_KEY_SECRET');

            if (!isTestKey) {
                const body = dto.razorpayOrderId + '|' + dto.razorpayPaymentId;
                const expectedSignature = crypto
                    .createHmac('sha256', this.configService.get<string>('RAZORPAY_KEY_SECRET') || '')
                    .update(body.toString())
                    .digest('hex');

                if (expectedSignature !== dto.razorpaySignature) {
                    throw new BadRequestException('Invalid payment signature');
                }
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
            if (currentUser.role !== Role.SUPER_ADMIN && currentUser.universityId) {
                const { Types } = require('mongoose');
                studentQuery.universityId = new Types.ObjectId(currentUser.universityId);
            }

            if (filter.studentId) {
                const student = await this.studentProfileModel.findOne({ 
                    $or: [
                        { _id: filter.studentId },
                        { userId: filter.studentId }
                    ]
                });
                console.log('DEBUG: Found student profile:', student ? student._id : 'NONE');
                if (student) studentQuery._id = student._id;
                else studentQuery._id = filter.studentId;
            }

            console.log('DEBUG: studentQuery:', JSON.stringify(studentQuery));

            if (filter.departmentId && filter.departmentId !== 'ALL') studentQuery.departmentId = filter.departmentId;
            if (filter.semester) studentQuery.currentSemester = filter.semester;

            // Fetch students without limit first to filter by status in memory
            // This is necessary because status is a calculated field
            const allMatchingStudents = await this.studentProfileModel
                .find(studentQuery)
                .populate('userId', 'name email')
                .populate('departmentId', 'name')
                .exec();

            const result = await Promise.all(allMatchingStudents.map(async (student) => {
                const transactions = await this.transactionModel.find({ studentId: student._id }).populate('feeId');
                
                const totalAmount = transactions.reduce((acc, curr) => acc + curr.amount, 0);
                const totalPaid = transactions.reduce((acc, curr) => acc + curr.amountPaid, 0);
                const pendingAmount = totalAmount - totalPaid;

                let overallStatus = 'No Fees Assigned';
                if (totalAmount > 0) {
                    if (pendingAmount === 0) overallStatus = FeeStatusEnum.FULLY_PAID;
                    else if (totalPaid > 0) overallStatus = FeeStatusEnum.PARTIALLY_PAID;
                    else overallStatus = FeeStatusEnum.PENDING;
                }

                return {
                    studentId: student._id,
                    name: (student.userId as any)?.name,
                    enrollmentNo: student.enrollmentNo,
                    department: (student.departmentId as any)?.name,
                    semester: student.currentSemester,
                    totalAmount,
                    totalPaid,
                    pendingAmount,
                    status: overallStatus,
                    pendingFees: transactions.map(t => ({
                        ...t.toObject(),
                        feeStructureId: t.feeId, // Map for frontend compatibility
                    })),
                };
            }));

            // Filter by status in memory if requested
            let filteredResult = result;
            if (filter.status && (filter.status as any) !== 'ALL') {
                filteredResult = result.filter(s => s.status === filter.status);
            }

            const total = filteredResult.length;
            const paginatedResult = filteredResult.slice(skip, skip + limit);

            if (filter.studentId && filteredResult.length > 0) {
                const s = filteredResult[0];
                return {
                    ...s,
                    totalDue: s.pendingAmount,
                    totalPaid: s.totalPaid,
                    pendingFees: s.pendingFees,
                };
            }

            return {
                data: paginatedResult,
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

    async bulkAddFine(dto: BulkAddFineDto, currentUser: any): Promise<any> {
        const results = [];
        for (const studentId of dto.studentIds) {
            let transaction = await this.transactionModel.findOne({
                studentId,
                status: FeeStatusEnum.PENDING,
            });

            if (transaction) {
                transaction.lateFeesApplied = (transaction.lateFeesApplied || 0) + dto.amount;
                transaction.remarks = `${transaction.remarks || ''}\nFine added: ${dto.reason} (₹${dto.amount})`.trim();
                await transaction.save();
                results.push({ studentId, status: 'Added to existing transaction', transactionId: transaction._id });
            } else {
                const newTxn = await this.transactionModel.create({
                    studentId,
                    amount: dto.amount,
                    amountPaid: 0,
                    status: FeeStatusEnum.PENDING,
                    remarks: `Fine: ${dto.reason}`,
                    universityId: currentUser.universityId,
                    lateFeesApplied: dto.amount,
                    dueDate: new Date(),
                });
                results.push({ studentId, status: 'New fine transaction created', transactionId: newTxn._id });
            }
        }
        return { message: `${dto.studentIds.length} fines processed`, results };
    }

    async getStudentDetailedFees(studentId: string, currentUser: any): Promise<any> {
        const student = await this.studentProfileModel.findById(studentId)
            .populate('userId', 'name email')
            .populate('departmentId', 'name')
            .exec();

        if (!student) throw new NotFoundException('Student profile not found');

        const transactions = await this.transactionModel.find({ studentId })
            .populate('feeId')
            .populate('processedBy', 'name')
            .sort({ createdAt: -1 })
            .exec();

        return {
            student: {
                id: student._id,
                name: (student.userId as any)?.name,
                email: (student.userId as any)?.email,
                enrollmentNo: student.enrollmentNo,
                department: (student.departmentId as any)?.name,
                semester: student.currentSemester,
            },
            transactions: transactions.map(t => ({
                id: t._id,
                feeName: (t.feeId as any)?.name || 'Manual Fine / Misc',
                type: (t.feeId as any)?.type || 'OTHER',
                amount: t.amount,
                paid: t.amountPaid,
                lateFees: t.lateFeesApplied,
                status: t.status,
                paymentDate: t.paymentDate,
                transactionId: t.transactionId,
                method: t.paymentMethod,
                remarks: t.remarks,
                processedBy: (t.processedBy as any)?.name,
            }))
        };
    }

    async bulkAssignFees(dto: BulkAssignFeeDto, currentUser: any): Promise<any> {
        const fee = await this.feeStructureModel.findById(dto.feeId);
        if (!fee) throw new NotFoundException('Fee structure not found');

        let targetIds = dto.studentIds;
        if (dto.studentIds.includes('ALL')) {
            const universityId = dto.universityId || currentUser.universityId;
            const query: any = {};
            if (universityId) query.universityId = universityId;
            
            const allStudents = await this.studentProfileModel.find(query)
                .select('_id')
                .exec();
            targetIds = allStudents.map(s => s._id.toString());
        }

        const results = { assigned: 0, skipped: 0, errors: [] };

        for (const studentId of targetIds) {
            try {
                const existing = await this.transactionModel.findOne({
                    studentId,
                    feeId: dto.feeId,
                });

                if (existing) {
                    results.skipped++;
                    continue;
                }

                await this.transactionModel.create({
                    studentId,
                    feeId: dto.feeId,
                    amount: fee.amount,
                    amountPaid: 0,
                    status: 'PENDING',
                    dueDate: fee.dueDate,
                    universityId: currentUser.universityId,
                    remarks: dto.remarks || `Bulk assigned: ${fee.name}`,
                });
                results.assigned++;
            } catch (error: any) {
                results.errors.push({ studentId, error: error.message });
            }
        }

        return { message: 'Bulk assignment complete', ...results };
    }
}
