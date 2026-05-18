
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const userModel = app.get<Model<any>>(getModelToken('User'));
    
    const user = await userModel.findOne({ username: 'finance' });
    console.log('Finance User:', user);
    
    await app.close();
}

bootstrap();
