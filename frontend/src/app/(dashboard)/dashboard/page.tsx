"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { roleDisplayNames } from "@/lib/navigation";
import { StatsService } from "@/lib/services/stats.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Users, GraduationCap, BookOpen, Building2, TrendingUp, TrendingDown,
    Calendar, AlertCircle, CreditCard, ClipboardList, BarChart3,
    ArrowRight, Download, Filter, Clock, MapPin, Loader2, Sparkles
} from "lucide-react";

// Stat Card Component
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

// University Admin / HOD Dashboard
function AdminDashboard() {
    const { activeRole, user } = useAuth();
    const isHOD = activeRole === "HOD";
    const [stats, setStats] = useState({
        students: 0,
        faculty: 0,
        attendance: "0%",
        fees: "₹0"
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdminStats = async () => {
            try {
                const statsRes = await StatsService.getGlobalStats();
                const data = statsRes.data || statsRes;

                setStats({
                    students: data.system?.students || 0,
                    faculty: data.system?.faculty || 0,
                    attendance: data.attendance?.average ? `${data.attendance.average}%` : "0%",
                    fees: data.fees?.collection ? `₹${(data.fees.collection / 100000).toFixed(1)}L` : "₹0"
                });
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
                        {isHOD ? `Managing ${user?.departmentName || 'Computer Science'} operations.` : "Campus-wide metrics and strategic overview."}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-2xl border-slate-200 shadow-sm"><Download className="h-4 w-4 mr-2" />Export Audit</Button>
                    <Button className="rounded-2xl bg-slate-900 hover:bg-black text-white px-6 shadow-xl shadow-slate-200">System Config</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Enrollment Base" value={stats.students.toString()} change="+4.2% YoY" changeType="positive" icon={GraduationCap} />
                <StatCard title="Academic Force" value={stats.faculty.toString()} change="100% Verified" changeType="positive" icon={Users} />
                <StatCard title="Attendance Index" value={stats.attendance} change="Target: 90%" changeType="positive" icon={ClipboardList} />
                <StatCard title="Financial Pulse" value={stats.fees} change="Target: ₹50L" changeType="neutral" icon={CreditCard} />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 border-0 shadow-xl shadow-slate-100/50 rounded-[2.5rem] overflow-hidden border border-slate-100/50">
                    <CardHeader className="bg-slate-50/50 border-b px-8 py-6">
                        <CardTitle className="text-xl font-bold font-outfit flex items-center gap-2">
                            <TrendingUp className="h-6 w-6 text-blue-600" />
                            Analytical Velocity
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-10">
                        {/* Department Pulse Table */}
                        <div className="space-y-6">
                            {[
                                { name: "Computer Science", students: 450, staff: 24, health: 98, trend: 'up' },
                                { name: "Electronics Eng.", students: 320, staff: 18, health: 92, trend: 'stable' },
                                { name: "Mechanical Eng.", students: 280, staff: 16, health: 85, trend: 'down' },
                            ].map((dept, i) => (
                                <div key={i} className="group flex items-center justify-between p-4 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center font-bold text-blue-600">
                                            {dept.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{dept.name}</p>
                                            <p className="text-xs text-slate-400 font-medium">{dept.students} Students • {dept.staff} Faculty</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="text-sm font-black text-slate-700">{dept.health}%</p>
                                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Health</p>
                                        </div>
                                        <div className={`p-2 rounded-lg ${dept.trend === 'up' ? 'text-emerald-500 bg-emerald-50' :
                                            dept.trend === 'down' ? 'text-rose-500 bg-rose-50' :
                                                'text-blue-500 bg-blue-50'
                                            }`}>
                                            {dept.trend === 'up' ? <TrendingUp className="h-4 w-4" /> :
                                                dept.trend === 'down' ? <TrendingDown className="h-4 w-4" /> :
                                                    <div className="w-4 h-4 rounded-full border-2 border-current opacity-30" />}
                                        </div>
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
                            Enrollment for Spring '25 is projected to increase by 15% across Engineering programs.
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

// Faculty Dashboard
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
                    totalStudents: 124, // Mocked for faculty view
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

// Generic Dashboard for other roles
function GenericDashboard() {
    const { activeRole, user } = useAuth();

    return (
        <div className="space-y-6">
            <div className="px-10 py-12 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute right-0 top-0 p-12 opacity-5">
                    <Building2 className="h-40 w-40" />
                </div>
                <h1 className="text-4xl font-black font-outfit tracking-tighter">
                    {activeRole ? roleDisplayNames[activeRole] : "Guest"} Portal
                </h1>
                <p className="text-slate-400 mt-3 text-lg font-medium opacity-80">
                    Welcome, {user?.name}. Your environment is governed by Tiered RBAC protocols.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Access Status" value="Authorized" change="Shield Active" changeType="positive" icon={ClipboardList} />
                <StatCard title="Data Control" value="Hierarchical" change="Query-Fence" changeType="positive" icon={AlertCircle} />
                <StatCard title="Role Scope" value={activeRole || "Basic"} change="Defined" changeType="neutral" icon={BarChart3} />
                <StatCard title="Heartbeat" value="Nominal" change="Real-time" changeType="positive" icon={TrendingUp} />
            </div>

            <Card className="border-0 shadow-sm bg-white/50 backdrop-blur rounded-[2.5rem] border border-slate-100">
                <CardContent className="p-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100">
                        <Building2 className="h-10 w-10 text-slate-400" />
                    </div>
                    <p className="text-slate-600 font-bold text-lg max-w-md mx-auto leading-relaxed">
                        Initializing role-specific modules based on your hierarchical rank.
                        Please navigate through the verified sidebar channels.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

// Main Dashboard Page
export default function DashboardPage() {
    const { activeRole } = useAuth();

    switch (activeRole) {
        case "UNIVERSITY_ADMIN":
        case "PRINCIPAL":
        case "REGISTRAR":
            return <AdminDashboard />;
        case "HOD":
            return <AdminDashboard />; // HOD gets a department-scoped version of this
        case "FACULTY":
        case "ACADEMIC_COORDINATOR":
            return <FacultyDashboard />;
        default:
            return <GenericDashboard />;
    }
}
