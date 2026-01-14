import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UniversityService } from './modules/university/university.service';
import { UserService } from './modules/user/user.service';
import { Role } from './common/enums/role.enum';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
    // For safety: seeding is disabled by default. Require explicit opt-in.
    const ENABLE_SEED = process.env.ENABLE_SEED === 'true';
    if (!ENABLE_SEED) {
        console.log('⚠️  Seed script is disabled by default to prevent inserting fake data.');
        console.log('To enable seeding, run with ENABLE_SEED=true and provide required SEED_* env vars.');
        process.exit(0);
    }

    console.log('🚀 Starting Seed Script (ENABLED)...');
    const app = await NestFactory.createApplicationContext(AppModule);

    // Get Native Mongoose Connection
    const connection = app.get<Connection>(getConnectionToken());

    // Explicitly wait for connection if not ready
    if (connection.readyState !== 1) {
        console.log('⏳ Waiting for database connection...');
        await new Promise(resolve => {
            connection.once('connected', resolve);
            setTimeout(resolve, 5000);
        });
    }
    console.log(`✅ DB Connection Status: ${connection.readyState} (1=Connected)`);

    // Optionally clear collections only when explicitly allowed
    const FORCE_CLEAR = process.env.SEED_FORCE_CLEAR === 'true';
    if (FORCE_CLEAR) {
        console.log('🧹 Force-clearing collections (SEED_FORCE_CLEAR=true)...');
        const collections = connection.collections;
        for (const key in collections) {
            try {
                await collections[key].deleteMany({});
                console.log(`   - Cleared: ${key}`);
            } catch (err) {
                console.error(`   ! Failed ${key}: ${err.message}`);
            }
        }
        console.log('✨ Collections cleared.');
    } else {
        console.log('ℹ️  Skipping collection flush (SEED_FORCE_CLEAR not set).');
    }

    // Only create a Super Admin if explicitly requested and real credentials supplied
    const CREATE_SUPERADMIN = process.env.SEED_SUPERADMIN === 'true';
    if (CREATE_SUPERADMIN) {
        const suUsername = process.env.SEED_SUPERADMIN_USERNAME;
        const suEmail = process.env.SEED_SUPERADMIN_EMAIL;
        const suPassword = process.env.SEED_SUPERADMIN_PASSWORD;
        const suName = process.env.SEED_SUPERADMIN_NAME || 'System Root';

        if (!suUsername || !suEmail || !suPassword) {
            console.error('❌ SEED_SUPERADMIN_USERNAME, SEED_SUPERADMIN_EMAIL and SEED_SUPERADMIN_PASSWORD are required to create Super Admin.');
        } else {
            console.log('🌱 Creating Super Admin (from provided credentials)...');
            try {
                const userModel = connection.model('User');
                const existing = await userModel.findOne({ $or: [{ username: suUsername }, { email: suEmail }] });
                if (existing) {
                    console.log('⚠️  Super Admin already exists; skipping creation.');
                } else {
                    await userModel.create({
                        name: suName,
                        username: suUsername,
                        email: suEmail,
                        password: await bcrypt.hash(suPassword, 10),
                        role: Role.SUPER_ADMIN,
                        isActive: true,
                        createdAt: new Date(),
                    });
                    console.log('✅ Super Admin Created.');
                }
            } catch (e) {
                console.error('❌ Error creating Super Admin:', e);
            }
        }
    } else {
        console.log('ℹ️  SEED_SUPERADMIN not set; no Super Admin created.');
    }

    await app.close();
    console.log('🏁 Seed Script Finished.');
    process.exit(0);
}

bootstrap();
