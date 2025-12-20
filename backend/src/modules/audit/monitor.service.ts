import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog } from './audit.schema';

@Injectable()
export class MonitorService {
    private readonly logger = new Logger(MonitorService.name);

    constructor(
        @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLog>,
    ) { }

    @Cron(CronExpression.EVERY_HOUR)
    async handleBehavioralMonitoring() {
        this.logger.log('Running behavioral monitoring scan...');

        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);

        // 1. Detect High Frequency Modifications
        const highFreqLogs = await this.auditLogModel.aggregate([
            { $match: { createdAt: { $gte: oneHourAgo }, action: { $in: ['UPDATE', 'DELETE'] } } },
            { $group: { _id: '$userId', count: { $sum: 1 }, username: { $first: '$username' } } },
            { $match: { count: { $gt: 10 } } } // Threshold for alert
        ]);

        if (highFreqLogs.length > 0) {
            highFreqLogs.forEach(log => {
                this.logger.warn(`ALERT: Potential suspicious activity detected. User ${log.username} (${log._id}) performed ${log.count} modifications in the last hour.`);
            });
        }

        // 2. Detect Sensitive Module Access at Odd Hours
        const currentHour = new Date().getHours();
        if (currentHour < 6 || currentHour > 22) {
            const oddHourSensitiveLogs = await this.auditLogModel.find({
                createdAt: { $gte: oneHourAgo },
                module: { $in: ['FEE', 'EXAM', 'USER'] },
                action: { $in: ['UPDATE', 'DELETE'] }
            }).exec();

            if (oddHourSensitiveLogs.length > 0) {
                this.logger.warn(`ALERT: Sensitive module modifications detected during off-peak hours (${currentHour}:00). ${oddHourSensitiveLogs.length} events logged.`);
            }
        }

        this.logger.log('Behavioral monitoring scan completed.');
    }
}
