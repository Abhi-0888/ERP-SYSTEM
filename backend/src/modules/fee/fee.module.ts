import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { FeeController } from './fee.controller';
import { FeeService } from './fee.service';
import { InvoiceService } from './invoice.service';
import { FeeCronService } from './fee-cron.service';
import { FeeStructure, FeeStructureSchema, Transaction, TransactionSchema } from './fee.schema';
import { StudentProfile, StudentProfileSchema } from '../student/student-profile.schema';

@Module({
    imports: [
        ConfigModule,
        ScheduleModule.forRoot(),
        MongooseModule.forFeature([
            { name: FeeStructure.name, schema: FeeStructureSchema },
            { name: Transaction.name, schema: TransactionSchema },
            { name: StudentProfile.name, schema: StudentProfileSchema },
        ]),
    ],
    controllers: [FeeController],
    providers: [FeeService, InvoiceService, FeeCronService],
    exports: [FeeService],
})
export class FeeModule { }
