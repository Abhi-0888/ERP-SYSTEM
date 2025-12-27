import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { University, UniversityDocument } from '../university/university.schema';
import { User, UserDocument } from '../user/user.schema';
import { AuditLog } from '../audit/audit.schema';
import { Hostel, HostelDocument } from '../hostel/hostel.schema';
import { Book, BookDocument } from '../library/library.schema';
import { Vehicle, VehicleDocument } from '../transport/transport.schema';
import { SupportTicket } from '../support/support.schema';
export type AuditLogDocument = AuditLog & Document;

@Injectable()
export class SuperAdminService {
    constructor(
        @InjectModel(University.name) private universityModel: Model<UniversityDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
        @InjectModel(Hostel.name) private hostelModel: Model<HostelDocument>,
        @InjectModel(Book.name) private bookModel: Model<BookDocument>,
        @InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>,
        @InjectModel(SupportTicket.name) private supportTicketModel: Model<SupportTicket>,
    ) { }

    async getDashboardStats() {
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

        const [totalUniversities, activeUniversities, totalUsers, activeSessions, failedLogins, criticalEvents, openTickets] = await Promise.all([
            this.universityModel.countDocuments({}),
            this.universityModel.countDocuments({ status: 'active' }),
            this.userModel.countDocuments({}),
            // Real Active Sessions (last 15m)
            this.userModel.countDocuments({ lastLogin: { $gte: fifteenMinutesAgo } }),
            // Real Failed Logins (All time or last 24h? Let's do last 24h for dashboard relevance)
            this.auditLogModel.countDocuments({
                action: 'LOGIN_FAILED',
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            }),
            // Real "Overrides" -> High severity events in last 24h (Critical)
            this.auditLogModel.countDocuments({
                severity: 'CRITICAL',
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            }),
            // Real Pending Tickets
            this.supportTicketModel.countDocuments({ status: { $in: ['open', 'in-progress'] } })
        ]);

        return {
            totalUniversities,
            activeUniversities,
            totalUsers,
            activeSessions,
            systemStatus: 'Healthy', // Could be dynamic based on error rates
            failedLogins,
            permissionOverrides: criticalEvents,
            auditAlerts: criticalEvents, // Reuse critical count or query filtering for unread alerts
            pendingTickets: openTickets
        };
    }

    async getSecurityStats() {
        const [totalLogs, recentAlerts, failedLogins] = await Promise.all([
            this.auditLogModel.countDocuments({}),
            this.auditLogModel.find({ action: { $in: ['DELETE', 'FORCE_LOGOUT'] } }).sort({ createdAt: -1 }).limit(5),
            // Mocking failed logins count if not explicitly tracked in audits yet
            Promise.resolve(0)
        ]);

        return {
            threatLevel: 'Low', // Dynamic logic could go here
            activeMonitoring: true,
            totalLogs,
            recentAlerts,
            failedLogins
        };
    }

    async getModuleStats() {
        const [totalHostels, totalBooks, totalVehicles] = await Promise.all([
            this.hostelModel.countDocuments({}),
            this.bookModel.countDocuments({}),
            this.vehicleModel.countDocuments({})
        ]);

        return {
            hostels: { total: totalHostels, active: true },
            library: { totalBooks: totalBooks, digitalMode: true },
            transport: { fleetSize: totalVehicles, routes: 0 },
            placement: { activeDrives: 0, placedStudents: 0 } // Placeholder
        };
    }

    async getAuditLogs(page: number = 1, limit: number = 50, userId?: string, module?: string, severity?: string, startDate?: string, endDate?: string) {
        const skip = (page - 1) * limit;
        const filter: any = {};
        if (userId) filter.userId = userId;
        if (module) filter.module = module;
        if (severity) filter.severity = severity;
        if (startDate && endDate) {
            filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const [logs, total] = await Promise.all([
            this.auditLogModel.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.auditLogModel.countDocuments(filter)
        ]);
        return { logs, total, page, limit };
    }

    async getSecurityEvents() {
        // Aggregate high-severity events
        const failedvectors = await this.auditLogModel.aggregate([
            { $match: { action: { $in: ['LOGIN_FAILED', 'UNAUTHORIZED', 'FORBIDDEN'] } } },
            { $group: { _id: "$module", count: { $sum: 1 }, vector: { $first: "$action" } } },
            { $project: { vector: 1, count: 1, target: "$_id", status: "BLOCKED" } }
        ]);

        const sensitiveActions = await this.auditLogModel.find({
            severity: { $in: ['HIGH', 'CRITICAL'] }
        }).sort({ createdAt: -1 }).limit(10);

        return {
            failedVectors: failedvectors.length ? failedvectors : [],
            sensitiveActions: sensitiveActions.map(a => ({
                action: a.action,
                user: a.username || 'SYSTEM',
                delta: a.module,
                time: a['createdAt'] // Format on frontend
            }))
        };
    }

    async getActiveSessions() {
        // Assume active if login in last 15 minutes
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

        const sessions = await this.userModel.aggregate([
            { $match: { lastLogin: { $gte: fifteenMinutesAgo } } },
            { $group: { _id: "$universityId", count: { $sum: 1 } } },
            { $lookup: { from: 'universities', localField: '_id', foreignField: '_id', as: 'university' } },
            { $unwind: "$university" },
            { $project: { uni: "$university.name", active: "$count", status: { $cond: { if: { $gt: ["$count", 50] }, then: "Peak", else: "Normal" } } } }
        ]);

        return sessions;
    }

    async exportReports(type: 'USER_ACTIVITY' | 'SECURITY_EVENTS', startDate?: string, endDate?: string) {
        const query: any = {};
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (type === 'SECURITY_EVENTS') {
            query.severity = { $in: ['CRITICAL', 'WARNING'] };
        }

        const logs = await this.auditLogModel.find(query).sort({ createdAt: -1 }).limit(1000).exec();

        // SCV Generation
        const headers = ['Timestamp', 'UserID', 'Role', 'UniversityID', 'Action', 'Module', 'IP Address', 'Severity', 'Details'];
        const rows = logs.map(log => [
            log.createdAt.toISOString(),
            log.userId || 'N/A',
            'N/A', // Role not always in audit log, simplified
            log.universityId || 'Global',
            log.action,
            log.module,
            log.ipAddress || 'N/A',
            log.severity || 'Info',
            `"${(log.details || '').replace(/"/g, '""')}"` // Escape quotes
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        return csvContent;
    }
}
