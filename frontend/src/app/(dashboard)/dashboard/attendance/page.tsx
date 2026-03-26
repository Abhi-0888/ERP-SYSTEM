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

    const fetchStudents = useCallback(async (courseId: string) => {
        if (!courseId) return;
        setLoading(true);
        try {
            const data = await StudentService.getByCourse(courseId);
            setStudents(data || []);

            // Initialize default attendance as present
            const initialAttendance: Record<string, 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE'> = {};
            (data || []).forEach((s: Student) => {
                initialAttendance[s._id] = 'PRESENT';
            });
            setAttendance(initialAttendance);
        } catch (error) {
            console.error("Failed to fetch students", error);
            toast.error("Failed to load enrolled students");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            fetchStudents(selectedCourse);
        }
    }, [selectedCourse, fetchStudents]);

    const toggleStatus = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE') => {
        setAttendance((prev) => ({ ...prev, [studentId]: status }));
    };

    const handleSave = async () => {
        if (!selectedCourse) {
            alert("Please select a course");
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
            alert("Attendance saved successfully");
        } catch (error: any) {
            console.error("Failed to save attendance", error);
            alert(error.response?.data?.message || "Failed to save attendance");
        } finally {
            setSaving(true);
            // Artificial delay to show success before resetting state if needed
            setTimeout(() => setSaving(false), 500);
        }
    };

    const presentCount = Object.values(attendance).filter((s) => s === "PRESENT").length;
    const absentCount = Object.values(attendance).filter((s) => s === "ABSENT").length;
    const lateCount = Object.values(attendance).filter((s) => s === "LATE").length;

    return (
        <div className="space-y-6">
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
                                <TableRow>
                                    <TableHead className="w-32">Reg No</TableHead>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead className="text-center">Present</TableHead>
                                    <TableHead className="text-center">Absent</TableHead>
                                    <TableHead className="text-center">Late</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.length === 0 && !loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-slate-500">No students found for this course.</TableCell>
                                    </TableRow>
                                ) : (
                                    students.map((student) => (
                                        <TableRow key={student._id}>
                                            <TableCell className="font-mono text-xs">{student.enrollmentNo}</TableCell>
                                            <TableCell className="font-medium">{student.firstName} {student.lastName}</TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    size="sm"
                                                    variant={attendance[student._id] === "PRESENT" ? "default" : "outline"}
                                                    className={`w-10 h-10 p-0 ${attendance[student._id] === "PRESENT" ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                                    onClick={() => toggleStatus(student._id, "PRESENT")}
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    size="sm"
                                                    variant={attendance[student._id] === "ABSENT" ? "destructive" : "outline"}
                                                    className="w-10 h-10 p-0"
                                                    onClick={() => toggleStatus(student._id, "ABSENT")}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    size="sm"
                                                    variant={attendance[student._id] === "LATE" ? "secondary" : "outline"}
                                                    className={`w-10 h-10 p-0 ${attendance[student._id] === "LATE" ? 'bg-orange-500 text-white hover:bg-orange-600' : ''}`}
                                                    onClick={() => toggleStatus(student._id, "LATE")}
                                                >
                                                    <Clock className="h-4 w-4" />
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
                <CardHeader>
                    <CardTitle className="text-lg">Recent Records</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {summary?.records?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8 text-slate-500">No attendance records found.</TableCell>
                                </TableRow>
                            ) : (
                                summary?.records?.map((record: any) => (
                                    <TableRow key={record._id}>
                                        <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                                        <TableCell className="font-medium">
                                            {typeof record.courseId === 'object' ? record.courseId.name : record.courseId}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={record.status === 'PRESENT' ? 'default' : 'destructive'}>
                                                {record.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
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
