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
import { Users, Search, Plus, MoreHorizontal, Pencil, Trash2, BookOpen, Award } from "lucide-react";

interface Faculty {
    id: string;
    name: string;
    email: string;
    employeeId: string;
    department: string;
    designation: "Professor" | "Associate Professor" | "Assistant Professor" | "Lecturer";
    specialization: string;
    experience: number;
    courses: number;
    status: "active" | "on_leave" | "inactive";
}

const initialFaculty: Faculty[] = [
    { id: "1", name: "Dr. Priya Sharma", email: "priya@srm.edu", employeeId: "FAC001", department: "CSE", designation: "Professor", specialization: "Machine Learning", experience: 15, courses: 3, status: "active" },
    { id: "2", name: "Prof. Arun Singh", email: "arun@srm.edu", employeeId: "FAC002", department: "CSE", designation: "Associate Professor", specialization: "Data Structures", experience: 12, courses: 4, status: "active" },
    { id: "3", name: "Dr. Ramesh Kumar", email: "ramesh@srm.edu", employeeId: "FAC003", department: "ECE", designation: "Professor", specialization: "VLSI Design", experience: 18, courses: 2, status: "active" },
    { id: "4", name: "Dr. Kavitha Menon", email: "kavitha@srm.edu", employeeId: "FAC004", department: "IT", designation: "Assistant Professor", specialization: "Web Technologies", experience: 8, courses: 3, status: "active" },
    { id: "5", name: "Mr. Suresh Patel", email: "suresh@srm.edu", employeeId: "FAC005", department: "CSE", designation: "Lecturer", specialization: "Databases", experience: 5, courses: 2, status: "on_leave" },
    { id: "6", name: "Dr. Vinod Singh", email: "vinod@srm.edu", employeeId: "FAC006", department: "EEE", designation: "Associate Professor", specialization: "Power Systems", experience: 10, courses: 3, status: "active" },
];

const departments = ["CSE", "ECE", "MECH", "CIVIL", "EEE", "IT"];
const designations: Faculty["designation"][] = ["Professor", "Associate Professor", "Assistant Professor", "Lecturer"];

