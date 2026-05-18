"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Check, X, Clock, Save, TrendingUp, TrendingDown, Users, Calendar, Loader2, RefreshCw, AlertCircle, ClipboardList
} from "lucide-react";
import { AcademicService } from "@/lib/services/academic.service";
import { AttendanceService } from "@/lib/services/attendance.service";
import { StudentService } from "@/lib/services/student.service";
import { toast } from "sonner";
import { Course, Student } from "@/lib/types";

// Faculty view - Mark attendance
function FacultyAttendance() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [attendance, setAttendance] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE'>>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [confirmResult, setConfirmResult] = useState<null | { courseName: string; date: string; summary: Record<string, number>; total: number }>(null);

    const fetchCourses = useCallback(async () => {
        try {
            const res = await AcademicService.getCourses({ limit: 100 });
            setCourses(res.data || []);
        } catch (error) {
            console.error("Failed to fetch courses", error);
        }
    }, []);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const fetchStudentsAndAttendance = useCallback(async (courseId: string, date: string) => {
        if (!courseId || !date) return;
        setLoading(true);
        try {
            // Fetch students enrolled in the course
            const data = await StudentService.getByCourse(courseId);
            setStudents(data || []);

            // Fetch existing attendance records for this course+date
            const existing = await AttendanceService.getAttendance({
                courseId,
                startDate: date,
                endDate: date,
                limit: 500,
            });
            const existingRecords: any[] = existing?.data || [];

            // Build a map: studentId → status from saved records
            const savedMap: Record<string, 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE'> = {};
            existingRecords.forEach((rec: any) => {
                const studentId = typeof rec.studentId === 'object'
                    ? rec.studentId._id || rec.studentId
                    : rec.studentId;
                savedMap[studentId.toString()] = rec.status;
            });

            // Merge: use saved status if exists, else default to PRESENT
            const merged: Record<string, 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE'> = {};
            (data || []).forEach((s: Student) => {
                merged[s._id] = savedMap[s._id] || 'PRESENT';
            });
            setAttendance(merged);

            if (existingRecords.length > 0) {
                toast.info(`Loaded ${existingRecords.length} existing records for this date.`);
            }
        } catch (error) {
            console.error("Failed to fetch students", error);
            toast.error("Failed to load enrolled students");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            fetchStudentsAndAttendance(selectedCourse, selectedDate);
        }
    }, [selectedCourse, selectedDate, fetchStudentsAndAttendance]);

    const toggleStatus = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE') => {
        setAttendance((prev) => ({ ...prev, [studentId]: status }));
    };

    const handleSave = async () => {
        if (!selectedCourse) {
            toast.error("Please select a course first");
            return;
        }
        if (Object.keys(attendance).length === 0) {
            toast.error("No students loaded to mark attendance");
            return;
        }
        setSaving(true);
        try {
            const bulkData = Object.entries(attendance).map(([studentId, status]) => ({
                studentId,
                courseId: selectedCourse,
                status,
                date: selectedDate
            }));

            await AttendanceService.markBulkAttendance(bulkData as any);

            // Build summary counts for confirmation popup
            const summary: Record<string, number> = { PRESENT: 0, ABSENT: 0, LATE: 0, LEAVE: 0 };
            Object.values(attendance).forEach(s => { summary[s] = (summary[s] || 0) + 1; });
            const course = courses.find(c => c._id === selectedCourse);
            setConfirmResult({
                courseName: course ? `${course.name} (${course.code})` : 'Selected Course',
                date: selectedDate,
                summary,
                total: bulkData.length,
            });
        } catch (error: any) {
            console.error("Failed to save attendance", error);
            toast.error(error.response?.data?.message || "Failed to save attendance");
        } finally {
            setSaving(false);
        }
    };

    const presentCount = Object.values(attendance).filter((s) => s === "PRESENT").length;
    const absentCount = Object.values(attendance).filter((s) => s === "ABSENT").length;
    const lateCount = Object.values(attendance).filter((s) => s === "LATE").length;

    return (
        <div className="space-y-6">
            {/* ✅ Confirmation Dialog */}
            {confirmResult && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-5">
                            <div className="flex items-center gap-3 text-white">
                                <div className="bg-white/20 rounded-full p-2">
                                    <Check className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold">Attendance Marked!</h2>
                                    <p className="text-green-100 text-sm">Successfully saved for {confirmResult.total} students</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 space-y-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Course</p>
                                <p className="font-semibold text-slate-800">{confirmResult.courseName}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Date</p>
                                <p className="font-semibold text-slate-800">
                                    {new Date(confirmResult.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { label: 'Present', count: confirmResult.summary.PRESENT, color: 'bg-green-50 text-green-700 border-green-200' },
                                    { label: 'Absent', count: confirmResult.summary.ABSENT, color: 'bg-red-50 text-red-700 border-red-200' },
                                    { label: 'Late', count: confirmResult.summary.LATE, color: 'bg-orange-50 text-orange-700 border-orange-200' },
                                    { label: 'Leave', count: confirmResult.summary.LEAVE, color: 'bg-blue-50 text-blue-700 border-blue-200' },
                                ].map(({ label, count, color }) => (
                                    <div key={label} className={`rounded-xl border text-center p-3 ${color}`}>
                                        <p className="text-2xl font-black">{count || 0}</p>
                                        <p className="text-xs font-semibold">{label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="px-6 pb-5">
                            <Button
                                className="w-full bg-slate-900 hover:bg-slate-700 text-white rounded-xl"
                                onClick={() => setConfirmResult(null)}
                            >
                                Done
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Mark Attendance</h1>
                    <p className="text-slate-500">Record daily attendance for your classes</p>
                </div>
                <Button onClick={handleSave} disabled={saving || students.length === 0}>
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Attendance
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm bg-green-50">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <Check className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-green-700">Present</p>
                            <p className="text-2xl font-bold text-green-800">{presentCount || "-"}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-red-50">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-red-100 rounded-lg">
                            <X className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-red-700">Absent</p>
                            <p className="text-2xl font-bold text-red-800">{absentCount || "-"}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-orange-50">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <Clock className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-orange-700">Late</p>
                            <p className="text-2xl font-bold text-orange-800">{lateCount || "-"}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Course</label>
                            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                <SelectTrigger className="w-64">
                                    <SelectValue placeholder="Select course" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map(c => (
                                        <SelectItem key={c._id} value={c._id}>{c.code} - {c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Date</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Attendance Table */}
            <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Student List ({students.length})</CardTitle>
                    {loading && <Loader2 className="h-5 w-5 animate-spin text-slate-400" />}
                </CardHeader>
                <CardContent>
                    {!selectedCourse ? (
                        <div className="py-12 text-center text-slate-500">
                            <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>Please select a course to load students</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50">
                                    <TableHead className="w-10 text-center font-bold">#</TableHead>
                                    <TableHead className="w-36 font-bold">Reg No</TableHead>
                                    <TableHead className="font-bold">Student Name</TableHead>
                                    <TableHead className="w-16 text-center font-bold text-green-700">Present</TableHead>
                                    <TableHead className="w-16 text-center font-bold text-red-700">Absent</TableHead>
                                    <TableHead className="w-16 text-center font-bold text-orange-700">Late</TableHead>
                                    <TableHead className="w-16 text-center font-bold text-blue-700">Leave</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.length === 0 && !loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-slate-500">No students found for this course.</TableCell>
                                    </TableRow>
                                ) : (
                                    students.map((student, idx) => (
                                        <TableRow key={student._id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                                            <TableCell className="text-center text-slate-400 text-xs">{idx + 1}</TableCell>
                                            <TableCell className="font-mono text-xs font-medium">{student.enrollmentNo}</TableCell>
                                            <TableCell className="font-medium">
                                                {student.userId ? ((student.userId as any).name || (student.userId as any).username) : `${(student as any).firstName || ''} ${(student as any).lastName || ''}`.trim() || 'Unknown'}
                                                <span className="ml-2 text-[10px] text-slate-400">Sem {student.currentSemester} · {(student as any).batch}</span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    size="sm"
                                                    variant={attendance[student._id] === "PRESENT" ? "default" : "outline"}
                                                    className={`w-10 h-10 p-0 ${attendance[student._id] === "PRESENT" ? 'bg-green-600 hover:bg-green-700 border-green-600' : 'hover:bg-green-50 hover:border-green-400'}`}
                                                    onClick={() => toggleStatus(student._id, "PRESENT")}
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    size="sm"
                                                    variant={attendance[student._id] === "ABSENT" ? "destructive" : "outline"}
                                                    className={`w-10 h-10 p-0 ${attendance[student._id] === "ABSENT" ? '' : 'hover:bg-red-50 hover:border-red-400'}`}
                                                    onClick={() => toggleStatus(student._id, "ABSENT")}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    size="sm"
                                                    variant={attendance[student._id] === "LATE" ? "secondary" : "outline"}
                                                    className={`w-10 h-10 p-0 ${attendance[student._id] === "LATE" ? 'bg-orange-500 text-white hover:bg-orange-600' : 'hover:bg-orange-50 hover:border-orange-400'}`}
                                                    onClick={() => toggleStatus(student._id, "LATE")}
                                                >
                                                    <Clock className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    size="sm"
                                                    variant={attendance[student._id] === "LEAVE" ? "secondary" : "outline"}
                                                    className={`w-10 h-10 p-0 ${attendance[student._id] === "LEAVE" ? 'bg-blue-500 text-white hover:bg-blue-600' : 'hover:bg-blue-50 hover:border-blue-400'}`}
                                                    onClick={() => toggleStatus(student._id, "LEAVE")}
                                                >
                                                    <AlertCircle className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// Student view - View attendance
function StudentAttendance() {
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchAttendance = async () => {
            if (!user?._id) return;
            try {
                const res = await AttendanceService.getStudentAttendance(user._id);
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
    }, [user?._id]);

    if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-slate-400" />
                <h3 className="text-xl font-bold">Attendance Records Unavailable</h3>
                <p className="text-slate-500 max-w-md">{error}</p>
            </div>
        );
    }

    if (!summary) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
            <ClipboardList className="h-12 w-12 text-slate-400" />
            <h3 className="text-xl font-bold">No Records Found</h3>
            <p className="text-slate-500">You haven't been marked for any classes yet.</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">My Attendance</h1>
                <p className="text-slate-500">Track your attendance across all courses</p>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Overall</p>
                                <p className="text-xl font-bold">{summary?.attendancePercentage || 0}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Check className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Present</p>
                                <p className="text-xl font-bold">{summary?.presentClasses || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <X className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Absent</p>
                                <p className="text-xl font-bold">{summary?.absentClasses || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Calendar className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Total Classes</p>
                                <p className="text-xl font-bold">{summary?.totalClasses || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Attendance Records */}
            <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Attendance Log</CardTitle>
                    <Badge variant="outline" className="font-mono">{summary?.records?.length || 0} records</Badge>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead className="py-3 px-4 font-bold">Date</TableHead>
                                <TableHead className="py-3 px-4 font-bold">Subject</TableHead>
                                <TableHead className="py-3 px-4 font-bold">Marked By</TableHead>
                                <TableHead className="py-3 px-4 font-bold text-center">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!summary?.records?.length ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-12 text-slate-500">
                                        <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                        No attendance records found yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                summary.records.map((record: any, idx: number) => {
                                    const course = typeof record.courseId === 'object' ? record.courseId : null;
                                    const teacher = typeof record.markedBy === 'object' ? record.markedBy : null;
                                    const courseName = course?.name || 'Unknown Subject';
                                    const courseCode = course?.code ? ` (${course.code})` : '';
                                    const teacherName = teacher?.name || teacher?.username || 'Faculty';
                                    const statusColors: Record<string, string> = {
                                        PRESENT: 'bg-green-100 text-green-700 border-green-200',
                                        ABSENT: 'bg-red-100 text-red-700 border-red-200',
                                        LATE: 'bg-orange-100 text-orange-700 border-orange-200',
                                        LEAVE: 'bg-blue-100 text-blue-700 border-blue-200',
                                    };
                                    return (
                                        <TableRow key={record._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                                            <TableCell className="py-3 px-4 text-sm font-medium">
                                                {new Date(record.date).toLocaleDateString('en-IN', {
                                                    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </TableCell>
                                            <TableCell className="py-3 px-4">
                                                <span className="font-semibold text-slate-800">{courseName}</span>
                                                <span className="text-slate-400 text-xs">{courseCode}</span>
                                            </TableCell>
                                            <TableCell className="py-3 px-4 text-sm text-slate-600">
                                                {teacherName}
                                            </TableCell>
                                            <TableCell className="py-3 px-4 text-center">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${statusColors[record.status] || 'bg-slate-100 text-slate-600'}`}>
                                                    {record.status}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

export default function AttendancePage() {
    const { activeRole } = useAuth();

    if (activeRole === "SUPER_ADMIN" || activeRole === "FACULTY" || activeRole === "HOD" || activeRole === "UNIVERSITY_ADMIN" || activeRole === "ACADEMIC_COORDINATOR") {
        return <FacultyAttendance />;
    }

    return <StudentAttendance />;
}
