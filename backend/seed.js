const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');
const { getModelToken } = require('@nestjs/mongoose');

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    
    try {
        console.log('=== EDUCORE ERP SEED ===\n');
        
        const uniModel = app.get(getModelToken('University'));
        const deptModel = app.get(getModelToken('Department'));
        const progModel = app.get(getModelToken('Program'));
        const courseModel = app.get(getModelToken('Course'));
        const yearModel = app.get(getModelToken('AcademicYear'));
        const sectionModel = app.get(getModelToken('Section'));
        const userModel = app.get(getModelToken('User'));
        const studentModel = app.get(getModelToken('StudentProfile'));
        const leaveModel = app.get(getModelToken('Leave'));
        
        console.log('Clearing collections...');
        await Promise.all([
            uniModel.deleteMany({}),
            deptModel.deleteMany({}),
            progModel.deleteMany({}),
            courseModel.deleteMany({}),
            yearModel.deleteMany({}),
            sectionModel.deleteMany({}),
            userModel.deleteMany({}),
            studentModel.deleteMany({}),
            leaveModel.deleteMany({})
        ]);
        
        const uni = await uniModel.create({
            name: 'SRM University AP', code: 'SRMAP', address: 'Neerukonda, Guntur',
            status: 'active', contactEmail: 'info@srmap.edu.in', contactPhone: '+91-863-2345678'
        });
        console.log('University created');
        
        const depts = await deptModel.insertMany([
            { name: 'Computer Science & Engineering', code: 'CSE', universityId: uni._id, isActive: true },
            { name: 'Electronics & Communication', code: 'ECE', universityId: uni._id, isActive: true },
            { name: 'Mechanical Engineering', code: 'MECH', universityId: uni._id, isActive: true },
            { name: 'Civil Engineering', code: 'CIVIL', universityId: uni._id, isActive: true },
            { name: 'Business Administration', code: 'MBA', universityId: uni._id, isActive: true }
        ]);
        console.log('5 Departments created');
        
        const year = await yearModel.create({
            year: '2024-25', universityId: uni._id,
            startDate: new Date(2024, 6, 1), endDate: new Date(2025, 4, 31),
            isCurrent: true, isActive: true
        });
        
        const progs = await progModel.insertMany([
            { name: 'B.Tech CSE', code: 'BTCSE', departmentId: depts[0]._id, universityId: uni._id, totalSemesters: 8, duration: 4, level: 'UG', type: 'BACHELOR', isActive: true },
            { name: 'B.Tech ECE', code: 'BTECE', departmentId: depts[1]._id, universityId: uni._id, totalSemesters: 8, duration: 4, level: 'UG', type: 'BACHELOR', isActive: true },
            { name: 'B.Tech MECH', code: 'BTMECH', departmentId: depts[2]._id, universityId: uni._id, totalSemesters: 8, duration: 4, level: 'UG', type: 'BACHELOR', isActive: true },
        ]);
        console.log('3 Programs created');
        
        await courseModel.insertMany([
            { name: 'Programming in C', code: 'CS101', departmentId: depts[0]._id, programId: progs[0]._id, universityId: uni._id, semester: 1, credits: 4, type: 'Theory', isActive: true },
            { name: 'Data Structures', code: 'CS102', departmentId: depts[0]._id, programId: progs[0]._id, universityId: uni._id, semester: 2, credits: 4, type: 'Theory', isActive: true },
            { name: 'Electronic Devices', code: 'EC101', departmentId: depts[1]._id, programId: progs[1]._id, universityId: uni._id, semester: 1, credits: 4, type: 'Theory', isActive: true },
        ]);
        console.log('3 Courses created');
        
        const sections = await sectionModel.insertMany([
            { name: 'A', departmentId: depts[0]._id, programId: progs[0]._id, academicYearId: year._id, universityId: uni._id, semester: 1, batch: '2026', maxStrength: 60, currentStrength: 0, isActive: true },
            { name: 'B', departmentId: depts[0]._id, programId: progs[0]._id, academicYearId: year._id, universityId: uni._id, semester: 1, batch: '2026', maxStrength: 60, currentStrength: 0, isActive: true },
        ]);
        console.log('2 Sections created');
        
        const bcrypt = require('bcrypt');
        const password = await bcrypt.hash('Password@123', 10);
        
        const faculty = await userModel.insertMany([
            { username: 'superadmin', name: 'Super Admin', password, role: 'SUPER_ADMIN', isActive: true, email: 'superadmin@educore.com' },
            { username: 'admin_srmap', name: 'University Admin', password, role: 'UNIVERSITY_ADMIN', universityId: uni._id, isActive: true, email: 'admin@srmap.edu.in' },
            { username: 'principal', name: 'Principal', password, role: 'PRINCIPAL', universityId: uni._id, isActive: true, email: 'principal@srmap.edu.in' },
            { username: 'registrar', name: 'Registrar', password, role: 'REGISTRAR', universityId: uni._id, isActive: true, email: 'registrar@srmap.edu.in' },
            { username: 'hod_cse', name: 'HOD CSE', password, role: 'HOD', universityId: uni._id, departmentId: depts[0]._id, isActive: true, email: 'hod.cse@srmap.edu.in' },
            { username: 'hod_ece', name: 'HOD ECE', password, role: 'HOD', universityId: uni._id, departmentId: depts[1]._id, isActive: true, email: 'hod.ece@srmap.edu.in' },
            { username: 'faculty_cse1', name: 'Prof. CSE One', password, role: 'FACULTY', universityId: uni._id, departmentId: depts[0]._id, isActive: true, email: 'faculty1.cse@srmap.edu.in' },
            { username: 'faculty_cse2', name: 'Prof. CSE Two', password, role: 'FACULTY', universityId: uni._id, departmentId: depts[0]._id, isActive: true, email: 'faculty2.cse@srmap.edu.in' },
            { username: 'finance_head', name: 'Finance Head', password, role: 'FINANCE', universityId: uni._id, isActive: true, email: 'finance@srmap.edu.in' },
            { username: 'accountant', name: 'Accountant', password, role: 'ACCOUNTANT', universityId: uni._id, isActive: true, email: 'accountant@srmap.edu.in' },
            { username: 'librarian', name: 'Librarian', password, role: 'LIBRARIAN', universityId: uni._id, isActive: true, email: 'librarian@srmap.edu.in' },
            { username: 'hostel_warden', name: 'Hostel Warden', password, role: 'HOSTEL_WARDEN', universityId: uni._id, isActive: true, email: 'warden@srmap.edu.in' },
            { username: 'exam_controller', name: 'Exam Controller', password, role: 'EXAM_CONTROLLER', universityId: uni._id, isActive: true, email: 'exam@srmap.edu.in' },
            { username: 'placement', name: 'Placement Officer', password, role: 'PLACEMENT_OFFICER', universityId: uni._id, isActive: true, email: 'placement@srmap.edu.in' },
        ]);
        console.log('14 Faculty/Staff created');
        
        const students = [];
        for (let i = 1; i <= 10; i++) {
            const user = await userModel.create({
                username: `student${i.toString().padStart(3, '0')}`,
                name: `Student ${i}`, password, role: 'STUDENT',
                universityId: uni._id, isActive: true, email: `student${i}@srmap.edu.in`
            });
            
            const profile = await studentModel.create({
                userId: user._id, enrollmentNo: `AP2026${i.toString().padStart(3, '0')}`,
                programId: progs[0]._id, departmentId: depts[0]._id,
                currentSemester: 1, batch: '2026', academicYearId: year._id,
                dateOfBirth: new Date(2003, 5, 15), gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
                status: 'Active', admissionDate: new Date()
            });
            
            user.profileId = profile._id;
            await user.save();
            students.push({ user, profile });
        }
        
        for (let i = 0; i < students.length; i++) {
            const section = sections[i % 2];
            section.students.push(students[i].profile._id);
            section.currentStrength++;
            await section.save();
            students[i].profile.sectionId = section._id;
            await students[i].profile.save();
        }
        console.log('10 Students created');
        
        await leaveModel.insertMany([
            { userId: faculty[6]._id, leaveType: 'CASUAL', startDate: new Date(2024, 11, 20), endDate: new Date(2024, 11, 22), totalDays: 3, reason: 'Family function', status: 'PENDING', universityId: uni._id, departmentId: depts[0]._id, isActive: true },
            { userId: faculty[7]._id, leaveType: 'MEDICAL', startDate: new Date(2024, 11, 25), endDate: new Date(2024, 11, 26), totalDays: 2, reason: 'Doctor appointment', status: 'PENDING', universityId: uni._id, departmentId: depts[0]._id, isActive: true },
        ]);
        console.log('2 Leave requests created');
        
        console.log('\n=== SEED COMPLETED ===');
        console.log('Demo Accounts (Password: Password@123):');
        console.log('  superadmin, admin_srmap, principal, registrar');
        console.log('  hod_cse, hod_ece, faculty_cse1, faculty_cse2');
        console.log('  finance_head, accountant, librarian, hostel_warden');
        console.log('  exam_controller, placement, student001-student010');
        
    } catch (error) {
        console.error('Seed failed:', error);
    } finally {
        await app.close();
        process.exit(0);
    }
}

bootstrap();
