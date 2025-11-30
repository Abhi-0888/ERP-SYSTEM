import { User, BookOpen, GraduationCap, CreditCard, Calendar, MessageSquare, BarChart, Bell, Search, Settings, LogOut, Menu, X, CheckCircle2, AlertCircle, Clock, TrendingUp, Users, FileText } from "lucide-react";

// Types
export type UserRole = "admin" | "teacher" | "student" | "parent";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Student {
  id: string;
  admissionNo: string;
  name: string;
  class: string;
  section: string;
  guardian: string;
  contact: string;
  status: "active" | "inactive";
  avatar?: string;
}

export interface AttendanceRecord {
  date: string;
  present: number;
  absent: number;
  leave: number;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
  type: "Tuition" | "Transport" | "Library" | "Exam";
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  status: "available" | "issued" | "reserved";
  category: string;
}

export interface TransportRoute {
  id: string;
  routeNo: string;
  driver: string;
  vehicleNo: string;
  capacity: number;
  students: number;
  status: "on-time" | "delayed" | "maintenance";
}

export interface Exam {
  id: string;
  name: string;
  class: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "ongoing" | "completed";
}

// Mock Data
export const currentUser: UserProfile = {
  id: "u1",
  name: "Alex Morgan",
  email: "alex.morgan@educore.edu",
  role: "admin",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
};

export const stats = [
  { label: "Total Students", value: "1,248", change: "+12%", icon: Users, trend: "up" },
  { label: "Avg. Attendance", value: "94.2%", change: "+0.8%", icon: CheckCircle2, trend: "up" },
  { label: "Fees Collected", value: "$42,500", change: "+24%", icon: CreditCard, trend: "up" },
  { label: "Pending Tasks", value: "12", change: "-2", icon: Clock, trend: "down" },
];

export const recentStudents: Student[] = [
  { id: "s1", admissionNo: "A-2024-001", name: "Emma Thompson", class: "10", section: "A", guardian: "Robert Thompson", contact: "+1 234 567 890", status: "active" },
  { id: "s2", admissionNo: "A-2024-002", name: "James Wilson", class: "10", section: "B", guardian: "Sarah Wilson", contact: "+1 234 567 891", status: "active" },
  { id: "s3", admissionNo: "A-2024-003", name: "Olivia Davis", class: "9", section: "A", guardian: "Michael Davis", contact: "+1 234 567 892", status: "active" },
  { id: "s4", admissionNo: "A-2024-004", name: "Lucas Martinez", class: "11", section: "Science", guardian: "Maria Martinez", contact: "+1 234 567 893", status: "inactive" },
  { id: "s5", admissionNo: "A-2024-005", name: "Sophia Anderson", class: "8", section: "C", guardian: "David Anderson", contact: "+1 234 567 894", status: "active" },
];

export const recentFees: FeeRecord[] = [
  { id: "f1", studentId: "s1", studentName: "Emma Thompson", amount: 1200, dueDate: "2024-04-15", status: "paid", type: "Tuition" },
  { id: "f2", studentId: "s2", studentName: "James Wilson", amount: 450, dueDate: "2024-04-20", status: "pending", type: "Transport" },
  { id: "f3", studentId: "s4", studentName: "Lucas Martinez", amount: 2000, dueDate: "2024-03-30", status: "overdue", type: "Tuition" },
  { id: "f4", studentId: "s3", studentName: "Olivia Davis", amount: 150, dueDate: "2024-04-18", status: "paid", type: "Library" },
];

export const attendanceData = [
  { name: "Mon", present: 95, absent: 3, leave: 2 },
  { name: "Tue", present: 92, absent: 5, leave: 3 },
  { name: "Wed", present: 96, absent: 2, leave: 2 },
  { name: "Thu", present: 91, absent: 6, leave: 3 },
  { name: "Fri", present: 94, absent: 4, leave: 2 },
];

export const notices = [
  { id: 1, title: "Annual Sports Day", date: "2024-04-25", content: "All students are requested to assemble in the main ground by 8:00 AM.", category: "Event", priority: "high" },
  { id: 2, title: "Parent-Teacher Meeting", date: "2024-04-28", content: "PTM for Classes 1-10 will be held this Saturday.", category: "Meeting", priority: "medium" },
  { id: 3, title: "Science Fair Registration", date: "2024-05-01", content: "Last date to submit projects is May 5th.", category: "Academic", priority: "low" },
];

export const timetable = [
  { time: "08:00 - 09:00", mon: "Math (10-A)", tue: "Physics (10-A)", wed: "Math (10-A)", thu: "Physics (10-A)", fri: "Math (10-A)" },
  { time: "09:00 - 10:00", mon: "Eng (10-A)", tue: "Chem (10-A)", wed: "Eng (10-A)", thu: "Chem (10-A)", fri: "Eng (10-A)" },
  { time: "10:00 - 10:30", mon: "Break", tue: "Break", wed: "Break", thu: "Break", fri: "Break" },
  { time: "10:30 - 11:30", mon: "Hist (10-A)", tue: "Bio (10-A)", wed: "Geog (10-A)", thu: "Bio (10-A)", fri: "Hist (10-A)" },
  { time: "11:30 - 12:30", mon: "Comp (10-A)", tue: "Math (10-A)", wed: "Phy Ed (10-A)", thu: "Comp (10-A)", fri: "Art (10-A)" },
];

export const books: Book[] = [
  { id: "b1", title: "A Brief History of Time", author: "Stephen Hawking", isbn: "978-0553380163", status: "available", category: "Science" },
  { id: "b2", title: "To Kill a Mockingbird", author: "Harper Lee", isbn: "978-0061120084", status: "issued", category: "Literature" },
  { id: "b3", title: "Clean Code", author: "Robert C. Martin", isbn: "978-0132350884", status: "available", category: "Technology" },
  { id: "b4", title: "1984", author: "George Orwell", isbn: "978-0451524935", status: "reserved", category: "Literature" },
];

export const transportRoutes: TransportRoute[] = [
  { id: "r1", routeNo: "R-01", driver: "John Smith", vehicleNo: "KA-01-AB-1234", capacity: 40, students: 35, status: "on-time" },
  { id: "r2", routeNo: "R-02", driver: "Mike Johnson", vehicleNo: "KA-01-AB-5678", capacity: 40, students: 38, status: "delayed" },
  { id: "r3", routeNo: "R-03", driver: "Sarah Williams", vehicleNo: "KA-01-AB-9012", capacity: 30, students: 25, status: "on-time" },
];

export const exams: Exam[] = [
  { id: "e1", name: "Mid-Term Examinations", class: "Class 10", startDate: "2024-05-10", endDate: "2024-05-20", status: "upcoming" },
  { id: "e2", name: "Unit Test 1", class: "Class 9", startDate: "2024-04-05", endDate: "2024-04-10", status: "completed" },
];
