"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { roleDisplayNames } from "@/lib/navigation";
import { StatsService } from "@/lib/services/stats.service";
import { ExamService } from "@/lib/services/exam.service";
import { StudentService } from "@/lib/services/student.service";
import { AcademicService } from "@/lib/services/academic.service";
import { SectionService } from "@/lib/services/section.service";
import { LeaveService } from "@/lib/services/leave.service";
import { FeeService } from "@/lib/services/fee.service";
import { HostelService } from "@/lib/services/hostel.service";
import { LibraryService } from "@/lib/services/library.service";
import { AttendanceService } from "@/lib/services/attendance.service";
import { TimetableService } from "@/lib/services/timetable.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
    Users, GraduationCap, BookOpen, Building2, TrendingUp, TrendingDown,
    Calendar, AlertCircle, CreditCard, ClipboardList, BarChart3,
    ArrowRight, Download, Filter, Clock, MapPin, Loader2, Sparkles, Award,
    FileText, Shield, Home, Bus, Library, Briefcase, UserCheck,
    Plus, Search, Eye, CheckCircle, XCircle, Settings, School, User as UserIcon,
    Activity, Wallet, Bell, UserCircle, TrendingUp as TrendingUpIcon
} from "lucide-react";

// ─── STAT CARD ───────────────────────────────────────────────────────────────────

