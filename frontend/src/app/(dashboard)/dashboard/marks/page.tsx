"use client";

import { useState, useEffect } from "react";
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
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { BookOpen, Award, Plus, MoreHorizontal, Pencil, Trash2, Loader2, Search } from "lucide-react";
import { MarksService, Mark } from "@/lib/services/marks.service";
import { AcademicService } from "@/lib/services/academic.service";
import { ExamService } from "@/lib/services/exam.service";
import { StudentService } from "@/lib/services/student.service";
import { toast } from "sonner";
import { Course, Exam, Student } from "@/lib/types";

export default function MarksPage() {
    const [marks, setMarks] = useState<Mark[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<Mark | null>(null);
    const [formData, setFormData] = useState({
        studentId: "",
        courseId: "",
        examId: "",
        marksObtained: 0,
        remarks: ""
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [marksRes, studentsRes, coursesRes, examsRes] = await Promise.all([
                MarksService.getAll({ limit: 100 }),
                StudentService.getAll({ limit: 100 }),
                AcademicService.getCourses({ limit: 100 }),
                ExamService.getExams({ limit: 100 })
            ]);
            setMarks(marksRes.data || []);
            setStudents(studentsRes.data || []);
            setCourses(coursesRes.data || []);
            setExams(examsRes.exams || examsRes.data || []);
        } catch (error) {
            console.error("Failed to fetch marks data", error);
            toast.error("Failed to load marks data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getStudentName = (studentId: any) => {
        if (!studentId) return "Unknown";
        if (typeof studentId === 'object') {
            return studentId.name || studentId.enrollmentNo || "Unknown";
        }
        const student = students.find(s => s._id === studentId || (s as any).id === studentId);
        return student ? (student as any).userId?.name || student.enrollmentNo : "Unknown";
    };

    const getCourseName = (courseId: any) => {
        if (!courseId) return "Unknown Course";
        if (typeof courseId === 'object') {
            return `${courseId.code || ""} - ${courseId.name || "Course"}`.trim();
        }
        const course = courses.find(c => c._id === courseId || (c as any).id === courseId);
        return course ? `${course.code} - ${course.name}` : "Unknown Course";
    };

    const getExamName = (examId: any) => {
        if (!examId) return "Unknown Exam";
        if (typeof examId === 'object') {
            return examId.name || "Exam";
        }
        const exam = exams.find(e => e._id === examId || (e as any).id === examId);
        return exam ? exam.name : "Unknown Exam";
    };

    const filtered = marks.filter((m) => {
        const query = searchQuery.toLowerCase();
        const studentName = getStudentName(m.studentId).toLowerCase();
        const courseName = getCourseName(m.courseId).toLowerCase();
        return studentName.includes(query) || courseName.includes(query);
    });

    const handleCreate = async () => {
        if (!formData.studentId || !formData.courseId || !formData.examId) {
            toast.error("Student, Course, and Exam are required");
            return;
        }
        try {
            await MarksService.create(formData);
            toast.success("Marks added successfully");
            setIsCreateOpen(false);
            resetForm();
            fetchData();
        } catch (error: any) {
            console.error("Creation failed", error);
            toast.error(error.response?.data?.message || "Failed to add marks");
        }
    };

    const handleEdit = async () => {
        if (!selected) return;
        try {
            await MarksService.update(selected._id, formData);
            toast.success("Marks updated");
            setIsEditOpen(false);
            fetchData();
        } catch (error) {
            console.error("Update failed", error);
            toast.error("Failed to update marks");
        }
    };

    const handleDelete = async () => {
        if (!selected) return;
        try {
            await MarksService.delete(selected._id);
            toast.success("Marks removed");
            setIsDeleteOpen(false);
            fetchData();
        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Failed to delete marks");
        }
    };

    const resetForm = () => {
        setFormData({
            studentId: "",
            courseId: "",
            examId: "",
            marksObtained: 0,
            remarks: ""
        });
    };

    const openEdit = (mark: Mark) => {
        setSelected(mark);
        setFormData({
            studentId: typeof mark.studentId === 'object' ? mark.studentId._id : mark.studentId,
            courseId: typeof mark.courseId === 'object' ? mark.courseId._id : mark.courseId,
            examId: typeof mark.examId === 'object' ? mark.examId._id : mark.examId,
            marksObtained: mark.marksObtained,
            remarks: mark.remarks || ""
        });
        setIsEditOpen(true);
    };

    if (loading) return <div className="flex items-center justify-center h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div><h1 className="text-2xl font-bold">Internal Marks</h1><p className="text-slate-500">Manage student internal marks</p></div>
                <Button size="sm" onClick={() => setIsCreateOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Marks</Button>
            </div>

            <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                    <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="Search by student or course..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Award className="h-5 w-5" />All Marks ({filtered.length})</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Exam</TableHead>
                                <TableHead>Marks</TableHead>
                                <TableHead>Remarks</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length > 0 ? (
                                filtered.map((mark) => (
                                    <TableRow key={mark._id}>
                                        <TableCell className="font-medium">{getStudentName(mark.studentId)}</TableCell>
                                        <TableCell>{getCourseName(mark.courseId)}</TableCell>
                                        <TableCell>{getExamName(mark.examId)}</TableCell>
                                        <TableCell>
                                            <Badge variant={mark.marksObtained >= 40 ? "default" : "secondary"}>
                                                {mark.marksObtained}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-500">{mark.remarks || "-"}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => openEdit(mark)}><Pencil className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => { setSelected(mark); setIsDeleteOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={6} className="text-center py-10 text-slate-500">No marks found. Click "Add Marks" to add one.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Add Marks</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Student</label>
                            <Select value={formData.studentId} onValueChange={(v) => setFormData({ ...formData, studentId: v })}>
                                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                                <SelectContent>
                                    {students.map(s => (
                                        <SelectItem key={s._id} value={s._id}>
                                            {s.enrollmentNo} - {(s as any).userId?.name || `${s.firstName} ${s.lastName}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Select Course</label>
                                <Select value={formData.courseId} onValueChange={(v) => setFormData({ ...formData, courseId: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                                    <SelectContent>
                                        {courses.map(c => (
                                            <SelectItem key={c._id} value={c._id}>{c.code} - {c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Select Exam</label>
                                <Select value={formData.examId} onValueChange={(v) => setFormData({ ...formData, examId: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select exam" /></SelectTrigger>
                                    <SelectContent>
                                        {exams.map(e => (
                                            <SelectItem key={e._id} value={e._id}>{e.name} ({e.type})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Marks Obtained</label>
                                <Input 
                                    type="number" 
                                    min="0" 
                                    max="100" 
                                    value={formData.marksObtained} 
                                    onChange={(e) => setFormData({ ...formData, marksObtained: Number(e.target.value) })} 
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Remarks (Optional)</label>
                            <Input 
                                value={formData.remarks} 
                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} 
                                placeholder="Add remarks"
                            />
                        </div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button><Button onClick={handleCreate}>Add Marks</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Edit Marks</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Marks Obtained</label>
                            <Input 
                                type="number" 
                                min="0" 
                                max="100" 
                                value={formData.marksObtained} 
                                onChange={(e) => setFormData({ ...formData, marksObtained: Number(e.target.value) })} 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Remarks (Optional)</label>
                            <Input 
                                value={formData.remarks} 
                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} 
                                placeholder="Add remarks"
                            />
                        </div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button><Button onClick={handleEdit}>Save Changes</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete Marks</DialogTitle></DialogHeader>
                    <p className="py-4">Delete marks for <strong>{selected && getStudentName(selected.studentId)}</strong> in <strong>{selected && getCourseName(selected.courseId)}</strong>?</p>
                    <DialogFooter><Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
