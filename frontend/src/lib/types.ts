// Role and User type definitions for EduCore ERP

export type Role =
    | 'SUPER_ADMIN'
    | 'UNIVERSITY_ADMIN'
    | 'REGISTRAR'
    | 'PRINCIPAL'
    | 'HOD'
    | 'ACADEMIC_COORDINATOR'
    | 'FACULTY'
    | 'STUDENT'
    | 'PARENT'
    | 'EXAM_CONTROLLER'
    | 'FINANCE'
    | 'LIBRARIAN'
    | 'ACCOUNTANT'
    | 'HOSTEL_WARDEN'
    | 'TRANSPORT_MANAGER'
    | 'PLACEMENT_CELL'
    | 'PLACEMENT_OFFICER';

export type User = {
    _id?: string;
    id: string;
    name: string;
    email: string;
    avatar?: string;
    universityId?: string;
    universityName?: string;
    departmentId?: string;
    departmentName?: string;
    roles: Role[];
    universityStatus?: 'setup' | 'active' | 'suspended';
    onboardingStage?: number;
};

export interface LoginResponse {
    access_token: string;
    user: {
        id: string;
        username: string;
        role: Role;
        universityId: string;
        universityStatus?: 'setup' | 'active' | 'suspended';
        onboardingStage?: number;
    };
}

export type AuthState = {
    user: User | null;
    activeRole: Role | null;
    isAuthenticated: boolean;
    isLoading: boolean;
};

export interface NavItem {
    title: string;
    href: string;
    icon: string;
    badge?: number;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

// Entity types
export interface University {
    id: string;
    name: string;
    code: string;
    email: string;
    phone: string;
    address: string;
    status: 'active' | 'inactive';
    plan: 'basic' | 'pro' | 'enterprise';
    createdAt: string;
}

export interface Department {
    id: string;
    name: string;
    code: string;
    hodName: string;
    status: 'active' | 'inactive';
}

export interface Student {
    id: string;
    name: string;
    email: string;
    enrollmentNo: string;
    program: string;
    semester: number;
    batch: string;
    status: 'active' | 'graduated' | 'dropped';
    attendance: number;
    cgpa: number;
}

export interface Course {
    id: string;
    name: string;
    code: string;
    program: string;
    semester: number;
    credits: number;
    faculty: string;
}

export interface Attendance {
    id: string;
    studentId: string;
    studentName: string;
    courseId: string;
    date: string;
    status: 'present' | 'absent' | 'late' | 'leave';
}

export interface Exam {
    id: string;
    name: string;
    course: string;
    type: 'internal' | 'mid' | 'end';
    date: string;
    maxMarks: number;
}

export interface FeeStructure {
    id: string;
    name: string;
    program: string;
    type: 'tuition' | 'hostel' | 'library' | 'transport';
    amount: number;
    dueDate: string;
}

export interface Transaction {
    id: string;
    studentName: string;
    amount: number;
    date: string;
    method: 'cash' | 'card' | 'upi' | 'bank';
    status: 'completed' | 'pending' | 'failed';
    receiptNo: string;
}

export interface Book {
    id: string;
    title: string;
    author: string;
    isbn: string;
    category: string;
    available: number;
    total: number;
}

export interface JobPost {
    id: string;
    company: string;
    title: string;
    package: string;
    eligibility: string;
    lastDate: string;
    status: 'open' | 'closed';
}
