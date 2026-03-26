"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { ClipboardList, Search, Plus, MoreHorizontal, Loader2 } from "lucide-react";
import { StudentService } from "@/lib/services/student.service";
import { AcademicService } from "@/lib/services/academic.service";
import { toast } from "sonner";
import { Student, Course } from "@/lib/types";

export default function EnrollmentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<string>("");
    const [selectedCourse, setSelectedCourse] = useState<string>("");

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [studentsRes, coursesRes] = await Promise.all([
                StudentService.getAll({ limit: 100 }),
                AcademicService.getCourses({ limit: 100 })
            ]);
            setStudents(studentsRes.data || []);
            setCourses(coursesRes.data || []);
        } catch (error) {
            console.error("Failed to fetch enrollments data", error);
            toast.error("Failed to load enrollment data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filtered = students.filter((s) => {
        const query = searchQuery.toLowerCase();
        const firstName = s.firstName || (s.userId as any)?.name?.split(' ')[0] || "";
        const lastName = s.lastName || (s.userId as any)?.name?.split(' ').slice(1).join(' ') || "";
        const enrollmentNo = s.enrollmentNo || "";
        
        return (
            firstName.toLowerCase().includes(query) ||
            lastName.toLowerCase().includes(query) ||
            enrollmentNo.toLowerCase().includes(query) ||
            (s.userId as any)?.name?.toLowerCase().includes(query)
        );
    });

    const handleEnroll = async () => {
        if (!selectedStudent || !selectedCourse) {
            toast.error("Please select both student and course");
            return;
        }
        try {
            // Add course to student's enrolledCourses
            await StudentService.updateEnrollment(selectedStudent, { courseIds: [selectedCourse] });
            toast.success("Student enrolled successfully");
            setIsCreateOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Failed to enroll student");
        }
    };

    if (loading) return <div className="flex items-center justify-center h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div><h1 className="text-2xl font-bold">Enrollments</h1><p className="text-slate-500">Manage course enrollments</p></div>
                <Button size="sm" onClick={() => setIsCreateOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Enrollment</Button>
            </div>

            <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                    <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="Search students..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><ClipboardList className="h-5 w-5" />Student Course Enrollments</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Enrollment No</TableHead>
                                <TableHead>Program</TableHead>
                                <TableHead>Semester</TableHead>
                                <TableHead>Courses Enrolled</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length > 0 ? (
                                filtered.map((student) => (
                                    <TableRow key={student._id}>
                                        <TableCell className="font-medium">
                                            {student.firstName ? `${student.firstName} ${student.lastName}` : (student.userId as any)?.name || "Unknown Student"}
                                        </TableCell>
                                        <TableCell><Badge variant="outline">{student.enrollmentNo}</Badge></TableCell>
                                        <TableCell>{(student.programId as any)?.name || "N/A"}</TableCell>
                                        <TableCell>Sem {student.currentSemester || 1}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {student.enrolledCourses?.length > 0 ? (
                                                    student.enrolledCourses.map((c: any) => (
                                                        <Badge key={c._id || c} variant="secondary" className="text-[10px]">
                                                            {typeof c === 'object' ? c.code : "Course"}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">No courses</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => { setSelectedStudent(student._id); setIsCreateOpen(true); }}><Plus className="h-4 w-4 mr-2" />Enroll New Course</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={6} className="text-center py-10 text-slate-500">No students found</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Enroll Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Enroll Student in Course</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Student</label>
                            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                                <SelectContent>
                                    {students.map(s => <SelectItem key={s._id} value={s._id}>{s.enrollmentNo} - {s.firstName} {s.lastName}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Course</label>
                            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                                <SelectContent>
                                    {courses.map(c => <SelectItem key={c._id} value={c._id}>{c.code} - {c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button><Button onClick={handleEnroll}>Enroll</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
