
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const transactionModel = app.get<Model<any>>(getModelToken('Transaction'));
    const userModel = app.get<Model<any>>(getModelToken('User'));
    
    const financeUser = await userModel.findOne({ username: 'finance_head' });
    if (!financeUser || !financeUser.universityId) {
        console.log('Finance user or university not found');
        await app.close();
        return;
    }
    
    const universityId = financeUser.universityId;
    console.log(`Fixing transactions to use university: ${universityId}`);
    
    const result = await transactionModel.updateMany(
        { universityId: { $exists: false } },
        { $set: { universityId: universityId } }
    );
    
    console.log(`Updated ${result.modifiedCount} transactions`);
    
    await app.close();
}

bootstrap();
