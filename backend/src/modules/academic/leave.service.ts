import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Leave, LeaveDocument, LeaveType, LeaveStatus } from '../academic/leave.schema';

@Injectable()
export class LeaveService {
    constructor(
        @InjectModel(Leave.name) private leaveModel: Model<LeaveDocument>,
    ) { }

    async create(createLeaveDto: any, user: any) {
        const leave = new this.leaveModel({
            ...createLeaveDto,
            userId: user.userId || user._id,
            universityId: user.universityId,
            departmentId: user.departmentId,
            status: LeaveStatus.PENDING,
        });
        return await leave.save();
    }

    async findAll(user: any, filters: any = {}) {
        const query: any = { universityId: user.universityId };
        
        if (filters.userId) query.userId = filters.userId;
        if (filters.departmentId) query.departmentId = filters.departmentId;
        if (filters.leaveType) query.leaveType = filters.leaveType;
        if (filters.status) query.status = filters.status;
        if (filters.startDate && filters.endDate) {
            query.startDate = { $gte: new Date(filters.startDate) };
            query.endDate = { $lte: new Date(filters.endDate) };
        }

        return await this.leaveModel.find(query)
            .populate('userId', 'name username role')
            .populate('approvedBy', 'name username')
            .sort({ createdAt: -1 })
            .exec();
    }

    async findById(id: string) {
        return await this.leaveModel.findById(id)
            .populate('userId', 'name username role departmentId')
            .populate('approvedBy', 'name username')
            .exec();
    }

    async findByUser(userId: string) {
        return await this.leaveModel.find({ userId })
            .populate('approvedBy', 'name username')
            .sort({ createdAt: -1 })
            .exec();
    }

    async approveLeave(id: string, approverId: string, remarks?: string) {
        return await this.leaveModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    status: LeaveStatus.APPROVED,
                    approvedBy: approverId,
                    approvedAt: new Date(),
                    ...(remarks && { rejectionReason: remarks })
                }
            },
            { new: true }
        ).exec();
    }

    async rejectLeave(id: string, approverId: string, reason: string) {
        return await this.leaveModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    status: LeaveStatus.REJECTED,
                    approvedBy: approverId,
                    approvedAt: new Date(),
                    rejectionReason: reason
                }
            },
            { new: true }
        ).exec();
    }

    async cancelLeave(id: string) {
        return await this.leaveModel.findByIdAndUpdate(
            id,
            { $set: { status: LeaveStatus.CANCELLED } },
            { new: true }
        ).exec();
    }

    async getLeaveBalance(userId: string, year: number) {
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31);

        const leaves = await this.leaveModel.find({
            userId,
            status: LeaveStatus.APPROVED,
            startDate: { $gte: startOfYear, $lte: endOfYear }
        });

        const usedLeaves: Record<string, number> = {};
        leaves.forEach(leave => {
            usedLeaves[leave.leaveType] = (usedLeaves[leave.leaveType] || 0) + leave.totalDays;
        });

        const defaults: Record<string, number> = {
            [LeaveType.CASUAL]: 12,
            [LeaveType.MEDICAL]: 10,
            [LeaveType.EARNED]: 30,
            [LeaveType.MATERNITY]: 180,
            [LeaveType.PATERNITY]: 15,
            [LeaveType.STUDY]: 30,
            [LeaveType.SICK]: 10,
            [LeaveType.OTHER]: 5
        };

        const balance: Record<string, { used: number; remaining: number; total: number }> = {};
        Object.keys(defaults).forEach(type => {
            const used = usedLeaves[type] || 0;
            balance[type] = {
                used,
                remaining: defaults[type] - used,
                total: defaults[type]
            };
        });

        return balance;
    }

    async getPendingApprovals(departmentId: string, userRole: string) {
        const query: any = { status: LeaveStatus.PENDING };
        
        if (userRole === 'HOD') {
            query.departmentId = departmentId;
        }
        
        return await this.leaveModel.find(query)
            .populate('userId', 'name username role')
            .sort({ createdAt: -1 })
            .exec();
    }

    async getLeaveStats(universityId: string, month?: number, year?: number) {
        const query: any = { universityId };
        
        if (month && year) {
            const start = new Date(year, month - 1, 1);
            const end = new Date(year, month, 0);
            query.startDate = { $gte: start, $lte: end };
        }

        const byStatus = await this.leaveModel.aggregate([
            { $match: query },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const byType = await this.leaveModel.aggregate([
            { $match: query },
            { $group: { _id: '$leaveType', count: { $sum: 1 }, totalDays: { $sum: '$totalDays' } } }
        ]);

        return { byStatus, byType };
    }
}
