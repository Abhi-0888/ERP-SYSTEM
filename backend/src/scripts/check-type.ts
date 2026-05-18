
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const studentModel = app.get<Model<any>>(getModelToken('StudentProfile'));
    
    const student = await studentModel.findOne();
    if (student) {
        console.log('Student UnivId:', student.universityId);
        console.log('Type of UnivId:', typeof student.universityId);
        console.log('Is instance of ObjectId:', student.universityId instanceof require('mongoose').Types.ObjectId);
    } else {
        console.log('No students found at all!');
    }
    
    await app.close();
}

bootstrap();
