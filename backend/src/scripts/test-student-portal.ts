
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { FeeService } from '../modules/fee/fee.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const feeService = app.get(FeeService);
    const userModel = app.get<Model<any>>(getModelToken('User'));
    const studentModel = app.get<Model<any>>(getModelToken('StudentProfile'));
    
    // Rahul's user
    const rahulUser = await userModel.findOne({ email: 'rahul.s@srmap.edu.in' });
    const rahulProfile = await studentModel.findOne({ userId: rahulUser._id });
    
    console.log('Testing for student:', rahulUser.name, 'ProfileId:', rahulProfile._id);
    
    const result = await feeService.getStudentsPaymentStatus(rahulUser, { studentId: rahulProfile._id.toString() });
    
    console.log('Rahul Dashboard Result:', JSON.stringify(result, null, 2));
    
    await app.close();
}

bootstrap();
