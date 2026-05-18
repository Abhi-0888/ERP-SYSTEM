
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const studentModel = app.get<Model<any>>(getModelToken('StudentProfile'));
    const userModel = app.get<Model<any>>(getModelToken('User'));
    
    const suresh = await userModel.findOne({ username: 'finance_head' });
    const universityId = suresh.universityId;
    
    console.log('Force updating ALL students to university:', universityId);
    
    const result = await studentModel.updateMany({}, { $set: { universityId: universityId } });
    console.log(`Updated ${result.modifiedCount} student profiles`);
    
    const txns = await app.get<Model<any>>(getModelToken('Transaction')).updateMany({}, { $set: { universityId: universityId } });
    console.log(`Updated ${txns.modifiedCount} transactions`);

    const structs = await app.get<Model<any>>(getModelToken('FeeStructure')).updateMany({}, { $set: { universityId: universityId } });
    console.log(`Updated ${structs.modifiedCount} fee structures`);
    
    await app.close();
}

bootstrap();
