
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { FeeService } from '../modules/fee/fee.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const feeService = app.get(FeeService);
    
    // Simulate real req.user from JwtStrategy
    const simulatedUser = {
        userId: '6a03657f9640db65ccb3e413', // Rahul's User ID
        username: 'student_cse1',
        role: 'STUDENT',
        universityId: '6a03657e9640db65ccb3e385' // String format
    };
    
    console.log('--- SIMULATED STUDENT REQUEST ---');
    const result = await feeService.getStudentsPaymentStatus(simulatedUser as any, { 
        studentId: '6a03657f9640db65ccb3e413' 
    });
    
    console.log('Result:', JSON.stringify(result, null, 2));
    
    await app.close();
}

bootstrap();
