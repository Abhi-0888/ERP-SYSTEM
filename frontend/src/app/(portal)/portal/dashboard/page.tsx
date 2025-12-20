"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    GraduationCap, BookOpen, Calendar, CreditCard, ClipboardList,
    TrendingUp, Clock, MapPin, Briefcase, Sparkles
} from "lucide-react";

// Stat Card Component (Scoped to Portal style)
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
        <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 group overflow-hidden relative rounded-2xl">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500 font-medium">{title}</p>
                        <p className="text-2xl font-bold mt-1 text-slate-800 tracking-tight">{value}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${changeType === "positive" ? "bg-emerald-50 text-emerald-600" :
                                changeType === "negative" ? "bg-rose-50 text-rose-600" :
                                    "bg-slate-50 text-slate-600"
                                }`}>
                                {change}
                            </span>
                        </div>
                    </div>
                    <div className={`p-3 rounded-xl ${changeType === 'positive' ? 'bg-indigo-50 text-indigo-600' :
                        changeType === 'negative' ? 'bg-rose-50 text-rose-600' :
                            'bg-slate-50 text-slate-600'
                        }`}>
                        <Icon className="h-5 w-5" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function StudentPortalDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        attendance: "88%",
        cgpa: "8.6",
        pendingFees: "₹0",
        books: 1
    });
    const [schedule, setSchedule] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudentData = async () => {
            if (!user?.id) return;
            try {
                const timetableRes = await api.get(`/timetable/student/${user.id}`);
                const timetables = timetableRes.data.timetables || [];
                const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                let todayClasses: any[] = [];

                timetables.forEach((t: any) => {
                    if (t.slots && Array.isArray(t.slots)) {
                        const todaysSlots = t.slots.filter((s: any) => s.day === todayStr);
                        todayClasses = [...todayClasses, ...todaysSlots];
                    }
                });
                setSchedule(todayClasses.sort((a, b) => a.startTime.localeCompare(b.startTime)));

                // Mocking fee status for portal view
                setStats(prev => ({
                    ...prev,
                    attendance: "88%",
                    cgpa: "8.6",
                    books: 2
                }));
            } catch (error) {
                console.error("Failed to fetch student data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudentData();
    }, [user?.id]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-medium animate-pulse">Syncing your learning path...</p>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-100">
                <Sparkles className="absolute -right-8 -top-8 h-40 w-40 text-white/10 rotate-12" />
                <div className="relative z-10">
                    <h1 className="text-3xl font-black font-outfit tracking-tight">Active Learning, {user?.name?.split(' ')[0]}</h1>
                    <p className="text-indigo-100 mt-2 font-medium opacity-90 max-w-lg">
                        You have 3 classes today. Semester 4 is progressing well with an 8.6 CGPA.
                    </p>
                    <div className="flex gap-3 mt-6">
                        <Button className="bg-white text-indigo-600 hover:bg-slate-50 rounded-xl font-bold px-6">View Grades</Button>
                        <Button variant="outline" className="border-white/20 hover:bg-white/10 text-white rounded-xl">Timetable</Button>
                    </div>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Attendance" value={stats.attendance} change="Safe (>75%)" changeType="positive" icon={ClipboardList} />
                <StatCard title="Merit Rank" value={stats.cgpa} change="Top 10% in Dept" changeType="positive" icon={GraduationCap} />
                <StatCard title="Fee Status" value={stats.pendingFees} change="Due in 12 days" changeType="neutral" icon={CreditCard} />
                <StatCard title="Library" value={stats.books.toString()} change="Items Issued" changeType="neutral" icon={BookOpen} />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Class Schedule */}
                <Card className="lg:col-span-2 border-0 shadow-sm rounded-3xl overflow-hidden border border-slate-100 pb-4">
                    <CardHeader className="bg-slate-50/50 border-b px-8 py-6">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Clock className="h-5 w-5 text-indigo-500" />
                            Lecture Grid Today
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="space-y-4">
                            {schedule.length > 0 ? schedule.map((cls, i) => (
                                <div key={i} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 transition-all group/item shadow-sm">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center group-hover/item:bg-indigo-600 transition-colors">
                                            <BookOpen className="h-7 w-7 text-indigo-600 group-hover/item:text-white" />
                                        </div>
                                        <div>
                                            <p className="font-extrabold text-slate-900 text-lg">{cls.subject || "Major Elective"}</p>
                                            <p className="text-sm text-slate-500 font-bold">{cls.startTime} - {cls.endTime}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge className="bg-slate-100 text-slate-700 border-0 mb-1 px-3 py-1 text-[10px] font-black tracking-widest">
                                            {cls.room || "AUDI-1"}
                                        </Badge>
                                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-black justify-end tracking-tighter uppercase">
                                            <TrendingUp className="h-3 w-3" /> ON TIME
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-16 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                                    <p className="text-slate-400 font-bold text-lg">No active lectures in your orbit today.</p>
                                    <Button variant="ghost" className="mt-4 text-indigo-600 hover:text-indigo-700">Refresh Schedule</Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Vertical Sidebar Tasks */}
                <div className="space-y-6">
                    <Card className="border-0 shadow-lg rounded-[2rem] bg-slate-900 text-white p-8 relative overflow-hidden">
                        <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/10 rounded-full blur-2xl" />
                        <h3 className="text-xl font-bold mb-6 font-outfit">Portal Safety</h3>
                        <div className="space-y-6">
                            <div className="flex gap-4 items-start">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                <div>
                                    <p className="text-sm font-bold text-slate-100">Verified Identity</p>
                                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Your portal session is cryptographically isolated and audit-logged.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                <div>
                                    <p className="text-sm font-bold text-slate-100">Live Heartbeat</p>
                                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">System-wide performance is nominal (&gt;99.9% Uptime).</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="border-0 shadow-xl rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white relative overflow-hidden group">
                        <Briefcase className="absolute -right-6 -top-6 h-32 w-32 text-white/10 group-hover:rotate-12 transition-transform" />
                        <h4 className="font-bold text-xl font-outfit">Placement Hub</h4>
                        <p className="text-xs text-indigo-100 mt-2 leading-relaxed opacity-80">
                            The mega placement drive starts next week. Update your resume in the Placement Shell.
                        </p>
                        <Button className="w-full mt-6 bg-white text-indigo-700 hover:bg-slate-50 rounded-2xl font-black text-xs shadow-xl tracking-tighter">
                            ENTER PLACEMENT PORTAL
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
