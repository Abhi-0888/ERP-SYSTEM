
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const transactionModel = app.get<Model<any>>(getModelToken('Transaction'));
    
    const txns = await transactionModel.find().limit(5);
    console.log('Sample Transactions:');
    txns.forEach(t => {
        console.log(`- ID: ${t._id}, Univ: ${t.universityId}, Student: ${t.studentId}`);
    });
    
    await app.close();
}

bootstrap();
