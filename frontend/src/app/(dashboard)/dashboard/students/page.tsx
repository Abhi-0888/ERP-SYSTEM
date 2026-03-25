"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StudentService } from "@/lib/services/student.service";
import { Student } from "@/lib/types";
import { AcademicService } from "@/lib/services/academic.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Search, Plus, Filter, Download, MoreHorizontal, Eye, Pencil, Trash2,
    GraduationCap, Loader2, CheckCircle, Copy, ShieldCheck
} from "lucide-react";
import { toast } from "sonner";

export default function StudentsPage() {
    const router = useRouter();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [saving, setSaving] = useState(false);

    // Form State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [programs, setPrograms] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [academicYears, setAcademicYears] = useState<any[]>([]);

    // Credentials dialog
    const [credentialsDialog, setCredentialsDialog] = useState(false);
    const [generatedCredentials, setGeneratedCredentials] = useState<{
        username: string; password: string; studentName: string;
    } | null>(null);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        registrationNumber: "",
        programId: "",
        departmentId: "",
        academicYearId: "",
        gender: "MALE",
        dateOfBirth: "",
        phoneNumber: "",
        batch: new Date().getFullYear().toString(),
        fatherName: "",
        guardianPhoneNumber: "",
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [studentRes, programRes, yearRes, deptRes] = await Promise.all([
                StudentService.getAll({ limit: 100 }),
                AcademicService.getPrograms(),
                AcademicService.getAcademicYears(),
                AcademicService.getDepartments(),
            ]);

            setStudents(studentRes.data || []);
            setPrograms(programRes.data || []);
            setAcademicYears(yearRes.data || []);
            setDepartments(deptRes.data || []);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const resetForm = () => {
        setFormData({
            firstName: "", lastName: "", email: "", registrationNumber: "",
            programId: "", departmentId: "", academicYearId: "", gender: "MALE",
            dateOfBirth: "", phoneNumber: "", batch: new Date().getFullYear().toString(),
            fatherName: "", guardianPhoneNumber: "",
        });
    };

    const handleEnroll = async () => {
        if (!formData.firstName || !formData.email || !formData.registrationNumber || !formData.departmentId) {
            toast.error("Please fill all required fields (Name, Email, Registration No, Department)");
            return;
        }
        setSaving(true);
        try {
            const payload = {
                ...formData,
                dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : undefined,
            };

            const result = await StudentService.enrollStudent(payload);
            setIsDialogOpen(false);
            resetForm();

            // Show credentials dialog
            setGeneratedCredentials({
                username: result.credentials.username,
                password: result.credentials.password,
                studentName: `${formData.firstName} ${formData.lastName}`,
            });
            setCredentialsDialog(true);

            fetchData(); // Refresh list
            toast.success("Student enrolled successfully!");
        } catch (error: any) {
            console.error("Enrollment failed", error);
            toast.error(error.response?.data?.message || "Failed to enroll student");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this student?")) return;
        try {
            await StudentService.delete(id);
            fetchData();
            toast.success("Student removed");
        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Failed to delete student");
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    const filteredStudents = students.filter(
        (s) => (s.firstName + " " + s.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.registrationNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Students</h1>
                    <p className="text-slate-500">Enroll and manage student records</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />Export
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />Enroll Student
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5 text-blue-600" />
                                    Enroll New Student
                                </DialogTitle>
                                <p className="text-sm text-slate-500 mt-1">
                                    This will create a student profile and generate login credentials automatically.
                                </p>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                {/* Personal Info */}
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Personal Information</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">First Name <span className="text-red-500">*</span></label>
                                        <Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} placeholder="John" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Last Name</label>
                                        <Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} placeholder="Doe" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
                                        <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="student@university.edu" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Phone</label>
                                        <Input value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} placeholder="9876543210" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Gender</label>
                                        <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="MALE">Male</SelectItem>
                                                <SelectItem value="FEMALE">Female</SelectItem>
                                                <SelectItem value="OTHER">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Date of Birth</label>
                                        <Input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} />
                                    </div>
                                </div>

                                {/* Academic Info */}
                                <div className="space-y-1 pt-2">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Academic Information</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Registration No <span className="text-red-500">*</span></label>
                                    <Input value={formData.registrationNumber} onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })} placeholder="REG2024001" />
                                    <p className="text-xs text-slate-400">This will also be used as the login username</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Department <span className="text-red-500">*</span></label>
                                        <Select value={formData.departmentId} onValueChange={(v) => setFormData({ ...formData, departmentId: v })}>
                                            <SelectTrigger><SelectValue placeholder="Select Dept" /></SelectTrigger>
                                            <SelectContent>
                                                {departments.map(d => (
                                                    <SelectItem key={d._id || d.id} value={d._id || d.id}>{d.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Program</label>
                                        <Select value={formData.programId} onValueChange={(v) => setFormData({ ...formData, programId: v })}>
                                            <SelectTrigger><SelectValue placeholder="Select Program" /></SelectTrigger>
                                            <SelectContent>
                                                {programs.map(p => (
                                                    <SelectItem key={p._id || p.id} value={p._id || p.id}>{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Academic Year</label>
                                        <Select value={formData.academicYearId} onValueChange={(v) => setFormData({ ...formData, academicYearId: v })}>
                                            <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
                                            <SelectContent>
                                                {academicYears.map(y => (
                                                    <SelectItem key={y._id || y.id} value={y._id || y.id}>{y.year}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Batch</label>
                                        <Input value={formData.batch} onChange={(e) => setFormData({ ...formData, batch: e.target.value })} placeholder="2024" />
                                    </div>
                                </div>

                                {/* Guardian Info */}
                                <div className="space-y-1 pt-2">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Guardian Details</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Father / Guardian Name</label>
                                        <Input value={formData.fatherName} onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })} placeholder="Guardian name" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Guardian Phone</label>
                                        <Input value={formData.guardianPhoneNumber} onChange={(e) => setFormData({ ...formData, guardianPhoneNumber: e.target.value })} placeholder="9876543210" />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleEnroll} disabled={saving}>
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Enroll & Generate Credentials
                                </Button>
                            </DialogFooter>
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
                                    <TableCell colSpan={6} className="text-center py-8">
                                        <div className="flex items-center justify-center gap-2 text-slate-500">
                                            <Loader2 className="h-5 w-5 animate-spin" /> Loading students...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredStudents.length === 0 ? (
                                <TableRow key="empty">
                                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                        No students found. Click &quot;Enroll Student&quot; to add one.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStudents.map((student: any) => (
                                    <TableRow key={student.id || student._id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{student.firstName} {student.lastName}</p>
                                                <p className="text-xs text-slate-500">{student.email || (student.userId as any)?.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">{student.enrollmentNo || student.registrationNumber}</TableCell>
                                        <TableCell>{student.programId?.name || "N/A"}</TableCell>
                                        <TableCell>{student.academicYearId?.year || "N/A"}</TableCell>
                                        <TableCell>
                                            <Badge variant={student.status === "Active" || student.status === "ACTIVE" ? "default" : "secondary"}>
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
                                                    <DropdownMenuItem onClick={() => router.push(`/dashboard/students/${student.id || student._id}`)} className="cursor-pointer">
                                                        <Eye className="h-4 w-4 mr-2" />View Profile
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => handleDelete((student.id || student._id) as string)}
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

            {/* ===== CREDENTIALS SUCCESS DIALOG ===== */}
            <Dialog open={credentialsDialog} onOpenChange={setCredentialsDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-green-700">
                            <CheckCircle className="h-6 w-6" />
                            Student Enrolled Successfully
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <p className="text-sm font-bold text-green-800 mb-1">
                                {generatedCredentials?.studentName}
                            </p>
                            <p className="text-xs text-green-600">
                                Login credentials have been generated. Please share them securely with the student.
                            </p>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Username</p>
                                    <p className="text-lg font-mono font-bold text-slate-900 mt-0.5">{generatedCredentials?.username}</p>
                                </div>
                                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(generatedCredentials?.username || "")}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="border-t border-slate-200" />
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Temporary Password</p>
                                    <p className="text-lg font-mono font-bold text-slate-900 mt-0.5">{generatedCredentials?.password}</p>
                                </div>
                                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(generatedCredentials?.password || "")}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
                            <p>The student should change this password upon first login. These credentials will not be shown again.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                const text = `Username: ${generatedCredentials?.username}\nPassword: ${generatedCredentials?.password}`;
                                copyToClipboard(text);
                            }}
                        >
                            <Copy className="h-4 w-4 mr-2" />Copy All
                        </Button>
                        <Button onClick={() => setCredentialsDialog(false)}>Done</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
