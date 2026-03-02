import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

// Database connection
const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/university-erp';

async function seed() {
    let connection: mongoose.Connection | null = null;
    try {
        // Connect using mongoose directly
        await mongoose.connect(DATABASE_URL);
        connection = mongoose.connection;
        console.log('Connected to MongoDB');

        // Get native MongoDB client
        const db = connection.getClient().db();
        
        // Clean up all collections
        console.log('\n🗑️  Cleaning up database...');
        await db.collection('users').deleteMany({});
        console.log('✓ Deleted all users');
        
        await db.collection('universities').deleteMany({});
        console.log('✓ Deleted all universities');

        // Create a system university
        const universityResult = await db.collection('universities').insertOne({
            name: 'System University',
            status: 'active',
            onboardingStage: 5,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const universityId = universityResult.insertedId;
        console.log('\n✓ Created system university:', universityId);

        // Hash password for super admin (password: "password123")
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Create only the super admin user
        const superAdmin = {
            username: 'superadmin',
            password: hashedPassword,
            role: 'SUPER_ADMIN',
            email: 'superadmin@system.com',
            phoneNumber: '9999999999',
            universityId,
            isActive: true,
            status: 'active',
            isDeleted: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const userResult = await db.collection('users').insertOne(superAdmin);
        console.log('✓ Created super admin user:', userResult.insertedId);
        
        console.log('\n========================================');
        console.log('✓ DATABASE CLEANED AND RESET');
        console.log('========================================');
        console.log('\nSuper Admin Credentials:');
        console.log('Email: superadmin@system.com');
        console.log('Username: superadmin');
        console.log('Password: password123');
        console.log('Role: SUPER_ADMIN');
        console.log('========================================\n');

        if (connection) {
            await connection.close();
        }
        console.log('✓ Seeding complete!');
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
