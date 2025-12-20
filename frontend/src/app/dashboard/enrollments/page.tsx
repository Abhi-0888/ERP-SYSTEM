"use client";

import { useState } from "react";
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
import { ClipboardList, Search, Plus, MoreHorizontal, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";

interface Enrollment {
    id: string;
    studentName: string;
    studentId: string;
    program: string;
    semester: number;
    course: string;
    courseCode: string;
    enrolledDate: string;
    status: "active" | "dropped" | "completed";
    grade?: string;
}

const initialEnrollments: Enrollment[] = [
    { id: "1", studentName: "Rahul Verma", studentId: "2024CSE001", program: "BTCS", semester: 3, course: "Data Structures", courseCode: "CS201", enrolledDate: "2024-07-15", status: "active" },
    { id: "2", studentName: "Priya Sharma", studentId: "2024CSE002", program: "BTCS", semester: 3, course: "Data Structures", courseCode: "CS201", enrolledDate: "2024-07-15", status: "active" },
    { id: "3", studentName: "Amit Kumar", studentId: "2024ECE001", program: "BTEC", semester: 3, course: "Digital Electronics", courseCode: "EC201", enrolledDate: "2024-07-16", status: "active" },
    { id: "4", studentName: "Sneha Patel", studentId: "2024CSE003", program: "BTCS", semester: 5, course: "Database Systems", courseCode: "CS301", enrolledDate: "2024-07-10", status: "completed", grade: "A" },
    { id: "5", studentName: "Vikram Singh", studentId: "2023MBA001", program: "MBA", semester: 2, course: "Marketing", courseCode: "MB201", enrolledDate: "2024-01-10", status: "active" },
    { id: "6", studentName: "Anita Reddy", studentId: "2024CSE004", program: "BTCS", semester: 3, course: "Data Structures", courseCode: "CS201", enrolledDate: "2024-07-15", status: "dropped" },
];

const courses = [
    { code: "CS201", name: "Data Structures" },
    { code: "CS301", name: "Database Systems" },
    { code: "CS401", name: "Computer Networks" },
    { code: "EC201", name: "Digital Electronics" },
    { code: "MB201", name: "Marketing" },
];

export default function EnrollmentsPage() {
    const [enrollments, setEnrollments] = useState<Enrollment[]>(initialEnrollments);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<Enrollment | null>(null);
    const [formData, setFormData] = useState({ studentName: "", studentId: "", program: "", semester: 1, courseCode: "" });

    const filtered = enrollments.filter((e) => {
        const matchesSearch = e.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || e.studentId.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || e.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleCreate = () => {
        const course = courses.find(c => c.code === formData.courseCode);
        const newEnrollment: Enrollment = {
            id: Date.now().toString(),
            studentName: formData.studentName,
            studentId: formData.studentId,
            program: formData.program,
            semester: formData.semester,
            course: course?.name || "",
            courseCode: formData.courseCode,
            enrolledDate: new Date().toISOString().split("T")[0],
            status: "active",
        };
        setEnrollments([...enrollments, newEnrollment]);
        setFormData({ studentName: "", studentId: "", program: "", semester: 1, courseCode: "" });
        setIsCreateOpen(false);
    };

    const handleEdit = () => {
        if (!selected) return;
        const course = courses.find(c => c.code === formData.courseCode);
        setEnrollments(enrollments.map((e) => e.id === selected.id ? { ...e, ...formData, course: course?.name || e.course } : e));
        setIsEditOpen(false);
    };

    const handleDelete = () => {
        if (!selected) return;
        setEnrollments(enrollments.filter((e) => e.id !== selected.id));
        setIsDeleteOpen(false);
    };

    const toggleStatus = (enrollment: Enrollment, newStatus: "active" | "dropped" | "completed") => {
        setEnrollments(enrollments.map((e) => e.id === enrollment.id ? { ...e, status: newStatus } : e));
    };

    const openEdit = (enrollment: Enrollment) => {
        setSelected(enrollment);
        setFormData({ studentName: enrollment.studentName, studentId: enrollment.studentId, program: enrollment.program, semester: enrollment.semester, courseCode: enrollment.courseCode });
        setIsEditOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div><h1 className="text-2xl font-bold">Enrollments</h1><p className="text-slate-500">Manage course enrollments</p></div>
                <Button size="sm" onClick={() => setIsCreateOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Enrollment</Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-sm text-slate-500">Total Enrollments</p><p className="text-2xl font-bold">{enrollments.length}</p></CardContent></Card>
                <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-sm text-slate-500">Active</p><p className="text-2xl font-bold text-green-600">{enrollments.filter(e => e.status === "active").length}</p></CardContent></Card>
                <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-sm text-slate-500">Completed</p><p className="text-2xl font-bold text-blue-600">{enrollments.filter(e => e.status === "completed").length}</p></CardContent></Card>
                <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-sm text-slate-500">Dropped</p><p className="text-2xl font-bold text-red-600">{enrollments.filter(e => e.status === "dropped").length}</p></CardContent></Card>
            </div>

            <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="Search by student name or ID..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="dropped">Dropped</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><ClipboardList className="h-5 w-5" />All Enrollments ({filtered.length})</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Program</TableHead>
                                <TableHead>Semester</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Enrolled Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Grade</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((enrollment) => (
                                <TableRow key={enrollment.id}>
                                    <TableCell><div><p className="font-medium">{enrollment.studentName}</p><p className="text-xs text-slate-500">{enrollment.studentId}</p></div></TableCell>
                                    <TableCell>{enrollment.program}</TableCell>
                                    <TableCell>Sem {enrollment.semester}</TableCell>
                                    <TableCell><div><p>{enrollment.course}</p><p className="text-xs text-slate-500">{enrollment.courseCode}</p></div></TableCell>
                                    <TableCell>{enrollment.enrolledDate}</TableCell>
                                    <TableCell><Badge variant={enrollment.status === "active" ? "default" : enrollment.status === "completed" ? "secondary" : "destructive"}>{enrollment.status}</Badge></TableCell>
                                    <TableCell>{enrollment.grade || "-"}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openEdit(enrollment)}><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                                                {enrollment.status === "active" && (
                                                    <>
                                                        <DropdownMenuItem onClick={() => toggleStatus(enrollment, "completed")}><CheckCircle className="h-4 w-4 mr-2" />Mark Completed</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => toggleStatus(enrollment, "dropped")}><XCircle className="h-4 w-4 mr-2" />Mark Dropped</DropdownMenuItem>
                                                    </>
                                                )}
                                                <DropdownMenuItem onClick={() => { setSelected(enrollment); setIsDeleteOpen(true); }} className="text-red-600"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Add Enrollment</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><label className="text-sm font-medium">Student Name</label><Input value={formData.studentName} onChange={(e) => setFormData({ ...formData, studentName: e.target.value })} /></div>
                            <div className="space-y-2"><label className="text-sm font-medium">Student ID</label><Input value={formData.studentId} onChange={(e) => setFormData({ ...formData, studentId: e.target.value })} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><label className="text-sm font-medium">Program</label><Input value={formData.program} onChange={(e) => setFormData({ ...formData, program: e.target.value })} placeholder="BTCS" /></div>
                            <div className="space-y-2"><label className="text-sm font-medium">Semester</label><Input type="number" min={1} max={8} value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })} /></div>
                        </div>
                        <div className="space-y-2"><label className="text-sm font-medium">Course</label>
                            <Select value={formData.courseCode} onValueChange={(v) => setFormData({ ...formData, courseCode: v })}><SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger><SelectContent>{courses.map(c => <SelectItem key={c.code} value={c.code}>{c.code} - {c.name}</SelectItem>)}</SelectContent></Select>
                        </div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button><Button onClick={handleCreate}>Enroll</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Enrollment</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><label className="text-sm font-medium">Student Name</label><Input value={formData.studentName} onChange={(e) => setFormData({ ...formData, studentName: e.target.value })} /></div>
                            <div className="space-y-2"><label className="text-sm font-medium">Semester</label><Input type="number" value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })} /></div>
                        </div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button><Button onClick={handleEdit}>Save</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete Enrollment</DialogTitle></DialogHeader>
                    <p className="py-4">Remove enrollment for <strong>{selected?.studentName}</strong> from <strong>{selected?.course}</strong>?</p>
                    <DialogFooter><Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
