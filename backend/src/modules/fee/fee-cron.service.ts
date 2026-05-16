import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument, FeeStatusEnum, FeeStructure, FeeStructureDocument } from './fee.schema';

@Injectable()
export class FeeCronService {
    private readonly logger = new Logger(FeeCronService.name);

    constructor(
        @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
        @InjectModel(FeeStructure.name) private feeStructureModel: Model<FeeStructureDocument>,
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleLateFees() {
        this.logger.log('Running daily late fee calculation job...');

        const today = new Date();
        
        // Find all unpaid or partially paid transactions that are overdue
        const overdueTransactions = await this.transactionModel.find({
            status: { $in: [FeeStatusEnum.PENDING, FeeStatusEnum.PARTIALLY_PAID] },
            dueDate: { $lt: today }
        }).populate('feeId');

        let updatedCount = 0;

        for (const transaction of overdueTransactions) {
            const feeStructure = transaction.feeId as unknown as FeeStructure;
            
            if (feeStructure && feeStructure.lateFeePerDay > 0) {
                // Calculate days overdue
                const dueDate = new Date(transaction.dueDate);
                const diffTime = Math.abs(today.getTime() - dueDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                const lateFee = diffDays * feeStructure.lateFeePerDay;
                
                if (lateFee > transaction.lateFeesApplied) {
                    transaction.lateFeesApplied = lateFee;
                    transaction.status = FeeStatusEnum.OVERDUE;
                    await transaction.save();
                    updatedCount++;
                }
            }
        }

        this.logger.log(`Late fee job completed. Updated ${updatedCount} transactions.`);
    }
}
