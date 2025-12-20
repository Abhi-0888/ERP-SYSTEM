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
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { BookOpen, Search, Plus, MoreHorizontal, Pencil, Trash2, Loader2, RefreshCw } from "lucide-react";
import { AcademicService } from "@/lib/services/academic.service";

interface Program {
    _id: string;
    name: string;
    code: string;
}

interface Course {
    _id: string;
    name: string;
    code: string;
    programId: Program | string;
    semester: number;
    credits: number;
    description?: string;
    minMarksForPass?: number;
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [semesterFilter, setSemesterFilter] = useState<string>("all");
    const [programFilter, setProgramFilter] = useState<string>("all");

    // Dialog States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<Course | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        programId: "",
        semester: 1,
        credits: 3,
        minMarksForPass: 40
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [coursesRes, programsRes] = await Promise.all([
                AcademicService.getCourses({ limit: 100 }), // Fetch all
                AcademicService.getPrograms({ limit: 100 })
            ]);
            setCourses(coursesRes.data || []);
            setPrograms(programsRes.data || []);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filtered = courses.filter((c) => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.code.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSem = semesterFilter === "all" || c.semester === parseInt(semesterFilter);

        // Handle program filter - checking populated object or string ID
        let programId = "";
        if (typeof c.programId === 'object' && c.programId !== null) {
            programId = c.programId._id;
        } else {
            programId = c.programId as string;
        }
        const matchesProgram = programFilter === "all" || programId === programFilter;

        return matchesSearch && matchesSem && matchesProgram;
    });

    const handleCreate = async () => {
        if (!formData.programId) {
            alert("Please select a program");
            return;
        }
        setActionLoading(true);
        try {
            await AcademicService.createCourse(formData);
            await fetchData();
            setIsCreateOpen(false);
            setFormData({ name: "", code: "", programId: "", semester: 1, credits: 3, minMarksForPass: 40 });
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to create course");
        } finally {
            setActionLoading(false);
        }
    };

    const handleEdit = async () => {
        if (!selected) return;
        setActionLoading(true);
        try {
            await AcademicService.updateCourse(selected._id, formData);
            await fetchData();
            setIsEditOpen(false);
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to update course");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selected) return;
        setActionLoading(true);
        try {
            await AcademicService.deleteCourse(selected._id);
            await fetchData();
            setIsDeleteOpen(false);
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to delete course");
        } finally {
            setActionLoading(false);
        }
    };

    const openEdit = (course: Course) => {
        setSelected(course);
        setFormData({
            name: course.name,
            code: course.code,
            programId: typeof course.programId === 'object' ? (course.programId as any)._id : course.programId,
            semester: course.semester,
            credits: course.credits,
            minMarksForPass: course.minMarksForPass || 40
        });
        setIsEditOpen(true);
    };

    const getProgramCode = (progId: string | Program) => {
        if (typeof progId === 'object' && progId !== null) return progId.code;
        const prog = programs.find(p => p._id === progId);
        return prog ? prog.code : "N/A";
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
                    <p className="text-slate-500">Manage course catalog and subjects.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />Add Course
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-sm text-slate-500 font-medium">Total Courses</p>
                        <p className="text-2xl font-bold mt-1">{courses.length}</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-sm text-slate-500 font-medium">Total Credits</p>
                        <p className="text-2xl font-bold mt-1 text-blue-600">{courses.reduce((a, c) => a + c.credits, 0)}</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-sm text-slate-500 font-medium">Programs Covered</p>
                        <p className="text-2xl font-bold mt-1 text-purple-600">{programs.length}</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-sm text-slate-500 font-medium">Active Semesters</p>
                        <p className="text-2xl font-bold mt-1 text-orange-600">8</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input placeholder="Search courses..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                        <Select value={programFilter} onValueChange={setProgramFilter}>
                            <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Filter Program" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Programs</SelectItem>
                                {programs.map(p => <SelectItem key={p._id} value={p._id}>{p.code}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                            <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Semester" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Semesters</SelectItem>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        < BookOpen className="h-5 w-5 text-blue-600" />
                        All Courses ({filtered.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Course Name</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Program</TableHead>
                                <TableHead>Sem</TableHead>
                                <TableHead>Credits</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow key="loading">
                                    <TableCell colSpan={6} className="h-24 text-center">Loading courses...</TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow key="empty">
                                    <TableCell colSpan={6} className="h-24 text-center text-slate-500">No courses found matching criteria.</TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((course) => (
                                    <TableRow key={course._id}>
                                        <TableCell className="font-medium">{course.name}</TableCell>
                                        <TableCell><Badge variant="outline">{course.code}</Badge></TableCell>
                                        <TableCell>{getProgramCode(course.programId)}</TableCell>
                                        <TableCell>{course.semester}</TableCell>
                                        <TableCell>{course.credits}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openEdit(course)}>
                                                        <Pencil className="h-4 w-4 mr-2" />Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => { setSelected(course); setIsDeleteOpen(true); }} className="text-red-600">
                                                        <Trash2 className="h-4 w-4 mr-2" />Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Add New Course</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Course Name</label>
                                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Data Structures" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Course Code</label>
                                <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="e.g. CS101" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Program</label>
                            <Select value={formData.programId} onValueChange={(v) => setFormData({ ...formData, programId: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Program" />
                                </SelectTrigger>
                                <SelectContent>
                                    {programs.map(p => (
                                        <SelectItem key={p._id} value={p._id}>{p.name} ({p.code})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Semester</label>
                                <Input type="number" min={1} max={8} value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Credits</label>
                                <Input type="number" min={1} max={6} value={formData.credits} onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Min Marks</label>
                                <Input type="number" min={0} max={100} value={formData.minMarksForPass} onChange={(e) => setFormData({ ...formData, minMarksForPass: parseInt(e.target.value) })} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={actionLoading}>
                            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Course
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Edit Course</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><label className="text-sm font-medium">Course Name</label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
                            <div className="space-y-2"><label className="text-sm font-medium">Code</label><Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} /></div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Program</label>
                            <Select value={formData.programId} onValueChange={(v) => setFormData({ ...formData, programId: v })}>
                                <SelectTrigger><SelectValue placeholder="Select Program" /></SelectTrigger>
                                <SelectContent>{programs.map(p => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2"><label className="text-sm font-medium">Semester</label><Input type="number" value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })} /></div>
                            <div className="space-y-2"><label className="text-sm font-medium">Credits</label><Input type="number" value={formData.credits} onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })} /></div>
                            <div className="space-y-2"><label className="text-sm font-medium">Min Marks</label><Input type="number" value={formData.minMarksForPass} onChange={(e) => setFormData({ ...formData, minMarksForPass: parseInt(e.target.value) })} /></div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleEdit} disabled={actionLoading}>
                            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete Course</DialogTitle></DialogHeader>
                    <p className="py-4">Are you sure you want to delete <strong>{selected?.name}</strong>? This action cannot be undone.</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>
                            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete Course
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
