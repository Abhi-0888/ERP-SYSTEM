import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

async function checkUser(username: string, plainPassword: string) {
    const app = await NestFactory.createApplicationContext(AppModule);
    const UserModel: Model<any> = app.get(getModelToken('User'));

    const user = await UserModel.findOne({ username });
    if (!user) {
        console.log(`❌ User ${username} not found`);
    } else {
        console.log(`✅ User found: ${user.username}`);
        console.log(`- Role: ${user.role}`);
        console.log(`- IsActive: ${user.isActive}`);
        
        const isMatch = await bcrypt.compare(plainPassword, user.password);
        console.log(`- Password Match ("${plainPassword}"): ${isMatch ? 'YES' : 'NO'}`);
        
        if (!isMatch) {
            console.log(`- Current Hash: ${user.password}`);
        }
    }

    await app.close();
}

const target = process.argv[2] || 'admin_srmap';
const pass = process.argv[3] || 'admin123';

checkUser(target, pass);
