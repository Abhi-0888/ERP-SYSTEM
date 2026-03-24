export type Role = 'SUPER_ADMIN' | 'UNIVERSITY_ADMIN' | 'REGISTRAR' | 'ACCOUNTANT' | 'EXAM_CONTROLLER' | 'HOD' | 'FACULTY' | 'STUDENT' | 'PRINCIPAL' | 'LIBRARIAN' | 'HOSTEL_WARDEN' | 'TRANSPORT_MANAGER' | 'PLACEMENT_OFFICER' | 'PLACEMENT_CELL' | 'PARENT' | 'ACADEMIC_COORDINATOR' | 'FINANCE';

export interface User {
    _id: string;
    id?: string;
    username: string;
    name?: string;
    email: string;
    role: Role;
    roles: Role[];
    universityId?: string;
    departmentId?: string;
    universityStatus?: string;
    departmentName?: string;
    universityName?: string;
    isActive: boolean;
    lastLogin?: string | Date;
    onboardingStage?: string;
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
    id?: string;
    name: string;
    code: string;
    universityId: string;
    hodId?: any;
    description?: string;
    isActive: boolean;
}

export interface Program {
    _id: string;
    id?: string;
    name: string;
    code: string;
    type?: string;
    departmentId: any;
    duration: number;
    totalSemesters?: number;
    description?: string;
}

export interface Course {
    _id: string;
    name: string;
    code: string;
    departmentId: any;
    programId: any;
    credits: number;
    semester: number;
    facultyId?: any;
}

export interface AcademicYear {
    _id: string;
    id?: string;
    year: string;
    startDate: string | Date | any;
    endDate: string | Date | any;
    isActive: boolean;
    status?: string;
}

export interface Student {
    _id: string;
    id?: string;
    userId: any;
    firstName: string;
    lastName: string;
    email?: string;
    enrollmentNo: string;
    registrationNumber?: string;
    programId: any;
    departmentId: any;
    academicYearId: any;
    currentSemester: number;
    enrolledCourses: any[];
    status: 'Active' | 'Suspended' | 'Graduated' | 'Withdrawn' | 'ACTIVE' | 'SUSPENDED' | 'GRADUATED' | 'WITHDRAWN';
}

export interface Exam {
    _id: string;
    id?: string;
    name: string;
    courseId: string | Course;
    academicYearId: string | AcademicYear;
    type: 'INTERNAL' | 'EXTERNAL' | 'PRACTICAL';
    totalMarks: number;
    maxMarks?: string | number;
    passingMarks: number;
    date?: string | Date;
    examDate: string | Date;
    startTime: string | Date;
    endTime: string | Date;
    room?: string;
    status: 'Scheduled' | 'In-Progress' | 'Completed' | 'Cancelled' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'published';
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

export interface NavItem {
    title: string;
    href: string;
    icon: string;
    badge?: string | number;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}
