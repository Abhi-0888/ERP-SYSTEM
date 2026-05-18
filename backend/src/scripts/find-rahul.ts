import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

async function findRahul() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const StudentModel: Model<any> = app.get(getModelToken('StudentProfile'));
    const UserModel: Model<any> = app.get(getModelToken('User'));
    const TransactionModel: Model<any> = app.get(getModelToken('Transaction'));

    const rahulUser = await UserModel.findOne({ name: 'Rahul Sharma' });
    if (!rahulUser) {
        console.log('User Rahul Sharma not found');
    } else {
        console.log(`Rahul User ID: ${rahulUser._id}`);
        const rahulProfile = await StudentModel.findOne({ userId: rahulUser._id });
        if (!rahulProfile) {
            console.log('Rahul Profile not found');
        } else {
            console.log(`Rahul Profile ID: ${rahulProfile._id}`);
            const transactions = await TransactionModel.find({ studentId: rahulProfile._id });
            console.log(`Found ${transactions.length} transactions for Rahul`);
            transactions.forEach(t => {
                console.log(`- ID: ${t._id}, Status: ${t.status}, Amount: ${t.amount}, Paid: ${t.amountPaid}`);
            });
        }
    }

    await app.close();
}

findRahul();
