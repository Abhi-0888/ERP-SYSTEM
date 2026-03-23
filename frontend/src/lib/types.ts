export type Role = 'SUPER_ADMIN' | 'UNIVERSITY_ADMIN' | 'REGISTRAR' | 'ACCOUNTANT' | 'EXAM_CONTROLLER' | 'HOD' | 'FACULTY' | 'STUDENT';

export interface User {
    _id: string;
    username: string;
    email: string;
    role: Role;
    roles: Role[];
    universityId?: string;
    departmentId?: string;
    isActive: boolean;
}

export interface ApiResponse<T> {
    data: T;
    pagination?: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
    message?: string;
}

export interface Department {
    _id: string;
    name: string;
    code: string;
    universityId: string;
    hodId?: string | User;
    description?: string;
    isActive: boolean;
}

export interface Program {
    _id: string;
    name: string;
    code: string;
    departmentId: string | Department;
    duration: number;
    description?: string;
}

export interface Course {
    _id: string;
    name: string;
    code: string;
    departmentId: string | Department;
    programId: string | Program;
    credits: number;
    semester: number;
    facultyId?: string | User;
}

export interface AcademicYear {
    _id: string;
    year: string;
    startDate: string | Date;
    endDate: string | Date;
    isActive: boolean;
}

export interface Student {
    _id: string;
    userId: string | User;
    firstName: string;
    lastName: string;
    enrollmentNo: string;
    programId: string | Program;
    departmentId: string | Department;
    academicYearId: string | AcademicYear;
    currentSemester: number;
    enrolledCourses: (string | Course)[];
    status: 'Active' | 'Suspended' | 'Graduated' | 'Withdrawn';
}

export interface Exam {
    _id: string;
    name: string;
    courseId: string | Course;
    academicYearId: string | AcademicYear;
    type: 'INTERNAL' | 'EXTERNAL' | 'PRACTICAL';
    totalMarks: number;
    passingMarks: number;
    examDate: string | Date;
    startTime: string | Date;
    endTime: string | Date;
    status: 'Scheduled' | 'In-Progress' | 'Completed' | 'Cancelled';
}

export interface Timetable {
    _id: string;
    programId: string | Program;
    academicYearId: string | AcademicYear;
    semester: number;
    status: 'DRAFT' | 'PUBLISHED';
    slots: {
        _id?: string;
        day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
        startTime: string;
        endTime: string;
        courseId: string | Course;
        facultyId: string | User;
        room: string;
    }[];
}

export interface MarkSheet {
    _id?: string;
    studentId: string | Student;
    examId: string | Exam;
    marksObtained: number;
    grade: string;
    comments?: string;
    recordedBy: string | User;
}

export interface AttendanceRecord {
    _id: string;
    studentId: string | Student;
    courseId: string | Course;
    date: string | Date;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE';
    remarks?: string;
}

export interface AttendanceSummary {
    studentId: string;
    totalClasses: number;
    presentClasses: number;
    absentClasses: number;
    attendancePercentage: number;
    records: AttendanceRecord[];
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    activeRole: Role | null;
}
