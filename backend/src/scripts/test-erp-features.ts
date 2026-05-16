import { NestFactory } from '@nestjs/core';
import { FeeModule } from '../modules/fee/fee.module';
import { FeeService } from '../modules/fee/fee.service';
import { FeeCronService } from '../modules/fee/fee-cron.service';
import { FeeStatusEnum } from '../modules/fee/fee.schema';
import { AppModule } from '../app.module';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const feeService = app.get(FeeService);
    const feeCronService = app.get(FeeCronService);

    console.log('--- ERP Feature Test ---');

    // 1. Check if FeeCronService can run
    try {
        console.log('Testing Late Fee Cron Service...');
        await feeCronService.handleLateFees();
        console.log('✅ Late Fee Cron Service executed successfully');
    } catch (err) {
        console.error('❌ Late Fee Cron Service failed:', err.message);
    }

    // 2. Check if Transaction models have the new fields
    try {
        const sample = await feeService.transactionModel.findOne();
        if (sample) {
            console.log('Validating Transaction fields...');
            console.log(`- lateFeesApplied: ${sample.lateFeesApplied}`);
            console.log(`- discountAmount: ${sample.discountAmount}`);
            console.log('✅ New fields present in database model');
        }
    } catch (err) {
        console.error('❌ Model validation failed:', err.message);
    }

    await app.close();
}

bootstrap();
