"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Check, X, Calendar, Loader2, ClipboardList, AlertCircle
} from "lucide-react";
import { AttendanceService } from "@/lib/services/attendance.service";

export default function StudentPortalAttendancePage() {
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchAttendance = async () => {
            const userId = (user as any)?.id || (user as any)?._id;
            if (!userId) return;
            try {
                const res = await AttendanceService.getStudentAttendance(userId);
                setSummary(res.data || res);
                setError(null);
            } catch (error: any) {
                console.error("Failed to fetch attendance summary", error);
                if (error.response?.status === 404) {
                    setError("Student profile not found. Please contact the registrar to complete your enrollment.");
                } else {
                    setError("Failed to load attendance data. Please try again later.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, [user]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <p className="text-slate-500 font-medium">Loading Attendance Records...</p>
        </div>
    );

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-slate-400" />
                <h3 className="text-xl font-bold">Attendance Records Unavailable</h3>
                <p className="text-slate-500 max-w-md">{error}</p>
            </div>
        );
    }

    if (!summary || !summary.records) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
            <ClipboardList className="h-12 w-12 text-slate-400" />
            <h3 className="text-xl font-bold">No Records Found</h3>
            <p className="text-slate-500">You haven't been marked for any classes yet.</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl font-bold font-outfit text-slate-900">My Attendance</h1>
                <p className="text-slate-500">Real-time track of your academic presence</p>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm overflow-hidden">
                    <div className="h-1 bg-indigo-500" />
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 rounded-xl">
                                <ClipboardList className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Overall</p>
                                <p className="text-2xl font-bold text-slate-900">{summary.attendancePercentage || 0}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm overflow-hidden">
                    <div className="h-1 bg-green-500" />
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-50 rounded-xl">
                                <Check className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Present</p>
                                <p className="text-2xl font-bold text-slate-900">{summary.presentClasses || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm overflow-hidden">
                    <div className="h-1 bg-red-500" />
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-50 rounded-xl">
                                <X className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Absent</p>
                                <p className="text-2xl font-bold text-slate-900">{summary.absentClasses || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm overflow-hidden">
                    <div className="h-1 bg-purple-500" />
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-50 rounded-xl">
                                <Calendar className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total</p>
                                <p className="text-2xl font-bold text-slate-900">{summary.totalClasses || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Records */}
            <Card className="border-0 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b">
                    <CardTitle className="text-lg font-bold text-slate-800">Attendance Log</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/30">
                                <TableHead className="py-4 px-6">Date</TableHead>
                                <TableHead className="py-4 px-6">Course</TableHead>
                                <TableHead className="py-4 px-6 text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {summary.records.map((record: any) => (
                                <TableRow key={record._id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="py-4 px-6 font-medium">
                                        {new Date(record.date).toLocaleDateString(undefined, {
                                            weekday: 'short',
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </TableCell>
                                    <TableCell className="py-4 px-6">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-900">
                                                {typeof record.courseId === 'object' ? record.courseId.name : 'Academic Session'}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                {typeof record.courseId === 'object' ? record.courseId.code : '-'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 px-6 text-right">
                                        <Badge 
                                            variant={record.status === 'PRESENT' ? 'default' : record.status === 'ABSENT' ? 'destructive' : 'secondary'}
                                            className={record.status === 'PRESENT' ? 'bg-green-500 hover:bg-green-600' : ''}
                                        >
                                            {record.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
