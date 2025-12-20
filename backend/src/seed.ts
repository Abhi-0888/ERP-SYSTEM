import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { University } from './modules/university/university.schema';
import { User } from './modules/user/user.schema';
import { Department } from './modules/academic/department.schema';
import { Program } from './modules/academic/program.schema';
import { AcademicYear } from './modules/academic/academic-year.schema';
import { StudentProfile } from './modules/student/student-profile.schema';
import * as bcrypt from 'bcrypt';
import { Role } from './common/enums/role.enum';
import * as fs from 'fs';
import * as path from 'path';

async function seed() {
    const app = await NestFactory.createApplicationContext(AppModule);

    const universityModel = app.get<Model<University>>(getModelToken(University.name));
    const userModel = app.get<Model<User>>(getModelToken(User.name));
    const departmentModel = app.get<Model<Department>>(getModelToken(Department.name));
    const programModel = app.get<Model<Program>>(getModelToken(Program.name));
    const academicYearModel = app.get<Model<AcademicYear>>(getModelToken(AcademicYear.name));
    const studentProfileModel = app.get<Model<StudentProfile>>(getModelToken(StudentProfile.name));

    console.log('🧹 Flushing database...');
    await Promise.all([
        universityModel.deleteMany({}),
        userModel.deleteMany({}),
        departmentModel.deleteMany({}),
        programModel.deleteMany({}),
        academicYearModel.deleteMany({}),
        studentProfileModel.deleteMany({}),
    ]);
    console.log('✅ Database flushed.');

    const hashedPassword = await bcrypt.hash('password123', 10);
    const credentials: string[] = [];

    // 1. Create Super Admin
    const superAdmin = await userModel.create({
        username: 'superadmin',
        email: 'superadmin@eduncore.com',
        password: hashedPassword,
        role: Role.SUPER_ADMIN,
        firstName: 'System',
        lastName: 'Admin'
    });
    credentials.push(`ROLE: SUPER_ADMIN\nEMAIL: superadmin@eduncore.com\nPASSWORD: password123\n-------------------`);

    // 2. Setup University 1: GIT
    const git_univ = await universityModel.create({
        name: 'Global Institute of Technology',
        code: 'GIT',
        address: 'Tech Park, Bangalore',
        contactEmail: 'admin@git.edu',
        contactPhone: '+91-9876543210'
    });

    const git_dept = await departmentModel.create({
        name: 'Computer Science',
        code: 'CS',
        universityId: git_univ._id
    });

    const git_prog = await programModel.create({
        name: 'B.Tech CS',
        code: 'BTECH-CS',
        departmentId: git_dept._id,
        duration: 4,
        level: 'UG'
    });

    const git_ay = await academicYearModel.create({
        year: '2024-2025',
        universityId: git_univ._id,
        startDate: new Date('2024-08-01'),
        endDate: new Date('2025-05-31'),
        isCurrent: true
    });

    // Uni Admin for GIT
    await userModel.create({
        username: 'git_admin',
        email: 'admin@git.edu',
        password: hashedPassword,
        role: Role.UNIVERSITY_ADMIN,
        universityId: git_univ._id
    });
    credentials.push(`UNIVERSITY: GIT\nROLE: UNIVERSITY_ADMIN\nEMAIL: admin@git.edu\nPASSWORD: password123\n-------------------`);

    // Faculty for GIT
    const git_faculty = await userModel.create({
        username: 'git_faculty_pro',
        email: 'faculty_pro@git.edu',
        password: hashedPassword,
        role: Role.FACULTY,
        universityId: git_univ._id,
        firstName: 'Alan',
        lastName: 'Turing'
    });
    credentials.push(`UNIVERSITY: GIT\nROLE: FACULTY\nEMAIL: faculty_pro@git.edu\nPASSWORD: password123\n-------------------`);

    // Students for GIT
    const git_students = [
        { name: 'Alice', email: 'alice@git.edu', enr: 'GIT2024001' },
        { name: 'Bob', email: 'bob@git.edu', enr: 'GIT2024002' },
        { name: 'Charlie', email: 'charlie@git.edu', enr: 'GIT2024003' }
    ];

    for (const s of git_students) {
        const u = await userModel.create({
            username: s.name.toLowerCase(),
            email: s.email,
            password: hashedPassword,
            role: Role.STUDENT,
            universityId: git_univ._id
        });
        await studentProfileModel.create({
            userId: u._id,
            enrollmentNo: s.enr,
            programId: git_prog._id,
            departmentId: git_dept._id,
            academicYearId: git_ay._id,
            status: 'Active',
            batch: '2024-2028',
            currentSemester: 1
        });
        credentials.push(`UNIVERSITY: GIT\nROLE: STUDENT\nEMAIL: ${s.email}\nPASSWORD: password123\n-------------------`);
    }

    // 3. Setup University 2: AMA
    const ama_univ = await universityModel.create({
        name: 'Apex Management Academy',
        code: 'AMA',
        address: 'Knowledge City, Hyderabad',
        contactEmail: 'info@ama.edu',
        contactPhone: '+91-9123456789'
    });

    const ama_dept = await departmentModel.create({
        name: 'Business Administration',
        code: 'BA',
        universityId: ama_univ._id
    });

    const ama_prog = await programModel.create({
        name: 'MBA',
        code: 'MBA-GEN',
        departmentId: ama_dept._id,
        duration: 2,
        level: 'PG'
    });

    const ama_ay = await academicYearModel.create({
        year: '2024-2025',
        universityId: ama_univ._id,
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
        isCurrent: true
    });

    // Faculty for AMA
    await userModel.create({
        username: 'ama_faculty_lead',
        email: 'lead@ama.edu',
        password: hashedPassword,
        role: Role.FACULTY,
        universityId: ama_univ._id,
        firstName: 'Peter',
        lastName: 'Drucker'
    });
    credentials.push(`UNIVERSITY: AMA\nROLE: FACULTY\nEMAIL: lead@ama.edu\nPASSWORD: password123\n-------------------`);

    // Students for AMA
    const ama_students = [
        { name: 'David', email: 'david@ama.edu', enr: 'AMA2024001' },
        { name: 'Eve', email: 'eve@ama.edu', enr: 'AMA2024002' }
    ];

    for (const s of ama_students) {
        const u = await userModel.create({
            username: s.name.toLowerCase(),
            email: s.email,
            password: hashedPassword,
            role: Role.STUDENT,
            universityId: ama_univ._id
        });
        await studentProfileModel.create({
            userId: u._id,
            enrollmentNo: s.enr,
            programId: ama_prog._id,
            departmentId: ama_dept._id,
            academicYearId: ama_ay._id,
            status: 'Active',
            batch: '2024-2026',
            currentSemester: 1
        });
        credentials.push(`UNIVERSITY: AMA\nROLE: STUDENT\nEMAIL: ${s.email}\nPASSWORD: password123\n-------------------`);
    }

    // 4. Generate credentials.txt
    const credsPath = path.join(process.cwd(), 'credentials.txt');
    fs.writeFileSync(credsPath, `EduCore ERP - Generated Test Credentials\nGenerated on: ${new Date().toLocaleString()}\n\n${credentials.join('\n\n')}`);
    console.log(`✅ Saved credentials to: ${credsPath}`);

    console.log('\n🎉 Real seed data created successfully!');
    await app.close();
}

seed().catch((error) => {
    console.error('Error seeding data:', error);
    process.exit(1);
});
