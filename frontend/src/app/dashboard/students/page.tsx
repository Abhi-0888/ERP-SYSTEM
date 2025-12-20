"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StudentService, Student } from "@/lib/services/student.service";
import { AcademicService } from "@/lib/services/academic.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Search, Plus, Filter, Download, MoreHorizontal, Eye, Pencil, Trash2, GraduationCap
} from "lucide-react";

export default function StudentsPage() {
    const router = useRouter();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Form State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [programs, setPrograms] = useState<any[]>([]);
    const [academicYears, setAcademicYears] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        registrationNumber: "",
        programId: "",
        academicYearId: "",
        gender: "MALE",
        dateOfBirth: "",
        phoneNumber: "" // Added as likely required
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [studentRes, programRes, yearRes] = await Promise.all([
                StudentService.getAll({ limit: 100 }), // Get first 100 for now
                AcademicService.getPrograms(),
                AcademicService.getAcademicYears()
            ]);

            setStudents(studentRes.data || []);
            setPrograms(programRes.data || []);
            setAcademicYears(yearRes.data || []);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = async () => {
        try {
            // Basic validation
            if (!formData.firstName || !formData.email || !formData.registrationNumber) {
                alert("Please fill required fields");
                return;
            }

            // Backend expects specific date format or ISO string
            const payload = {
                ...formData,
                dateOfBirth: new Date(formData.dateOfBirth).toISOString() // Ensure Date
            };

            await StudentService.create(payload);
            setIsDialogOpen(false);
            fetchData(); // Refresh list
            // Reset form
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                registrationNumber: "",
                programId: "",
                academicYearId: "",
                gender: "MALE",
                dateOfBirth: "",
                phoneNumber: ""
            });
        } catch (error: any) {
            console.error("Create failed", error);
            alert("Failed to create student: " + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this student?")) return;
        try {
            await StudentService.delete(id);
            fetchData();
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    const filteredStudents = students.filter(
        (s) => (s.firstName + " " + s.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Students</h1>
                    <p className="text-slate-500">Manage student records and enrollments</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />Export
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />Add Student
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Add New Student</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">First Name</label>
                                        <Input
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            placeholder="John"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Last Name</label>
                                        <Input
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="student@university.edu"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Registration No</label>
                                    <Input
                                        value={formData.registrationNumber}
                                        onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                                        placeholder="REG2024001"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Date of Birth</label>
                                    <Input
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                    />
                                </div>
                                {/* Dropdowns for Program and Academic Year */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Program</label>
                                        <Select
                                            value={formData.programId}
                                            onValueChange={(val) => setFormData({ ...formData, programId: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Program" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {programs.map(p => (
                                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Year</label>
                                        <Select
                                            value={formData.academicYearId}
                                            onValueChange={(val) => setFormData({ ...formData, academicYearId: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Year" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicYears.map(y => (
                                                    <SelectItem key={y.id} value={y.id}>{y.year}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                    <Button onClick={handleCreate}>Save Student</Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by name or registration no..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline">
                            <Filter className="h-4 w-4 mr-2" />Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        All Students ({filteredStudents.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Enrollment No</TableHead>
                                <TableHead>Program</TableHead>
                                <TableHead>Year</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow key="loading">
                                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                        Loading students...
                                    </TableCell>
                                </TableRow>
                            ) : filteredStudents.length === 0 ? (
                                <TableRow key="empty">
                                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                        No students found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStudents.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{student.firstName} {student.lastName}</p>
                                                <p className="text-xs text-slate-500">{student.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">{student.registrationNumber}</TableCell>
                                        <TableCell>{student.programId?.name || "N/A"}</TableCell>
                                        <TableCell>{student.academicYearId?.year || "N/A"}</TableCell>
                                        <TableCell>
                                            <Badge variant={student.status === "ACTIVE" ? "default" : "secondary"}>
                                                {student.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => router.push(`/dashboard/students/${student.id}`)} className="cursor-pointer">
                                                        <Eye className="h-4 w-4 mr-2" />View Profile
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => handleDelete(student.id)}
                                                    >
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
        </div>
    );
}
