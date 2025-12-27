import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SupportTicket } from './support.schema';
import { AuditLog } from '../audit/audit.schema';

@Injectable()
export class SupportService {
    constructor(
        @InjectModel(SupportTicket.name) private ticketModel: Model<SupportTicket>,
        @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLog>,
    ) { }

    async findAll() {
        return this.ticketModel.find().populate('userId').populate('universityId').sort({ createdAt: -1 }).exec();
    }

    async findOne(id: string) {
        return this.ticketModel.findById(id).populate('userId').populate('universityId').exec();
    }

    async updateStatus(id: string, status: string) {
        const ticket = await this.ticketModel.findByIdAndUpdate(id, { status }, { new: true }).exec();

        await this.auditLogModel.create({
            action: 'TICKET_STATUS_UPDATE',
            module: 'SUPPORT',
            userId: ticket.userId, // Ideally logged in user, but for now linking to ticket owner or fetch from context if passed
            username: 'SuperAdmin', // Hardcoded for this context as only SuperAdmin calls this
            universityId: ticket.universityId,
            details: `Ticket ${id} status updated to ${status}`,
            severity: 'Info',
            status: 'SUCCESS'
        });

        return ticket;
    }

    async reply(id: string, message: string, userId: string) {
        const update = {
            message,
            updatedBy: 'SuperAdmin',
            at: new Date()
        };

        const ticket = await this.ticketModel.findByIdAndUpdate(
            id,
            {
                $push: { updates: update },
                $set: { status: 'in-progress' } // Auto-reopen if closed? Or just ensuring it's active
            },
            { new: true }
        ).exec();

        await this.auditLogModel.create({
            action: 'TICKET_REPLY',
            module: 'SUPPORT',
            userId: userId,
            username: 'SuperAdmin',
            universityId: ticket.universityId,
            details: `Reply sent to ticket ${id}`,
            severity: 'Info',
            status: 'SUCCESS'
        });

        return ticket;
    }
}
