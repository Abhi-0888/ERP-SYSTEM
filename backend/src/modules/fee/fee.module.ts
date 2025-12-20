import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeeStructure, FeeStructureSchema, Transaction, TransactionSchema } from './fee.schema';
import { FeeService } from './fee.service';
import { FeeController } from './fee.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: FeeStructure.name, schema: FeeStructureSchema },
            { name: Transaction.name, schema: TransactionSchema },
        ]),
    ],
    controllers: [FeeController],
    providers: [FeeService],
    exports: [FeeService],
})
export class FeeModule { }
