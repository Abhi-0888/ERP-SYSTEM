
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StudentProfile } from '../modules/student/student-profile.schema';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const studentModel = app.get<Model<any>>(getModelToken('StudentProfile'));
    
    const students = await studentModel.find().limit(5);
    console.log('Sample Students:');
    students.forEach(s => {
        console.log(`- ID: ${s._id}, Univ: ${s.universityId}, User: ${s.userId}`);
    });
    
    await app.close();
}

bootstrap();
