
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AttendanceService } from '../modules/attendance/attendance.service';
import { AcademicService } from '../modules/academic/academic.service';
import { StudentService } from '../modules/student/student.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const attendanceService = app.get(AttendanceService);
    const academicService = app.get(AcademicService);
    const studentService = app.get(StudentService);

    // Let's pretend to be a faculty member from SRMAP
    const facultyUser = {
        userId: 'some-faculty-id',
        username: 'faculty1',
        role: 'FACULTY',
        universityId: '6a03657e9640db65ccb3e385' // SRMAP University ID
    };

    console.log('--- 1. Fetching Courses ---');
    const coursesResult = await academicService.findAllCourses(facultyUser);
    console.log(`Found ${coursesResult.data.length} courses`);
    
    if (coursesResult.data.length > 0) {
        const firstCourse = coursesResult.data[0];
        console.log(`Testing with Course: ${firstCourse.name} (${firstCourse._id})`);
        
        console.log('\n--- 2. Fetching Students for Course ---');
        const students = await studentService.getStudentsByCourse(firstCourse._id.toString(), facultyUser);
        console.log(`Found ${students.length} students enrolled in this course`);
        
        if (students.length > 0) {
            console.log(students.map(s => `${s.enrollmentNo}: ${s.userId ? (s.userId as any).name : 'No Name'}`));
        } else {
            console.log('No students found. Faculty will not be able to mark attendance!');
        }
    } else {
        console.log('No courses found.');
    }

    await app.close();
}

bootstrap();
