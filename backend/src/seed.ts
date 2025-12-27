import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UniversityService } from './modules/university/university.service';
import { UserService } from './modules/user/user.service';
import { Role } from './common/enums/role.enum';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
    console.log('🚀 Starting Seed Script...');
    const app = await NestFactory.createApplicationContext(AppModule);

    // Get Native Mongoose Connection
    const connection = app.get<Connection>(getConnectionToken());

    // Explicitly wait for connection if not ready
    if (connection.readyState !== 1) {
        console.log('⏳ Waiting for database connection...');
        await new Promise(resolve => {
            connection.once('connected', resolve); // Event listener for open
            // Fallback timeout just in case it's ALREADY connected but state mismatch (unlikely)
            setTimeout(resolve, 5000);
        });
    }
    console.log(`✅ DB Connection Status: ${connection.readyState} (1=Connected)`);

    console.log('🧹 flushing collections...');
    const collections = connection.collections;
    for (const key in collections) {
        try {
            await collections[key].deleteMany({});
            console.log(`   - Cleared: ${key}`);
        } catch (err) {
            console.error(`   ! Failed ${key}: ${err.message}`);
        }
    }
    console.log('✨ All collections flushed.');

    const userService = app.get(UserService);

    console.log('🌱 Seeding Super Admin...');
    try {
        // Direct DB insert might be safer if service has validation logic for 'universityId'
        // But let's try service first as it handles hashing (if we didn't pass hashed) 
        // actually UserService usually hashes. 
        // Wait, previous seed hashed manually. Let's look at userService.create

        // Safe approach: Use the User Model directly to avoid service validation logic on universityId if any.
        const userModel = connection.model('User');

        await userModel.create({
            name: 'System Root',
            username: 'superadmin',
            email: 'admin@git.edu', // As requested in credentials.txt
            password: await bcrypt.hash('password123', 10),
            role: Role.SUPER_ADMIN,
            isActive: true,
            createdAt: new Date(),
        });
        console.log('✅ Super Admin Created.');
    } catch (e) {
        console.error('❌ Error creating Super Admin:', e);
    }

    await app.close();
    console.log('🏁 Seed Script Finished.');
    process.exit(0);
}

bootstrap();
