
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const studentModel = app.get<Model<any>>(getModelToken('StudentProfile'));
    
    const students = await studentModel.find().lean().exec();
    console.log(`Found ${students.length} students`);
    students.forEach((s, i) => {
        console.log(`${i}: ID=${s._id}, UnivId=${s.universityId}`);
    });
    
    await app.close();
}

bootstrap();
