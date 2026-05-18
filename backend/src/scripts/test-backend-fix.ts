
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { FeeService } from '../modules/fee/fee.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const feeService = app.get(FeeService);
    const userModel = app.get<Model<any>>(getModelToken('User'));
    
    const suresh = await userModel.findOne({ username: 'finance_head' });
    console.log('Testing for user:', suresh.name, 'Univ:', suresh.universityId);
    
    const result = await feeService.getStudentsPaymentStatus(suresh, { page: 1, limit: 10 });
    console.log('Result Data Length:', result.data?.length);
    if (result.data && result.data.length > 0) {
        console.log('First student sample:', {
            name: result.data[0].name,
            total: result.data[0].totalAmount,
            status: result.data[0].status
        });
    } else {
        console.log('NO RECORDS FOUND IN BACKEND TEST');
    }
    
    await app.close();
}

bootstrap();