export default function FacultyPage() {
    const [faculty, setFaculty] = useState<Faculty[]>(initialFaculty);
    const [searchQuery, setSearchQuery] = useState("");
    const [deptFilter, setDeptFilter] = useState<string>("all");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<Faculty | null>(null);
    const [formData, setFormData] = useState({ name: "", email: "", employeeId: "", department: "", designation: "Assistant Professor" as Faculty["designation"], specialization: "", experience: 0 });

    const filtered = faculty.filter((f) => {
        const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = deptFilter === "all" || f.department === deptFilter;
        return matchesSearch && matchesDept;
    });

    const handleCreate = () => {
        const newFac: Faculty = { id: Date.now().toString(), ...formData, courses: 0, status: "active" };
        setFaculty([...faculty, newFac]);
        setFormData({ name: "", email: "", employeeId: "", department: "", designation: "Assistant Professor", specialization: "", experience: 0 });
        setIsCreateOpen(false);
    };

    const handleEdit = () => {
        if (!selected) return;
        setFaculty(faculty.map((f) => f.id === selected.id ? { ...f, ...formData } : f));
        setIsEditOpen(false);
    };

    const handleDelete = () => {
        if (!selected) return;
        setFaculty(faculty.filter((f) => f.id !== selected.id));
        setIsDeleteOpen(false);
    };

    const openEdit = (fac: Faculty) => {
        setSelected(fac);
        setFormData({ name: fac.name, email: fac.email, employeeId: fac.employeeId, department: fac.department, designation: fac.designation, specialization: fac.specialization, experience: fac.experience });
        setIsEditOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div><h1 className="text-2xl font-bold">Faculty</h1><p className="text-slate-500">Manage faculty members</p></div>
                <Button size="sm" onClick={() => setIsCreateOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Faculty</Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><Users className="h-5 w-5 text-blue-600" /></div><div><p className="text-sm text-slate-500">Total Faculty</p><p className="text-xl font-bold">{faculty.length}</p></div></div></CardContent></Card>
                <Card className="border-0 shadow-sm"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-green-100 rounded-lg"><Award className="h-5 w-5 text-green-600" /></div><div><p className="text-sm text-slate-500">Professors</p><p className="text-xl font-bold">{faculty.filter(f => f.designation === "Professor").length}</p></div></div></CardContent></Card>
                <Card className="border-0 shadow-sm"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-purple-100 rounded-lg"><BookOpen className="h-5 w-5 text-purple-600" /></div><div><p className="text-sm text-slate-500">Active Courses</p><p className="text-xl font-bold">{faculty.reduce((a, f) => a + f.courses, 0)}</p></div></div></CardContent></Card>
                <Card className="border-0 shadow-sm"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-orange-100 rounded-lg"><Users className="h-5 w-5 text-orange-600" /></div><div><p className="text-sm text-slate-500">On Leave</p><p className="text-xl font-bold">{faculty.filter(f => f.status === "on_leave").length}</p></div></div></CardContent></Card>
            </div>

            <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="Search faculty..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
                        <Select value={deptFilter} onValueChange={setDeptFilter}>
                            <SelectTrigger className="w-40"><SelectValue placeholder="Department" /></SelectTrigger>
                            <SelectContent><SelectItem value="all">All Depts</SelectItem>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5" />All Faculty ({filtered.length})</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Faculty</TableHead>
                                <TableHead>Employee ID</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Designation</TableHead>
                                <TableHead>Specialization</TableHead>
                                <TableHead>Experience</TableHead>
                                <TableHead>Courses</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((fac) => (
                                <TableRow key={fac.id}>
                                    <TableCell><div><p className="font-medium">{fac.name}</p><p className="text-xs text-slate-500">{fac.email}</p></div></TableCell>
                                    <TableCell><Badge variant="outline">{fac.employeeId}</Badge></TableCell>
                                    <TableCell>{fac.department}</TableCell>
                                    <TableCell>{fac.designation}</TableCell>
                                    <TableCell>{fac.specialization}</TableCell>
                                    <TableCell>{fac.experience} yrs</TableCell>
                                    <TableCell>{fac.courses}</TableCell>
                                    <TableCell><Badge variant={fac.status === "active" ? "default" : fac.status === "on_leave" ? "secondary" : "destructive"}>{fac.status}</Badge></TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openEdit(fac)}><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => { setSelected(fac); setIsDeleteOpen(true); }} className="text-red-600"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
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
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Add Faculty</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><label className="text-sm font-medium">Full Name</label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
                            <div className="space-y-2"><label className="text-sm font-medium">Employee ID</label><Input value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} /></div>
                        </div>
                        <div className="space-y-2"><label className="text-sm font-medium">Email</label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><label className="text-sm font-medium">Department</label>
                                <Select value={formData.department} onValueChange={(v) => setFormData({ ...formData, department: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
                            </div>
                            <div className="space-y-2"><label className="text-sm font-medium">Designation</label>
                                <Select value={formData.designation} onValueChange={(v: Faculty["designation"]) => setFormData({ ...formData, designation: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{designations.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><label className="text-sm font-medium">Specialization</label><Input value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} /></div>
                            <div className="space-y-2"><label className="text-sm font-medium">Experience (years)</label><Input type="number" value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) })} /></div>
                        </div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button><Button onClick={handleCreate}>Create</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Edit Faculty</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><label className="text-sm font-medium">Full Name</label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
                            <div className="space-y-2"><label className="text-sm font-medium">Employee ID</label><Input value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} /></div>
                        </div>
                        <div className="space-y-2"><label className="text-sm font-medium">Email</label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><label className="text-sm font-medium">Specialization</label><Input value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} /></div>
                            <div className="space-y-2"><label className="text-sm font-medium">Experience</label><Input type="number" value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) })} /></div>
                        </div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button><Button onClick={handleEdit}>Save</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete Faculty</DialogTitle></DialogHeader>
                    <p className="py-4">Delete <strong>{selected?.name}</strong>?</p>
                    <DialogFooter><Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
