import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog } from './audit.schema';

@Injectable()
export class AuditService {
    constructor(
        @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLog>,
    ) { }

    async create(logData: Partial<AuditLog>): Promise<AuditLog> {
        const newLog = new this.auditLogModel(logData);
        return newLog.save();
    }

    async findAll(universityId: string): Promise<AuditLog[]> {
        return this.auditLogModel.find({ universityId }).sort({ createdAt: -1 }).limit(100).exec();
    }
}