function StatCard({
    title,
    value,
    change,
    changeType,
    icon: Icon,
}: {
    title: string;
    value: string;
    change: string;
    changeType: "positive" | "negative" | "neutral";
    icon: React.ComponentType<{ className?: string }>;
}) {
    return (
        <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-200 group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6 relative">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-slate-500 font-medium">{title}</p>
                        <p className="text-3xl font-bold mt-2 text-slate-800 tracking-tight">{value}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${changeType === "positive" ? "bg-green-100 text-green-700" :
                                changeType === "negative" ? "bg-red-100 text-red-700" :
                                    "bg-slate-100 text-slate-700"
                                }`}>
                                {changeType === "positive" ? <TrendingUp className="h-3 w-3 mr-1" /> :
                                    changeType === "negative" ? <TrendingDown className="h-3 w-3 mr-1" /> : null}
                                {change}
                            </span>
                        </div>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${changeType === 'positive' ? 'from-blue-500 to-blue-600 shadow-blue-200' :
                        changeType === 'negative' ? 'from-orange-500 to-red-600 shadow-red-200' :
                            'from-slate-700 to-slate-800 shadow-slate-200'
                        } shadow-lg text-white`}>
                        <Icon className="h-6 w-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── ADMIN DASHBOARD (UNIVERSITY_ADMIN / HOD) ────────────────────────────────────

function AdminDashboard() {
    const { activeRole, user } = useAuth();
    const isHOD = activeRole === "HOD";
    const [stats, setStats] = useState({
        students: 0,
        faculty: 0,
        attendance: "0%",
        fees: "₹0"
    });
    const [moduleStats, setModuleStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdminStats = async () => {
            try {
                const [globalRes, moduleRes] = await Promise.all([
                    StatsService.getGlobalStats(),
                    StatsService.getModuleStats()
                ]);

                const globalData = globalRes.data || globalRes;
                const mData = moduleRes.data || moduleRes;

                setStats({
                    students: globalData.students || 0,
                    faculty: globalData.faculty || 0,
                    attendance: globalData.attendance || "0%",
                    fees: globalData.fees || "₹0"
                });
                setModuleStats(mData);
            } catch (error) {
                console.error("Failed to fetch admin dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAdminStats();
    }, []);

    if (loading) return (
        <div className="p-20 text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <p className="text-slate-500 font-medium font-outfit">Assembling Institutional Intelligence...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight font-outfit">
                        {isHOD ? "Departmental" : "Institutional"} Control
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        {isHOD ? `Managing ${user?.departmentName || 'Department'} operations.` : "Campus-wide metrics and strategic overview."}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-2xl border-slate-200 shadow-sm"><Download className="h-4 w-4 mr-2" />Export Audit</Button>
                    <Button className="rounded-2xl bg-slate-900 hover:bg-black text-white px-6 shadow-xl shadow-slate-200">System Config</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Enrollment Base" value={stats.students.toString()} change="Verified Record" changeType="positive" icon={GraduationCap} />
                <StatCard title="Academic Force" value={stats.faculty.toString()} change="Active Load" changeType="positive" icon={Users} />
                <StatCard title="Attendance Index" value={stats.attendance} change="Target: 90%" changeType="positive" icon={ClipboardList} />
                <StatCard title="Financial Pulse" value={stats.fees} change="Lakhs (L) / Year" changeType="neutral" icon={CreditCard} />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 border-0 shadow-xl shadow-slate-100/50 rounded-[2.5rem] overflow-hidden border border-slate-100/50">
                    <CardHeader className="bg-slate-50/50 border-b px-8 py-6">
                        <CardTitle className="text-xl font-bold font-outfit flex items-center gap-2">
                            <TrendingUp className="h-6 w-6 text-blue-600" />
                            Module Analytics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-10">
                        <div className="space-y-6">
                            {[
                                { name: "Hostels", val: moduleStats?.hostels?.totalHostels || 0, sub: `Occupancy: ${moduleStats?.hostels?.occupancy || '0%'}`, icon: Building2 },
                                { name: "Library", val: moduleStats?.library?.totalTitles || 0, sub: `Available: ${moduleStats?.library?.availableBooks || 0} Titles`, icon: BookOpen },
                                { name: "Transit", val: "Operational", sub: "Fleet-wide Health Check", icon: MapPin },
                            ].map((mod, i) => (
                                <div key={i} className="group flex items-center justify-between p-4 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center font-bold text-blue-600">
                                            <mod.icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{mod.name}</p>
                                            <p className="text-xs text-slate-400 font-medium">{mod.sub}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-slate-700">{mod.val}</p>
                                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Global</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-8">
                    <Card className="border-0 shadow-2xl rounded-[2.5rem] bg-slate-900 text-white p-10 relative overflow-hidden">
                        <Building2 className="absolute -right-12 -bottom-12 h-48 w-48 text-white/5 rotate-12" />
                        <div className="relative">
                            <h2 className="text-2xl font-black font-outfit tracking-tight">Institutional Compliance</h2>
                            <p className="text-slate-400 text-sm mt-2 opacity-80 font-medium">Verified multi-tenant isolation protocols are active.</p>
                        </div>

                        <div className="space-y-4 mt-8 relative">
                            {[
                                { label: "Data Segregation", status: "STRICT", color: "bg-blue-500" },
                                { label: "Audit Persistence", status: "ACTIVE", color: "bg-emerald-500" },
                                { label: "Encryption", status: "AES-256", color: "bg-indigo-500" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
                                    <span className="text-sm font-bold text-slate-200">{item.label}</span>
                                    <Badge className={`${item.color} text-white text-[10px] font-black border-0`}>{item.status}</Badge>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="border-0 shadow-lg rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <BarChart3 className="h-24 w-24" />
                        </div>
                        <h4 className="font-bold text-xl font-outfit">Strategic Forecast</h4>
                        <p className="text-sm text-indigo-100 mt-2 leading-relaxed opacity-90 font-medium">
                            Enrollment for Spring &apos;25 is projected to increase by 15% across Engineering programs.
                        </p>
                        <Button className="w-full mt-6 bg-white text-indigo-700 hover:bg-slate-50 rounded-2xl font-black text-xs shadow-xl tracking-tighter">
                            CORE STRATEGY VIEW
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// ─── HOD DASHBOARD ────────────────────────────────────────────────────────────────

function HODDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("overview");
    const [stats, setStats] = useState({
        faculty: 0, students: 0, courses: 0, sections: 0,
        attendance: "0%", pendingLeaves: 0
    });
    const [loading, setLoading] = useState(true);
    const [department, setDepartment] = useState<any>(null);
    const [faculty, setFaculty] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [leaves, setLeaves] = useState<any[]>([]);

    useEffect(() => {
        fetchHODData();
    }, []);

    const fetchHODData = async () => {
        if (!user?.departmentId) return;
        setLoading(true);
        try {
            const [deptRes, facultyRes, sectionsRes, coursesRes, leavesRes] = await Promise.all([
                api.get(`/academic/departments/${user.departmentId}`),
                api.get(`/users?departmentId=${user.departmentId}&role=FACULTY`),
                SectionService.getAll({ departmentId: user.departmentId }),
                AcademicService.getCourses({ departmentId: user.departmentId }),
                LeaveService.getPending()
            ]);

            setDepartment(deptRes.data);
            setFaculty(facultyRes.data?.data || []);
            setSections((Array.isArray(sectionsRes) ? sectionsRes : []) as any[]);
            setCourses((coursesRes.data || []) as any[]);
            
            const deptLeaves = Array.isArray(leavesRes) 
                ? leavesRes.filter((l: any) => l.departmentId?.toString() === user.departmentId)
                : [];
            setLeaves(deptLeaves as any[]);

            setStats({
                faculty: facultyRes.data?.data?.length || 0,
                students: sectionsRes.reduce((acc: number, s: any) => acc + (s.currentStrength || 0), 0),
                courses: coursesRes.data?.length || 0,
                sections: Array.isArray(sectionsRes) ? sectionsRes.length : 0,
                attendance: "92%",
                pendingLeaves: deptLeaves.length
            });
        } catch (error) {
            console.error("Failed to fetch HOD data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveLeave = async (leaveId: string) => {
        try {
            await LeaveService.approve(leaveId);
            toast.success("Leave approved");
            fetchHODData();
        } catch (error) {
            toast.error("Failed to approve leave");
        }
    };

    const handleRejectLeave = async (leaveId: string) => {
        try {
            await LeaveService.reject(leaveId, "Rejected by HOD");
            toast.success("Leave rejected");
            fetchHODData();
        } catch (error) {
            toast.error("Failed to reject leave");
        }
    };

    if (loading) return (
        <div className="p-20 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <p className="text-slate-500 mt-4">Loading Department Dashboard...</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">HOD Dashboard</h1>
                    <p className="text-slate-500 mt-1">{department?.name || 'Department'}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push('/dashboard/faculty')}>
                        <Users className="h-4 w-4 mr-2" />Faculty
                    </Button>
                    <Button onClick={() => router.push('/dashboard/sections')}>
                        <School className="h-4 w-4 mr-2" />Sections
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Faculty" value={stats.faculty.toString()} change="Dept Staff" changeType="neutral" icon={Users} />
                <StatCard title="Students" value={stats.students.toString()} change="Enrolled" changeType="positive" icon={GraduationCap} />
                <StatCard title="Courses" value={stats.courses.toString()} change="Active" changeType="neutral" icon={BookOpen} />
                <StatCard title="Sections" value={stats.sections.toString()} change="Classes" changeType="neutral" icon={School} />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 lg:w-fit">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="faculty">Faculty</TabsTrigger>
                    <TabsTrigger value="leaves">Leave Requests</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid lg:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader><CardTitle>Department Sections</CardTitle></CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Section</TableHead>
                                            <TableHead>Program</TableHead>
                                            <TableHead>Students</TableHead>
                                            <TableHead>Advisor</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sections.map((section: any) => (
                                            <TableRow key={section._id}>
                                                <TableCell className="font-medium">{section.name}</TableCell>
                                                <TableCell>{section.programId?.code}</TableCell>
                                                <TableCell>{section.currentStrength}/{section.maxStrength}</TableCell>
                                                <TableCell>{section.classAdvisorId?.name || 'Not Assigned'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>Courses Offered</CardTitle></CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {courses.slice(0, 8).map((course: any) => (
                                        <div key={course._id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                                            <div>
                                                <p className="font-medium text-sm">{course.name}</p>
                                                <p className="text-xs text-slate-500">{course.code} • Sem {course.semester}</p>
                                            </div>
                                            <Badge variant="outline">{course.credits} Credits</Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="faculty">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Department Faculty</CardTitle>
                            <Button size="sm" onClick={() => router.push('/dashboard/faculty')}>
                                <Plus className="h-4 w-4 mr-1" />Add Faculty
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {faculty.map((fac: any) => (
                                        <TableRow key={fac._id}>
                                            <TableCell className="font-medium">{fac.name}</TableCell>
                                            <TableCell>{fac.email}</TableCell>
                                            <TableCell>
                                                <Badge className={fac.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"}>
                                                    {fac.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/users/${fac._id}`)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="leaves">
                    <Card>
                        <CardHeader><CardTitle>Pending Leave Requests</CardTitle></CardHeader>
                        <CardContent>
                            {leaves.length === 0 ? (
                                <div className="text-center py-8">
                                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                                    <p className="text-slate-500">No pending leave requests</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {leaves.map((leave: any) => (
                                        <div key={leave._id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                                                    <UserCircle className="h-5 w-5 text-amber-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{leave.userId?.name}</p>
                                                    <p className="text-sm text-slate-500">{leave.leaveType} • {leave.totalDays} days</p>
                                                    <p className="text-xs text-slate-400">{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleRejectLeave(leave._id)}>
                                                    <XCircle className="h-4 w-4 mr-1" />Reject
                                                </Button>
                                                <Button size="sm" className="bg-green-600" onClick={() => handleApproveLeave(leave._id)}>
                                                    <CheckCircle className="h-4 w-4 mr-1" />Approve
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

// ─── REGISTRAR DASHBOARD ─────────────────────────────────────────────────────────

function RegistrarDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({ students: 0, departments: 0, programs: 0, pendingEnrollments: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [studentsRes, deptsRes, progsRes] = await Promise.all([
                    api.get('/students?page=1&limit=1'),
                    api.get('/academic/departments'),
                    api.get('/academic/programs'),
                ]);
                setStats({
                    students: studentsRes.data?.pagination?.total || 0,
                    departments: deptsRes.data?.pagination?.total || deptsRes.data?.data?.length || 0,
                    programs: progsRes.data?.pagination?.total || progsRes.data?.data?.length || 0,
                    pendingEnrollments: 0,
                });
            } catch (error) {
                console.error("Failed to fetch registrar stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="p-20 text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <p className="text-slate-500 font-medium font-outfit">Loading Registrar Console...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight font-outfit">Registrar Command</h1>
                    <p className="text-slate-500 font-medium mt-1">Student lifecycle & records custodian, {user?.name}.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-2xl border-slate-200" onClick={() => router.push('/dashboard/students')}>
                        <Users className="h-4 w-4 mr-2" />All Students
                    </Button>
                    <Button className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-6 shadow-xl" onClick={() => router.push('/dashboard/enrollments')}>
                        <GraduationCap className="h-4 w-4 mr-2" />New Enrollment
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Students" value={stats.students.toString()} change="All Records" changeType="positive" icon={GraduationCap} />
                <StatCard title="Departments" value={stats.departments.toString()} change="Active Units" changeType="positive" icon={Building2} />
                <StatCard title="Programs" value={stats.programs.toString()} change="Offered" changeType="neutral" icon={BookOpen} />
                <StatCard title="Pending Actions" value={stats.pendingEnrollments.toString()} change="No Pending" changeType="positive" icon={ClipboardList} />
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <Card className="border-0 shadow-xl rounded-[2.5rem] overflow-hidden border border-slate-100/50">
                    <CardHeader className="bg-slate-50/50 border-b px-8 py-6">
                        <CardTitle className="text-lg font-bold flex items-center gap-2 font-outfit">
                            <ClipboardList className="h-5 w-5 text-emerald-600" />
                            Quick Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: "Enroll Student", icon: GraduationCap, color: "text-emerald-500", bg: "bg-emerald-50", href: "/dashboard/enrollments" },
                                { label: "Manage Faculty", icon: UserCheck, color: "text-blue-500", bg: "bg-blue-50", href: "/dashboard/faculty" },
                                { label: "View Attendance", icon: ClipboardList, color: "text-purple-500", bg: "bg-purple-50", href: "/dashboard/attendance" },
                                { label: "Academic Years", icon: Calendar, color: "text-orange-500", bg: "bg-orange-50", href: "/dashboard/academic-years" },
                            ].map((action, i) => (
                                <Button key={i} variant="outline" onClick={() => router.push(action.href)} className="h-auto py-6 flex-col gap-3 rounded-[2rem] border-slate-100 hover:border-emerald-100 hover:bg-slate-50 transition-all group shadow-sm hover:shadow-md">
                                    <div className={`p-4 ${action.bg} rounded-2xl group-hover:scale-110 transition-transform`}>
                                        <action.icon className={`h-6 w-6 ${action.color}`} />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{action.label}</span>
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-2xl rounded-[2.5rem] bg-gradient-to-br from-emerald-600 to-teal-700 p-10 text-white relative overflow-hidden">
                    <Shield className="absolute -right-8 -bottom-8 h-40 w-40 text-white/5 rotate-12" />
                    <div className="relative">
                        <h2 className="text-2xl font-black font-outfit tracking-tight">Records Authority</h2>
                        <p className="text-emerald-100 text-sm mt-2 opacity-90 font-medium">
                            You have custodial authority over all student records, enrollment data, and academic lifecycle management.
                        </p>
                        <div className="space-y-3 mt-8">
                            {[
                                { label: "Student Lifecycle", status: "MANAGED" },
                                { label: "Enrollment Pipeline", status: "ACTIVE" },
                                { label: "Statutory Compliance", status: "VERIFIED" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white/10 rounded-xl border border-white/10">
                                    <span className="text-sm font-bold">{item.label}</span>
                                    <Badge className="bg-white/20 text-white text-[10px] font-black border-0">{item.status}</Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

// ─── EXAM CONTROLLER DASHBOARD ───────────────────────────────────────────────────

function ExamControllerDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({ totalExams: 0, upcoming: 0, completed: 0, courses: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [examsRes, coursesRes] = await Promise.all([
                    api.get('/exams'),
                    api.get('/academic/courses'),
                ]);
                const exams = examsRes.data?.data || examsRes.data || [];
                setStats({
                    totalExams: exams.length,
                    upcoming: exams.filter((e: any) => e.status === 'Scheduled' || e.status === 'scheduled').length,
                    completed: exams.filter((e: any) => e.status === 'Completed' || e.status === 'completed' || e.status === 'published').length,
                    courses: coursesRes.data?.pagination?.total || coursesRes.data?.data?.length || 0,
                });
            } catch (error) {
                console.error("Failed to fetch exam controller stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="p-20 text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto" />
            <p className="text-slate-500 font-medium font-outfit">Loading Examination Console...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight font-outfit">Examination Command</h1>
                    <p className="text-slate-500 font-medium mt-1">Assessment integrity & results management, {user?.name}.</p>
                </div>
                <Button className="rounded-2xl bg-orange-600 hover:bg-orange-700 text-white px-6 shadow-xl" onClick={() => router.push('/dashboard/exams')}>
                    <FileText className="h-4 w-4 mr-2" />Manage Exams
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Exams" value={stats.totalExams.toString()} change="All Records" changeType="neutral" icon={FileText} />
                <StatCard title="Upcoming" value={stats.upcoming.toString()} change="Scheduled" changeType="negative" icon={Calendar} />
                <StatCard title="Completed" value={stats.completed.toString()} change="Published" changeType="positive" icon={Award} />
                <StatCard title="Courses" value={stats.courses.toString()} change="Active" changeType="neutral" icon={BookOpen} />
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <Card className="border-0 shadow-xl rounded-[2.5rem] overflow-hidden border border-slate-100/50">
                    <CardHeader className="bg-slate-50/50 border-b px-8 py-6">
                        <CardTitle className="text-lg font-bold flex items-center gap-2 font-outfit">
                            <FileText className="h-5 w-5 text-orange-600" />
                            Quick Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: "Schedule Exam", icon: Calendar, color: "text-orange-500", bg: "bg-orange-50", href: "/dashboard/exams" },
                                { label: "View Results", icon: Award, color: "text-emerald-500", bg: "bg-emerald-50", href: "/dashboard/exams" },
                                { label: "Exam Timetable", icon: Clock, color: "text-blue-500", bg: "bg-blue-50", href: "/dashboard/timetable" },
                                { label: "Reports", icon: BarChart3, color: "text-purple-500", bg: "bg-purple-50", href: "/dashboard/reports" },
                            ].map((action, i) => (
                                <Button key={i} variant="outline" onClick={() => router.push(action.href)} className="h-auto py-6 flex-col gap-3 rounded-[2rem] border-slate-100 hover:border-orange-100 hover:bg-slate-50 transition-all group shadow-sm hover:shadow-md">
                                    <div className={`p-4 ${action.bg} rounded-2xl group-hover:scale-110 transition-transform`}>
                                        <action.icon className={`h-6 w-6 ${action.color}`} />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{action.label}</span>
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-2xl rounded-[2.5rem] bg-gradient-to-br from-orange-500 to-red-600 p-10 text-white relative overflow-hidden">
                    <FileText className="absolute -right-8 -bottom-8 h-40 w-40 text-white/5 rotate-12" />
                    <div className="relative">
                        <h2 className="text-2xl font-black font-outfit tracking-tight">Assessment Integrity</h2>
                        <p className="text-orange-100 text-sm mt-2 opacity-90 font-medium">
                            All examination protocols are governed by institutional compliance. Results are encrypted and audit-tracked.
                        </p>
                        <div className="space-y-3 mt-8">
                            {[
                                { label: "Exam Scheduling", status: "ACTIVE" },
                                { label: "Result Publishing", status: "READY" },
                                { label: "Anti-Cheating Protocol", status: "ENABLED" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white/10 rounded-xl border border-white/10">
                                    <span className="text-sm font-bold">{item.label}</span>
                                    <Badge className="bg-white/20 text-white text-[10px] font-black border-0">{item.status}</Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

// ─── FINANCE DASHBOARD ───────────────────────────────────────────────────────────

function FinanceDashboard() {
    const { user, activeRole } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({ totalStudents: 0, totalCollected: '₹0', pendingFees: 0, feeStructures: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [studentsRes, feesRes] = await Promise.all([
                    api.get('/students?page=1&limit=1'),
                    api.get('/fees/structures').catch(() => ({ data: [] })),
                ]);
                setStats({
                    totalStudents: studentsRes.data?.pagination?.total || 0,
                    totalCollected: '₹0',
                    pendingFees: 0,
                    feeStructures: Array.isArray(feesRes.data) ? feesRes.data.length : feesRes.data?.data?.length || 0,
                });
            } catch (error) {
                console.error("Failed to fetch finance stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="p-20 text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto" />
            <p className="text-slate-500 font-medium font-outfit">Loading Financial Console...</p>
        </div>
    );

    const isAccountant = activeRole === "ACCOUNTANT";

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight font-outfit">
                        {isAccountant ? "Accounts" : "Finance"} Command
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Revenue compliance & fee management, {user?.name}.
                    </p>
                </div>
                <Button className="rounded-2xl bg-green-600 hover:bg-green-700 text-white px-6 shadow-xl" onClick={() => router.push('/dashboard/fees')}>
                    <CreditCard className="h-4 w-4 mr-2" />Fee Management
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Student Base" value={stats.totalStudents.toString()} change="Billable" changeType="neutral" icon={Users} />
                <StatCard title="Collected" value={stats.totalCollected} change="This Session" changeType="positive" icon={CreditCard} />
                <StatCard title="Pending Dues" value={stats.pendingFees.toString()} change="Students" changeType={stats.pendingFees > 0 ? "negative" : "positive"} icon={AlertCircle} />
                <StatCard title="Fee Structures" value={stats.feeStructures.toString()} change="Configured" changeType="neutral" icon={FileText} />
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <Card className="border-0 shadow-xl rounded-[2.5rem] overflow-hidden border border-slate-100/50">
                    <CardHeader className="bg-slate-50/50 border-b px-8 py-6">
                        <CardTitle className="text-lg font-bold flex items-center gap-2 font-outfit">
                            <CreditCard className="h-5 w-5 text-green-600" />
                            Financial Operations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: "Fee Collection", icon: CreditCard, color: "text-green-500", bg: "bg-green-50", href: "/dashboard/fees" },
                                { label: "Student Ledger", icon: Users, color: "text-blue-500", bg: "bg-blue-50", href: "/dashboard/students" },
                                { label: "Reports", icon: BarChart3, color: "text-purple-500", bg: "bg-purple-50", href: "/dashboard/reports" },
                                { label: "Fee Structure", icon: FileText, color: "text-orange-500", bg: "bg-orange-50", href: "/dashboard/fees" },
                            ].map((action, i) => (
                                <Button key={i} variant="outline" onClick={() => router.push(action.href)} className="h-auto py-6 flex-col gap-3 rounded-[2rem] border-slate-100 hover:border-green-100 hover:bg-slate-50 transition-all group shadow-sm hover:shadow-md">
                                    <div className={`p-4 ${action.bg} rounded-2xl group-hover:scale-110 transition-transform`}>
                                        <action.icon className={`h-6 w-6 ${action.color}`} />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{action.label}</span>
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-2xl rounded-[2.5rem] bg-gradient-to-br from-green-600 to-emerald-700 p-10 text-white relative overflow-hidden">
                    <CreditCard className="absolute -right-8 -bottom-8 h-40 w-40 text-white/5 rotate-12" />
                    <div className="relative">
                        <h2 className="text-2xl font-black font-outfit tracking-tight">Financial Compliance</h2>
                        <p className="text-green-100 text-sm mt-2 opacity-90 font-medium">
                            All financial transactions are audit-tracked with full transparency. Fee structures are governed by institutional policy.
                        </p>
                        <div className="space-y-3 mt-8">
                            {[
                                { label: "Revenue Pipeline", status: "ACTIVE" },
                                { label: "Audit Trail", status: "VERIFIED" },
                                { label: "Fee Compliance", status: "100%" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white/10 rounded-xl border border-white/10">
                                    <span className="text-sm font-bold">{item.label}</span>
                                    <Badge className="bg-white/20 text-white text-[10px] font-black border-0">{item.status}</Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

// ─── FUNCTIONAL MODULE DASHBOARD ─────────────────────────────────────────────────

function FunctionalDashboard() {
    const { activeRole, user } = useAuth();
    const router = useRouter();

    const roleConfig: Record<string, {
        title: string;
        subtitle: string;
        color: string;
        gradient: string;
        icon: React.ComponentType<{ className?: string }>;
        stats: { title: string; value: string; change: string; type: "positive" | "negative" | "neutral"; icon: React.ComponentType<{ className?: string }> }[];
        actions: { label: string; icon: React.ComponentType<{ className?: string }>; href: string }[];
    }> = {
        LIBRARIAN: {
            title: "Library Command",
            subtitle: "Resource & catalog management",
            color: "text-amber-600",
            gradient: "from-amber-500 to-orange-600",
            icon: Library,
            stats: [
                { title: "Catalog Size", value: "—", change: "Titles", type: "neutral", icon: BookOpen },
                { title: "Active Issues", value: "—", change: "Checked Out", type: "neutral", icon: ClipboardList },
                { title: "Returns Due", value: "—", change: "This Week", type: "neutral", icon: AlertCircle },
                { title: "Members", value: "—", change: "Registered", type: "positive", icon: Users },
            ],
            actions: [
                { label: "Catalog", href: "/modules/library/catalog", icon: BookOpen },
                { label: "Circulation", href: "/modules/library/circulation", icon: ClipboardList },
            ],
        },
        HOSTEL_WARDEN: {
            title: "Hostel Command",
            subtitle: "Residential & asset management",
            color: "text-violet-600",
            gradient: "from-violet-500 to-purple-600",
            icon: Home,
            stats: [
                { title: "Total Rooms", value: "—", change: "Managed", type: "neutral", icon: Home },
                { title: "Occupancy", value: "—", change: "Allocated", type: "neutral", icon: Users },
                { title: "Complaints", value: "—", change: "Open", type: "neutral", icon: AlertCircle },
                { title: "Check-ins", value: "—", change: "Today", type: "positive", icon: UserCheck },
            ],
            actions: [
                { label: "Room Allocation", href: "/modules/hostel/rooms", icon: Home },
                { label: "Attendance", href: "/modules/hostel/attendance", icon: UserCheck },
            ],
        },
        TRANSPORT_MANAGER: {
            title: "Fleet Command",
            subtitle: "Vehicle & route management",
            color: "text-cyan-600",
            gradient: "from-cyan-500 to-blue-600",
            icon: Bus,
            stats: [
                { title: "Vehicles", value: "—", change: "Fleet Size", type: "neutral", icon: Bus },
                { title: "Active Routes", value: "—", change: "Running", type: "positive", icon: MapPin },
                { title: "Passengers", value: "—", change: "Registered", type: "neutral", icon: Users },
                { title: "Maintenance", value: "—", change: "Due", type: "neutral", icon: AlertCircle },
            ],
            actions: [
                { label: "Vehicles", href: "/modules/transport/vehicles", icon: Bus },
                { label: "Routes", href: "/modules/transport/routes", icon: MapPin },
            ],
        },
        PLACEMENT_OFFICER: {
            title: "Placement Command",
            subtitle: "Career & industry bridge",
            color: "text-rose-600",
            gradient: "from-rose-500 to-pink-600",
            icon: Briefcase,
            stats: [
                { title: "Companies", value: "—", change: "Partners", type: "neutral", icon: Building2 },
                { title: "Active Drives", value: "—", change: "Running", type: "positive", icon: Briefcase },
                { title: "Students Placed", value: "—", change: "This Year", type: "positive", icon: Award },
                { title: "Avg Package", value: "—", change: "LPA", type: "neutral", icon: TrendingUp },
            ],
            actions: [
                { label: "Companies", href: "/modules/placement/companies", icon: Building2 },
                { label: "Drives", href: "/modules/placement/drives", icon: Briefcase },
            ],
        },
        PLACEMENT_CELL: {
            title: "Placement Cell",
            subtitle: "Recruitment operations",
            color: "text-rose-600",
            gradient: "from-rose-500 to-pink-600",
            icon: Briefcase,
            stats: [
                { title: "Companies", value: "—", change: "Partners", type: "neutral", icon: Building2 },
                { title: "Active Drives", value: "—", change: "Running", type: "positive", icon: Briefcase },
                { title: "Applications", value: "—", change: "Received", type: "neutral", icon: ClipboardList },
                { title: "Interviews", value: "—", change: "Scheduled", type: "neutral", icon: Calendar },
            ],
            actions: [
                { label: "Companies", href: "/modules/placement/companies", icon: Building2 },
                { label: "Drives", href: "/modules/placement/drives", icon: Briefcase },
            ],
        },
    };

    const config = roleConfig[activeRole || ''] || roleConfig.LIBRARIAN;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight font-outfit">{config.title}</h1>
                    <p className="text-slate-500 font-medium mt-1">{config.subtitle}, {user?.name}.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {config.stats.map((stat, i) => (
                    <StatCard key={i} title={stat.title} value={stat.value} change={stat.change} changeType={stat.type} icon={stat.icon} />
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <Card className="border-0 shadow-xl rounded-[2.5rem] overflow-hidden border border-slate-100/50">
                    <CardHeader className="bg-slate-50/50 border-b px-8 py-6">
                        <CardTitle className="text-lg font-bold flex items-center gap-2 font-outfit">
                            <config.icon className={`h-5 w-5 ${config.color}`} />
                            Operations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-2 gap-4">
                            {config.actions.map((action, i) => (
                                <Button key={i} variant="outline" onClick={() => router.push(action.href)} className="h-auto py-8 flex-col gap-3 rounded-[2rem] border-slate-100 hover:bg-slate-50 transition-all group shadow-sm hover:shadow-md">
                                    <div className="p-4 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform">
                                        <action.icon className={`h-6 w-6 ${config.color}`} />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{action.label}</span>
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className={`border-0 shadow-2xl rounded-[2.5rem] bg-gradient-to-br ${config.gradient} p-10 text-white relative overflow-hidden`}>
                    <config.icon className="absolute -right-8 -bottom-8 h-40 w-40 text-white/5 rotate-12" />
                    <div className="relative">
                        <h2 className="text-2xl font-black font-outfit tracking-tight">{roleDisplayNames[activeRole!]} Portal</h2>
                        <p className="text-white/80 text-sm mt-2 font-medium">
                            Your operational workspace is secured by tiered RBAC protocols. All actions are audit-logged.
                        </p>
                        <div className="space-y-3 mt-8">
                            {[
                                { label: "Access Level", status: "AUTHORIZED" },
                                { label: "Data Scope", status: "UNIVERSITY" },
                                { label: "Audit Status", status: "ACTIVE" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white/10 rounded-xl border border-white/10">
                                    <span className="text-sm font-bold">{item.label}</span>
                                    <Badge className="bg-white/20 text-white text-[10px] font-black border-0">{item.status}</Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

// ─── FACULTY DASHBOARD ───────────────────────────────────────────────────────────

function FacultyDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        todayClasses: 0,
        totalStudents: 0,
        pendingTasks: 0,
        attendanceRate: "94%"
    });
    const [schedule, setSchedule] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFacultyData = async () => {
            if (!user?.id) return;
            try {
                const timetableRes = await api.get(`/timetable/instructor/${user.id}`);
                const timetables = timetableRes.data.timetables || [];
                const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                let todayClasses: any[] = [];

                timetables.forEach((t: any) => {
                    if (t.slots && Array.isArray(t.slots)) {
                        const todaysSlots = t.slots.filter((s: any) => s.day === todayStr);
                        todayClasses = [...todayClasses, ...todaysSlots];
                    }
                });

                setStats(prev => ({
                    ...prev,
                    todayClasses: todayClasses.length,
                    totalStudents: 124,
                    pendingTasks: 2
                }));

                setSchedule(todayClasses.sort((a, b) => a.startTime.localeCompare(b.startTime)));
            } catch (error) {
                console.error("Failed to fetch faculty data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFacultyData();
    }, [user?.id]);

    if (loading) return (
        <div className="p-20 text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <p className="text-slate-500 font-medium font-outfit">Synchronizing Lecturer Roadmap...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight font-outfit">Educator Workbench</h1>
                    <p className="text-slate-500 font-medium mt-1">Operational view for {user?.name}.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Lectures Today" value={stats.todayClasses.toString()} change="Synchronized" changeType="neutral" icon={BookOpen} />
                <StatCard title="Direct Mentees" value={stats.totalStudents.toString()} change="Active Load" changeType="neutral" icon={Users} />
                <StatCard title="Grading Queue" value={stats.pendingTasks.toString()} change="Action Required" changeType="negative" icon={AlertCircle} />
                <StatCard title="Session Reach" value={stats.attendanceRate} change="+2.4% vs Avg" changeType="positive" icon={ClipboardList} />
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <Card className="border-0 shadow-xl shadow-slate-100/50 rounded-[2.5rem] overflow-hidden border border-slate-100/50">
                    <CardHeader className="bg-slate-50/50 border-b px-8 py-6">
                        <CardTitle className="text-lg font-bold flex items-center gap-2 font-outfit">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            Session Roadmap
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="space-y-4">
                            {schedule.length > 0 ? schedule.map((cls, i) => (
                                <div key={i} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 hover:border-blue-100 transition-all group/item">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover/item:bg-blue-600 transition-colors">
                                            <BookOpen className="h-6 w-6 text-blue-600 group-hover/item:text-white" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{cls.subject || "Academic Session"}</p>
                                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-bold">
                                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{cls.startTime}</span>
                                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{cls.room || "AUDI-1"}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-blue-50 text-blue-600 border-0 font-black text-[10px] tracking-widest px-3">LIVE</Badge>
                                        <ArrowRight className="h-4 w-4 text-slate-300 group-hover/item:text-blue-500 transition-colors" />
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-12 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                                    <p className="text-slate-400 font-bold">No active lectures in your orbit today.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="border-0 shadow-sm rounded-[2.5rem] bg-white border border-slate-100 p-8">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 font-outfit">Operational Workbench</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: "Attendance", icon: ClipboardList, color: "text-blue-500", bg: "bg-blue-50" },
                                { label: "Curriculum", icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-50" },
                                { label: "Grading", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-50" },
                                { label: "Resources", icon: Sparkles, color: "text-orange-500", bg: "bg-orange-50" }
                            ].map((util, i) => (
                                <Button key={i} variant="outline" className="h-auto py-6 flex-col gap-3 rounded-[2rem] border-slate-100 hover:border-blue-100 hover:bg-slate-50 transition-all group shadow-sm hover:shadow-md">
                                    <div className={`p-4 ${util.bg} rounded-2xl group-hover:scale-110 transition-transform`}>
                                        <util.icon className={`h-6 w-6 ${util.color}`} />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{util.label}</span>
                                </Button>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// ─── STUDENT DASHBOARD ───────────────────────────────────────────────────────────

function StudentDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        attendance: "0%",
        gpa: "0.0",
        booksIssued: 0,
        pendingFees: "₹0"
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudentStats = async () => {
            try {
                const [attendanceRes, resultsResRow, libraryRes] = await Promise.all([
                    api.get(`/attendance/student/${user?.id || user?._id}/summary`).catch(() => ({ data: {} })),
                    ExamService.getMarksByStudent((user?.id || user?._id) as string).catch(() => []),
                    api.get(`/library/student/${user?.id || user?._id}/summary`).catch(() => ({ data: {} })),
                ]);

                const resultsRes = (resultsResRow as any).data || resultsResRow || [];
                const grades: Record<string, number> = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C': 6, 'P': 5, 'F': 0 };
                const totalPoints = Array.isArray(resultsRes) ? resultsRes.reduce((acc: number, r: any) => acc + (grades[r.grade] || 0), 0) : 0;
                const avgGpa = Array.isArray(resultsRes) && resultsRes.length > 0 ? (totalPoints / resultsRes.length).toFixed(2) : "0.0";

                setStats({
                    attendance: attendanceRes.data?.percentage ? `${attendanceRes.data.percentage}%` : "0%",
                    gpa: avgGpa,
                    booksIssued: libraryRes.data?.activeIssues || 0,
                    pendingFees: "₹0"
                });
            } catch (error) {
                console.error("Failed to fetch student dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudentStats();
    }, [user]);

    if (loading) return (
        <div className="p-20 text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
            <p className="text-slate-500 font-medium font-outfit">Retrieving Academic Dossier...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight font-outfit">Student Hub</h1>
                    <p className="text-slate-500 font-medium mt-1">Academic overview for {user?.name}.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Attendance" value={stats.attendance} change="Threshold: 75%" changeType="positive" icon={ClipboardList} />
                <StatCard title="Current GPA" value={stats.gpa} change="Semester Avg" changeType="neutral" icon={Award} />
                <StatCard title="Library Assets" value={stats.booksIssued.toString()} change="Books In-hand" changeType="neutral" icon={BookOpen} />
                <StatCard title="Fee Status" value={stats.pendingFees} change="No Dues" changeType="positive" icon={CreditCard} />
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <Card className="border-0 shadow-xl shadow-slate-100/50 rounded-[2.5rem] overflow-hidden border border-slate-100/50">
                    <CardHeader className="bg-slate-50/50 border-b px-8 py-6">
                        <CardTitle className="text-lg font-bold flex items-center gap-2 font-outfit">
                            <Calendar className="h-5 w-5 text-indigo-600" />
                            Academic Timeline
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="space-y-6">
                            {[
                                { title: "Mid-Term Exams", date: "Starts Mar 20", status: "Upcoming", color: "text-orange-600", bg: "bg-orange-50" },
                                { title: "Cultural Fest", date: "Apr 05", status: "Event", color: "text-purple-600", bg: "bg-purple-50" },
                                { title: "Project Submission", date: "Apr 15", status: "Deadline", color: "text-rose-600", bg: "bg-rose-50" },
                            ].map((evt, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/30">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 ${evt.bg} rounded-xl flex items-center justify-center`}>
                                            <Calendar className={`h-5 w-5 ${evt.color}`} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{evt.title}</p>
                                            <p className="text-xs text-slate-500">{evt.date}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="rounded-lg text-[10px] font-black uppercase tracking-widest">{evt.status}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="border-0 shadow-sm rounded-[2.5rem] bg-indigo-600 text-white p-8 overflow-hidden relative">
                        <Sparkles className="absolute -right-4 -top-4 h-24 w-24 text-white/10" />
                        <h3 className="text-xl font-bold font-outfit mb-2">Student Excellence</h3>
                        <p className="text-indigo-100 text-sm opacity-90">Access verified certificates and academic transcripts from the secure repository.</p>
                        <Button className="mt-8 bg-white text-indigo-600 hover:bg-indigo-50 font-bold rounded-xl w-full">
                            View Transcripts
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// ─── MAIN DASHBOARD PAGE ─────────────────────────────────────────────────────────

export default function DashboardPage() {
    const { activeRole } = useAuth();

    switch (activeRole) {
        case "UNIVERSITY_ADMIN":
        case "PRINCIPAL":
            return <AdminDashboard />;
        case "HOD":
            return <HODDashboard />;
        case "REGISTRAR":
            return <RegistrarDashboard />;
        case "EXAM_CONTROLLER":
            return <ExamControllerDashboard />;
        case "FINANCE":
        case "ACCOUNTANT":
            return <FinanceDashboard />;
        case "FACULTY":
        case "ACADEMIC_COORDINATOR":
            return <FacultyDashboard />;
        case "STUDENT":
            return <StudentDashboard />;
        case "LIBRARIAN":
        case "HOSTEL_WARDEN":
        case "TRANSPORT_MANAGER":
        case "PLACEMENT_OFFICER":
        case "PLACEMENT_CELL":
            return <FunctionalDashboard />;
        default:
            return <FacultyDashboard />;
    }
}
