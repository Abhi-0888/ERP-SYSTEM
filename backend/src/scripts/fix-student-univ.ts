
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const studentModel = app.get<Model<any>>(getModelToken('StudentProfile'));
    const userModel = app.get<Model<any>>(getModelToken('User'));
    
    const financeUser = await userModel.findOne({ username: 'finance_head' });
    if (!financeUser || !financeUser.universityId) {
        console.log('Finance user or university not found');
        await app.close();
        return;
    }
    
    const universityId = financeUser.universityId;
    console.log(`Fixing students to use university: ${universityId}`);
    
    const result = await studentModel.updateMany(
        { universityId: { $exists: false } },
        { $set: { universityId: universityId } }
    );
    
    console.log(`Updated ${result.modifiedCount} students`);
    
    await app.close();
}

bootstrap();
