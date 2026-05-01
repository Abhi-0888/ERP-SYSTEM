/**
 * Comprehensive Seed Script for ERP System
 * Creates: Super Admin, University, University Admin, Departments, Programs,
 * Courses, Faculty, HODs, Students, Fee Structures, Academic Year,
 * Hostel, Rooms, Transport Vehicles/Routes, Library Books
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

async function seed() {
    const app = await NestFactory.createApplicationContext(AppModule);

    // Get all models
    const UserModel: Model<any> = app.get(getModelToken('User'));
    const UniversityModel: Model<any> = app.get(getModelToken('University'));
    const DepartmentModel: Model<any> = app.get(getModelToken('Department'));
    const ProgramModel: Model<any> = app.get(getModelToken('Program'));
    const CourseModel: Model<any> = app.get(getModelToken('Course'));
    const AcademicYearModel: Model<any> = app.get(getModelToken('AcademicYear'));
    const StudentProfileModel: Model<any> = app.get(getModelToken('StudentProfile'));
    const FeeStructureModel: Model<any> = app.get(getModelToken('FeeStructure'));
    const TransactionModel: Model<any> = app.get(getModelToken('Transaction'));
    const HostelModel: Model<any> = app.get(getModelToken('Hostel'));
    const RoomModel: Model<any> = app.get(getModelToken('Room'));
    const VehicleModel: Model<any> = app.get(getModelToken('Vehicle'));
    const RouteModel: Model<any> = app.get(getModelToken('Route'));
    const BookModel: Model<any> = app.get(getModelToken('Book'));

    const defaultPassword = await bcrypt.hash('Password@123', 10);

    console.log('🌱 Starting comprehensive seed...\n');

    // ========== 1. SUPER ADMIN ==========
    console.log('1️⃣  Creating Super Admin...');
    let superAdmin = await UserModel.findOne({ username: 'superadmin' });
    if (!superAdmin) {
        superAdmin = await UserModel.create({
            username: 'superadmin',
            name: 'Super Administrator',
            email: 'superadmin@educore.com',
            password: defaultPassword,
            role: 'SUPER_ADMIN',
            isActive: true,
        });
        console.log('   ✅ Super Admin created');
    } else {
        console.log('   ⏭️  Super Admin already exists');
    }

    // ========== 2. UNIVERSITY ==========
    console.log('2️⃣  Creating University...');
    let university = await UniversityModel.findOne({ code: 'SRMAP' });
    if (!university) {
        university = await UniversityModel.create({
            name: 'SRM University, AP',
            code: 'SRMAP',
            address: 'Neerukonda, Mangalagiri, Guntur, Andhra Pradesh 522240',
            contactEmail: 'admin@srmap.edu.in',
            contactPhone: '+91-0863-2347000',
            website: 'https://srmap.edu.in',
            status: 'active',
            subscriptionPlan: 'enterprise',
            onboardingStage: 6,
            enabledModules: [
                'academic', 'student', 'fee', 'attendance', 'timetable',
                'exam', 'library', 'hostel', 'transport', 'placement', 'support'
            ],
            settings: {
                theme: 'default',
                timezone: 'Asia/Kolkata',
                currency: 'INR',
            },
        });
        console.log('   ✅ University created');
    } else {
        console.log('   ⏭️  University already exists');
    }
    const universityId = university._id;

    // ========== 3. ACADEMIC YEAR ==========
    console.log('3️⃣  Creating Academic Year...');
    let academicYear = await AcademicYearModel.findOne({ year: '2024-2025', universityId });
    if (!academicYear) {
        academicYear = await AcademicYearModel.create({
            year: '2024-2025',
            startDate: new Date('2024-07-01'),
            endDate: new Date('2025-06-30'),
            isActive: true,
            universityId,
        });
        console.log('   ✅ Academic Year 2024-2025 created');
    } else {
        console.log('   ⏭️  Academic Year already exists');
    }

    // ========== 4. UNIVERSITY ADMIN ==========
    console.log('4️⃣  Creating University Admin...');
    let uniAdmin = await UserModel.findOne({ username: 'admin_srmap' });
    if (!uniAdmin) {
        uniAdmin = await UserModel.create({
            username: 'admin_srmap',
            name: 'University Administrator',
            email: 'admin@srmap.edu.in',
            password: defaultPassword,
            role: 'UNIVERSITY_ADMIN',
            universityId,
            isActive: true,
        });
        console.log('   ✅ University Admin created');
    } else {
        console.log('   ⏭️  University Admin already exists');
    }

    // ========== 5. DEPARTMENTS ==========
    console.log('5️⃣  Creating Departments...');
    const departmentsData = [
        { name: 'Computer Science & Engineering', code: 'CSE', description: 'Department of Computer Science and Engineering' },
        { name: 'Electronics & Communication', code: 'ECE', description: 'Department of Electronics and Communication Engineering' },
        { name: 'Mechanical Engineering', code: 'ME', description: 'Department of Mechanical Engineering' },
        { name: 'Civil Engineering', code: 'CE', description: 'Department of Civil Engineering' },
    ];

    const departments: any = {};
    for (const dept of departmentsData) {
        let d = await DepartmentModel.findOne({ code: dept.code, universityId });
        if (!d) {
            d = await DepartmentModel.create({ ...dept, universityId });
            console.log(`   ✅ Department ${dept.code} created`);
        } else {
            console.log(`   ⏭️  Department ${dept.code} already exists`);
        }
        departments[dept.code] = d;
    }

    // ========== 6. KEY STAFF USERS ==========
    console.log('6️⃣  Creating Key Staff...');
    const staffData = [
        { username: 'registrar', name: 'Dr. Rajesh Kumar', email: 'registrar@srmap.edu.in', role: 'REGISTRAR' },
        { username: 'finance_head', name: 'Mr. Suresh Patel', email: 'finance@srmap.edu.in', role: 'FINANCE' },
        { username: 'accountant', name: 'Ms. Priya Sharma', email: 'accountant@srmap.edu.in', role: 'ACCOUNTANT' },
        { username: 'exam_controller', name: 'Dr. Anil Gupta', email: 'exam@srmap.edu.in', role: 'EXAM_CONTROLLER' },
        { username: 'librarian', name: 'Mr. Vikram Singh', email: 'library@srmap.edu.in', role: 'LIBRARIAN' },
        { username: 'hostel_warden', name: 'Dr. Meena Reddy', email: 'hostel@srmap.edu.in', role: 'HOSTEL_WARDEN' },
        { username: 'transport_mgr', name: 'Mr. Ravi Teja', email: 'transport@srmap.edu.in', role: 'TRANSPORT_MANAGER' },
        { username: 'placement_officer', name: 'Dr. Srinivas Rao', email: 'placement@srmap.edu.in', role: 'PLACEMENT_OFFICER' },
    ];

    const staffUsers: Record<string, any> = {};
    for (const s of staffData) {
        let u = await UserModel.findOne({ username: s.username });
        if (!u) {
            u = await UserModel.create({ ...s, password: defaultPassword, universityId, isActive: true });
            console.log(`   ✅ ${s.role} (${s.username}) created`);
        } else {
            console.log(`   ⏭️  ${s.role} (${s.username}) already exists`);
        }
        staffUsers[s.username] = u;
    }

    // ========== 7. HODs & FACULTY ==========
    console.log('7️⃣  Creating HODs & Faculty...');
    const facultyData = [
        // HODs
        { username: 'hod_cse', name: 'Dr. Venkatesh Raman', email: 'hod.cse@srmap.edu.in', role: 'HOD', departmentId: departments['CSE']._id },
        { username: 'hod_ece', name: 'Dr. Lakshmi Narayana', email: 'hod.ece@srmap.edu.in', role: 'HOD', departmentId: departments['ECE']._id },
        { username: 'hod_me', name: 'Dr. Karthik Reddy', email: 'hod.me@srmap.edu.in', role: 'HOD', departmentId: departments['ME']._id },
        { username: 'hod_ce', name: 'Dr. Ramya Devi', email: 'hod.ce@srmap.edu.in', role: 'HOD', departmentId: departments['CE']._id },
        // Faculty - CSE
        { username: 'faculty_cse1', name: 'Prof. Arjun Mehta', email: 'arjun.m@srmap.edu.in', role: 'FACULTY', departmentId: departments['CSE']._id },
        { username: 'faculty_cse2', name: 'Prof. Deepika Joshi', email: 'deepika.j@srmap.edu.in', role: 'FACULTY', departmentId: departments['CSE']._id },
        { username: 'faculty_cse3', name: 'Prof. Sanjay Verma', email: 'sanjay.v@srmap.edu.in', role: 'FACULTY', departmentId: departments['CSE']._id },
        // Faculty - ECE
        { username: 'faculty_ece1', name: 'Prof. Ramesh Babu', email: 'ramesh.b@srmap.edu.in', role: 'FACULTY', departmentId: departments['ECE']._id },
        { username: 'faculty_ece2', name: 'Prof. Anitha Kumari', email: 'anitha.k@srmap.edu.in', role: 'FACULTY', departmentId: departments['ECE']._id },
    ];

    const facultyUsers: Record<string, any> = {};
    for (const f of facultyData) {
        let u = await UserModel.findOne({ username: f.username });
        if (!u) {
            u = await UserModel.create({ ...f, password: defaultPassword, universityId, isActive: true });
            console.log(`   ✅ ${f.role} (${f.username}) created`);
        } else {
            console.log(`   ⏭️  ${f.role} (${f.username}) already exists`);
        }
        facultyUsers[f.username] = u;
    }

    // Set HODs on departments
    for (const [code, dept] of Object.entries(departments) as [string, any][]) {
        const hodKey = `hod_${code.toLowerCase()}`;
        if (facultyUsers[hodKey]) {
            await DepartmentModel.findByIdAndUpdate(dept._id, { hodId: facultyUsers[hodKey]._id });
        }
    }
    console.log('   ✅ HODs assigned to departments');

    // ========== 8. PROGRAMS ==========
    console.log('8️⃣  Creating Programs...');
    const programsData = [
        { name: 'B.Tech Computer Science & Engineering', code: 'BTCSE', departmentId: departments['CSE']._id, duration: 4, level: 'UG', totalSemesters: 8 },
        { name: 'M.Tech Computer Science', code: 'MTCSE', departmentId: departments['CSE']._id, duration: 2, level: 'PG', totalSemesters: 4 },
        { name: 'B.Tech Electronics & Communication', code: 'BTECE', departmentId: departments['ECE']._id, duration: 4, level: 'UG', totalSemesters: 8 },
        { name: 'B.Tech Mechanical Engineering', code: 'BTME', departmentId: departments['ME']._id, duration: 4, level: 'UG', totalSemesters: 8 },
        { name: 'B.Tech Civil Engineering', code: 'BTCE', departmentId: departments['CE']._id, duration: 4, level: 'UG', totalSemesters: 8 },
    ];

    const programs: Record<string, any> = {};
    for (const p of programsData) {
        let prog = await ProgramModel.findOne({ code: p.code });
        if (!prog) {
            prog = await ProgramModel.create(p);
            console.log(`   ✅ Program ${p.code} created`);
        } else {
            console.log(`   ⏭️  Program ${p.code} already exists`);
        }
        programs[p.code] = prog;
    }

    // ========== 9. COURSES ==========
    console.log('9️⃣  Creating Courses...');
    const coursesData = [
        // CSE Sem 1
        { name: 'Introduction to Programming', code: 'CS101', credits: 4, semester: 1, programId: programs['BTCSE']._id, departmentId: departments['CSE']._id, type: 'Theory' },
        { name: 'Data Structures', code: 'CS102', credits: 4, semester: 1, programId: programs['BTCSE']._id, departmentId: departments['CSE']._id, type: 'Theory' },
        { name: 'Mathematics I', code: 'MA101', credits: 3, semester: 1, programId: programs['BTCSE']._id, departmentId: departments['CSE']._id, type: 'Theory' },
        { name: 'Programming Lab', code: 'CS103', credits: 2, semester: 1, programId: programs['BTCSE']._id, departmentId: departments['CSE']._id, type: 'Practical' },
        // CSE Sem 2
        { name: 'Object Oriented Programming', code: 'CS201', credits: 4, semester: 2, programId: programs['BTCSE']._id, departmentId: departments['CSE']._id, type: 'Theory' },
        { name: 'Algorithms', code: 'CS202', credits: 4, semester: 2, programId: programs['BTCSE']._id, departmentId: departments['CSE']._id, type: 'Theory' },
        { name: 'Database Systems', code: 'CS203', credits: 3, semester: 2, programId: programs['BTCSE']._id, departmentId: departments['CSE']._id, type: 'Theory' },
        // CSE Sem 3
        { name: 'Operating Systems', code: 'CS301', credits: 4, semester: 3, programId: programs['BTCSE']._id, departmentId: departments['CSE']._id, type: 'Theory' },
        { name: 'Computer Networks', code: 'CS302', credits: 3, semester: 3, programId: programs['BTCSE']._id, departmentId: departments['CSE']._id, type: 'Theory' },
        { name: 'Software Engineering', code: 'CS303', credits: 3, semester: 3, programId: programs['BTCSE']._id, departmentId: departments['CSE']._id, type: 'Theory' },
        // ECE Sem 1
        { name: 'Basic Electronics', code: 'EC101', credits: 4, semester: 1, programId: programs['BTECE']._id, departmentId: departments['ECE']._id, type: 'Theory' },
        { name: 'Circuit Theory', code: 'EC102', credits: 3, semester: 1, programId: programs['BTECE']._id, departmentId: departments['ECE']._id, type: 'Theory' },
        { name: 'Electronics Lab', code: 'EC103', credits: 2, semester: 1, programId: programs['BTECE']._id, departmentId: departments['ECE']._id, type: 'Practical' },
    ];

    const courses: Record<string, any> = {};
    for (const c of coursesData) {
        let course = await CourseModel.findOne({ code: c.code, semester: c.semester });
        if (!course) {
            course = await CourseModel.create(c);
            console.log(`   ✅ Course ${c.code} (Sem ${c.semester}) created`);
        } else {
            console.log(`   ⏭️  Course ${c.code} already exists`);
        }
        courses[c.code] = course;
    }

    // Assign faculty to courses
    const facultyAssignments = [
        { courseCode: 'CS101', faculty: 'faculty_cse1' },
        { courseCode: 'CS102', faculty: 'faculty_cse2' },
        { courseCode: 'CS103', faculty: 'faculty_cse1' },
        { courseCode: 'CS201', faculty: 'faculty_cse3' },
        { courseCode: 'CS202', faculty: 'faculty_cse2' },
        { courseCode: 'CS203', faculty: 'faculty_cse3' },
        { courseCode: 'CS301', faculty: 'faculty_cse1' },
        { courseCode: 'CS302', faculty: 'faculty_cse2' },
        { courseCode: 'CS303', faculty: 'faculty_cse3' },
        { courseCode: 'EC101', faculty: 'faculty_ece1' },
        { courseCode: 'EC102', faculty: 'faculty_ece2' },
        { courseCode: 'EC103', faculty: 'faculty_ece1' },
    ];

    for (const a of facultyAssignments) {
        if (courses[a.courseCode] && facultyUsers[a.faculty]) {
            await CourseModel.findByIdAndUpdate(courses[a.courseCode]._id, {
                facultyId: facultyUsers[a.faculty]._id,
            });
        }
    }
    console.log('   ✅ Faculty assigned to courses');

    // ========== 10. STUDENTS ==========
    console.log('🔟 Creating Students...');
    const studentsData = [
        { username: 'student_cse1', name: 'Rahul Sharma', email: 'rahul.s@srmap.edu.in', enrollmentNo: 'AP21110011001', program: 'BTCSE', dept: 'CSE', semester: 3, batch: '2021' },
        { username: 'student_cse2', name: 'Priya Patel', email: 'priya.p@srmap.edu.in', enrollmentNo: 'AP21110011002', program: 'BTCSE', dept: 'CSE', semester: 3, batch: '2021' },
        { username: 'student_cse3', name: 'Arun Kumar', email: 'arun.k@srmap.edu.in', enrollmentNo: 'AP21110011003', program: 'BTCSE', dept: 'CSE', semester: 3, batch: '2021' },
        { username: 'student_cse4', name: 'Sneha Reddy', email: 'sneha.r@srmap.edu.in', enrollmentNo: 'AP22110011001', program: 'BTCSE', dept: 'CSE', semester: 1, batch: '2022' },
        { username: 'student_cse5', name: 'Vikash Gupta', email: 'vikash.g@srmap.edu.in', enrollmentNo: 'AP22110011002', program: 'BTCSE', dept: 'CSE', semester: 1, batch: '2022' },
        { username: 'student_ece1', name: 'Anjali Verma', email: 'anjali.v@srmap.edu.in', enrollmentNo: 'AP21120011001', program: 'BTECE', dept: 'ECE', semester: 3, batch: '2021' },
        { username: 'student_ece2', name: 'Kiran Naidu', email: 'kiran.n@srmap.edu.in', enrollmentNo: 'AP21120011002', program: 'BTECE', dept: 'ECE', semester: 3, batch: '2021' },
        { username: 'student_me1', name: 'Rajesh Iyer', email: 'rajesh.i@srmap.edu.in', enrollmentNo: 'AP21130011001', program: 'BTME', dept: 'ME', semester: 3, batch: '2021' },
    ];

    const studentProfiles: Record<string, any> = {};
    for (const s of studentsData) {
        let user = await UserModel.findOne({ username: s.username });
        if (!user) {
            user = await UserModel.create({
                username: s.username,
                name: s.name,
                email: s.email,
                password: defaultPassword,
                role: 'STUDENT',
                universityId,
                departmentId: departments[s.dept]._id,
                isActive: true,
            });

            // Determine enrolled courses based on semester
            const enrolledCourseIds: any[] = [];
            const programCourses = coursesData.filter(
                c => c.programId?.toString() === programs[s.program]._id.toString() && c.semester <= s.semester
            );
            for (const pc of programCourses) {
                if (courses[pc.code]) enrolledCourseIds.push(courses[pc.code]._id);
            }

            const profile = await StudentProfileModel.create({
                userId: user._id,
                enrollmentNo: s.enrollmentNo,
                programId: programs[s.program]._id,
                departmentId: departments[s.dept]._id,
                academicYearId: academicYear._id,
                currentSemester: s.semester,
                batch: s.batch,
                dateOfBirth: new Date('2003-05-15'),
                gender: ['Rahul', 'Arun', 'Vikash', 'Kiran', 'Rajesh'].some(n => s.name.includes(n)) ? 'Male' : 'Female',
                address: 'Andhra Pradesh, India',
                guardianDetails: { name: `Parent of ${s.name}`, phone: '+91-9876543210' },
                status: 'Active',
                admissionDate: new Date(`${s.batch}-07-15`),
                enrolledCourses: enrolledCourseIds,
            });
            studentProfiles[s.username] = profile;
            console.log(`   ✅ Student ${s.username} (${s.enrollmentNo}) created`);
        } else {
            const profile = await StudentProfileModel.findOne({ userId: user._id });
            studentProfiles[s.username] = profile;
            console.log(`   ⏭️  Student ${s.username} already exists`);
        }
    }

    // ========== 11. FEE STRUCTURES ==========
    console.log('1️⃣1️⃣ Creating Fee Structures...');
    const feesData = [
        { name: 'Tuition Fee - B.Tech', type: 'TUITION', amount: 250000, programId: programs['BTCSE']._id, description: 'Annual tuition fee for B.Tech program' },
        { name: 'Hostel Fee', type: 'HOSTEL', amount: 80000, description: 'Annual hostel accommodation fee' },
        { name: 'Library Fee', type: 'LIBRARY', amount: 5000, description: 'Annual library access fee' },
        { name: 'Transport Fee', type: 'TRANSPORT', amount: 40000, description: 'Annual transport facility fee' },
        { name: 'Examination Fee', type: 'EXAMINATION', amount: 15000, description: 'Per semester examination fee' },
        { name: 'Activity Fee', type: 'ACTIVITY', amount: 10000, description: 'Annual student activity fee' },
    ];

    const feeStructures: any[] = [];
    for (const f of feesData) {
        let fee = await FeeStructureModel.findOne({ name: f.name, universityId });
        if (!fee) {
            fee = await FeeStructureModel.create({
                ...f,
                universityId,
                academicYearId: academicYear._id,
                dueDate: new Date('2025-01-31'),
                status: 'PENDING',
            });
            console.log(`   ✅ Fee: ${f.name} (₹${f.amount}) created`);
        } else {
            console.log(`   ⏭️  Fee: ${f.name} already exists`);
        }
        feeStructures.push(fee);
    }

    // Assign fees to students and create some payment transactions
    console.log('   📝 Assigning fees to students...');
    const tuitionFee = feeStructures.find(f => f.type === 'TUITION');
    const hostelFee = feeStructures.find(f => f.type === 'HOSTEL');

    for (const [key, profile] of Object.entries(studentProfiles) as [string, any][]) {
        if (!profile) continue;
        // Assign tuition fee
        if (tuitionFee) {
            const existing = await TransactionModel.findOne({ studentId: profile._id, feeId: tuitionFee._id });
            if (!existing) {
                const isPaid = ['student_cse1', 'student_cse2'].includes(key);
                const isPartial = ['student_cse3', 'student_ece1'].includes(key);
                await TransactionModel.create({
                    studentId: profile._id,
                    feeId: tuitionFee._id,
                    amount: tuitionFee.amount,
                    amountPaid: isPaid ? tuitionFee.amount : (isPartial ? 125000 : 0),
                    status: isPaid ? 'FULLY_PAID' : (isPartial ? 'PARTIALLY_PAID' : 'PENDING'),
                    paymentMethod: isPaid || isPartial ? 'BANK_TRANSFER' : undefined,
                    paymentDate: isPaid || isPartial ? new Date() : undefined,
                    transactionId: isPaid || isPartial ? `TXN-TUI-${Date.now()}-${Math.random().toString(36).substr(2, 6)}` : undefined,
                    dueDate: new Date('2025-01-31'),
                    universityId,
                    remarks: `Tuition fee for ${key}`,
                });
            }
        }
        // Assign hostel fee to some students
        if (hostelFee && ['student_cse1', 'student_cse3', 'student_ece1', 'student_me1'].includes(key)) {
            const existing = await TransactionModel.findOne({ studentId: profile._id, feeId: hostelFee._id });
            if (!existing) {
                const isPaid = key === 'student_cse1';
                await TransactionModel.create({
                    studentId: profile._id,
                    feeId: hostelFee._id,
                    amount: hostelFee.amount,
                    amountPaid: isPaid ? hostelFee.amount : 0,
                    status: isPaid ? 'FULLY_PAID' : 'PENDING',
                    paymentMethod: isPaid ? 'ONLINE' : undefined,
                    paymentDate: isPaid ? new Date() : undefined,
                    transactionId: isPaid ? `TXN-HOS-${Date.now()}` : undefined,
                    dueDate: new Date('2025-01-31'),
                    universityId,
                    remarks: `Hostel fee for ${key}`,
                });
            }
        }
    }
    console.log('   ✅ Fee assignments & sample payments created');

    // ========== 12. HOSTEL & ROOMS ==========
    console.log('1️⃣2️⃣ Creating Hostels & Rooms...');
    const hostelsData = [
        { name: 'Godavari Boys Hostel', type: 'Boys', totalRooms: 100 },
        { name: 'Krishna Girls Hostel', type: 'Girls', totalRooms: 80 },
    ];

    const hostels: any[] = [];
    for (const h of hostelsData) {
        let hostel = await HostelModel.findOne({ name: h.name, universityId });
        if (!hostel) {
            hostel = await HostelModel.create({
                ...h,
                universityId,
                wardenId: staffUsers['hostel_warden']?._id,
                isActive: true,
                address: 'SRM University Campus, Neerukonda',
            });
            console.log(`   ✅ Hostel: ${h.name} created`);

            // Create rooms for this hostel
            const roomCount = Math.min(h.totalRooms, 10); // Create 10 sample rooms
            for (let i = 1; i <= roomCount; i++) {
                const floor = Math.ceil(i / 5);
                await RoomModel.create({
                    hostelId: hostel._id,
                    roomNumber: `${floor}0${i > 5 ? i - 5 : i}`,
                    floor,
                    capacity: 2,
                    type: 'Double',
                    occupants: [],
                    isActive: true,
                });
            }
            console.log(`   ✅ ${roomCount} rooms created for ${h.name}`);
        } else {
            console.log(`   ⏭️  Hostel: ${h.name} already exists`);
        }
        hostels.push(hostel);
    }

    // Allocate some students to rooms
    const boysHostel = hostels[0];
    if (boysHostel) {
        const rooms = await RoomModel.find({ hostelId: boysHostel._id, isActive: true }).limit(3);
        const maleStudents = ['student_cse1', 'student_cse3', 'student_me1'];
        for (let i = 0; i < Math.min(rooms.length, maleStudents.length); i++) {
            const profile = studentProfiles[maleStudents[i]];
            if (profile) {
                const alreadyAllocated = await RoomModel.findOne({ occupants: profile._id });
                if (!alreadyAllocated) {
                    await RoomModel.findByIdAndUpdate(rooms[i]._id, { $addToSet: { occupants: profile._id } });
                }
            }
        }
        console.log('   ✅ Male students allocated to hostel rooms');
    }

    const girlsHostel = hostels[1];
    if (girlsHostel) {
        const rooms = await RoomModel.find({ hostelId: girlsHostel._id, isActive: true }).limit(2);
        const femaleStudents = ['student_cse2', 'student_ece1'];
        for (let i = 0; i < Math.min(rooms.length, femaleStudents.length); i++) {
            const profile = studentProfiles[femaleStudents[i]];
            if (profile) {
                const alreadyAllocated = await RoomModel.findOne({ occupants: profile._id });
                if (!alreadyAllocated) {
                    await RoomModel.findByIdAndUpdate(rooms[i]._id, { $addToSet: { occupants: profile._id } });
                }
            }
        }
        console.log('   ✅ Female students allocated to hostel rooms');
    }

    // ========== 13. TRANSPORT ==========
    console.log('1️⃣3️⃣ Creating Transport Vehicles & Routes...');
    let vehicle1 = await VehicleModel.findOne({ registrationNumber: 'AP-07-AB-1234' });
    if (!vehicle1) {
        vehicle1 = await VehicleModel.create({
            registrationNumber: 'AP-07-AB-1234',
            type: 'Bus',
            capacity: 50,
            universityId,
            status: 'active',
            isActive: true,
        });
        console.log('   ✅ Vehicle Bus-1 created');
    }

    let vehicle2 = await VehicleModel.findOne({ registrationNumber: 'AP-07-CD-5678' });
    if (!vehicle2) {
        vehicle2 = await VehicleModel.create({
            registrationNumber: 'AP-07-CD-5678',
            type: 'Bus',
            capacity: 40,
            universityId,
            status: 'active',
            isActive: true,
        });
        console.log('   ✅ Vehicle Bus-2 created');
    }

    let route1 = await RouteModel.findOne({ name: 'Vijayawada - Campus' });
    if (!route1) {
        route1 = await RouteModel.create({
            name: 'Vijayawada - Campus',
            startPoint: 'Vijayawada Bus Stand',
            endPoint: 'SRM University Campus',
            stops: ['Vijayawada Bus Stand', 'Benz Circle', 'Mangalagiri', 'Neerukonda', 'SRM Campus'],
            vehicleId: vehicle1._id,
            universityId,
            isActive: true,
        });
        console.log('   ✅ Route: Vijayawada - Campus created');
    }

    let route2 = await RouteModel.findOne({ name: 'Guntur - Campus' });
    if (!route2) {
        route2 = await RouteModel.create({
            name: 'Guntur - Campus',
            startPoint: 'Guntur Railway Station',
            endPoint: 'SRM University Campus',
            stops: ['Guntur Station', 'Naaz Center', 'Mangalagiri Cross', 'SRM Campus'],
            vehicleId: vehicle2._id,
            universityId,
            isActive: true,
        });
        console.log('   ✅ Route: Guntur - Campus created');
    }

    // ========== 14. LIBRARY BOOKS ==========
    console.log('1️⃣4️⃣ Creating Library Books...');
    const booksData = [
        { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', isbn: '978-0262033848', category: 'Computer Science', totalCopies: 15, publisher: 'MIT Press', publishYear: 2009 },
        { title: 'Operating System Concepts', author: 'Abraham Silberschatz', isbn: '978-1118063330', category: 'Computer Science', totalCopies: 12, publisher: 'Wiley', publishYear: 2012 },
        { title: 'Computer Networking', author: 'James Kurose', isbn: '978-0133594140', category: 'Computer Science', totalCopies: 10, publisher: 'Pearson', publishYear: 2016 },
        { title: 'Database System Concepts', author: 'Abraham Silberschatz', isbn: '978-0073523323', category: 'Computer Science', totalCopies: 8, publisher: 'McGraw-Hill', publishYear: 2010 },
        { title: 'Electronic Devices and Circuits', author: 'Salivahanan', isbn: '978-0070145573', category: 'Electronics', totalCopies: 10, publisher: 'McGraw-Hill', publishYear: 2008 },
        { title: 'Signals and Systems', author: 'Alan V. Oppenheim', isbn: '978-0138147570', category: 'Electronics', totalCopies: 8, publisher: 'Pearson', publishYear: 1996 },
        { title: 'Engineering Mechanics', author: 'R.S. Khurmi', isbn: '978-8121925242', category: 'Mechanical', totalCopies: 10, publisher: 'S. Chand', publishYear: 2005 },
        { title: 'Strength of Materials', author: 'R.K. Rajput', isbn: '978-8121935128', category: 'Mechanical', totalCopies: 8, publisher: 'S. Chand', publishYear: 2010 },
    ];

    for (const b of booksData) {
        let book = await BookModel.findOne({ isbn: b.isbn });
        if (!book) {
            await BookModel.create({
                ...b,
                availableCopies: b.totalCopies,
                universityId,
                isActive: true,
            });
            console.log(`   ✅ Book: "${b.title}" added`);
        } else {
            console.log(`   ⏭️  Book: "${b.title}" already exists`);
        }
    }

    // ========== SUMMARY ==========
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SEED COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\n📋 Login Credentials (all use password: Password@123):');
    console.log('─'.repeat(50));
    console.log('  Super Admin:      superadmin');
    console.log('  University Admin: admin_srmap');
    console.log('  Registrar:        registrar');
    console.log('  Finance:          finance_head');
    console.log('  Accountant:       accountant');
    console.log('  Exam Controller:  exam_controller');
    console.log('  Librarian:        librarian');
    console.log('  Hostel Warden:    hostel_warden');
    console.log('  Transport Mgr:    transport_mgr');
    console.log('  Placement:        placement_officer');
    console.log('  HOD CSE:          hod_cse');
    console.log('  HOD ECE:          hod_ece');
    console.log('  Faculty CSE:      faculty_cse1, faculty_cse2, faculty_cse3');
    console.log('  Faculty ECE:      faculty_ece1, faculty_ece2');
    console.log('  Students CSE:     student_cse1 .. student_cse5');
    console.log('  Students ECE:     student_ece1, student_ece2');
    console.log('  Student ME:       student_me1');
    console.log('─'.repeat(50));
    console.log('\n📊 Data Summary:');
    console.log(`  University:    1 (SRM University, AP)`);
    console.log(`  Departments:   ${Object.keys(departments).length}`);
    console.log(`  Programs:      ${Object.keys(programs).length}`);
    console.log(`  Courses:       ${Object.keys(courses).length}`);
    console.log(`  Staff:         ${Object.keys(staffUsers).length}`);
    console.log(`  Faculty/HODs:  ${Object.keys(facultyUsers).length}`);
    console.log(`  Students:      ${Object.keys(studentProfiles).length}`);
    console.log(`  Fee Structures: ${feeStructures.length}`);
    console.log(`  Hostels:       ${hostels.length}`);
    console.log(`  Library Books: ${booksData.length}`);

    await app.close();
    process.exit(0);
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
