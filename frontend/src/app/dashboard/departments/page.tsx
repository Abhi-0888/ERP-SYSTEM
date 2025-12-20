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
import { Building, Search, Plus, MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";

interface Department {
    id: string;
    name: string;
    code: string;
    hodName: string;
    facultyCount: number;
    studentCount: number;
    status: "active" | "inactive";
}

const initialDepartments: Department[] = [
    { id: "1", name: "Computer Science", code: "CSE", hodName: "Dr. Priya Sharma", facultyCount: 25, studentCount: 450, status: "active" },
    { id: "2", name: "Electronics & Communication", code: "ECE", hodName: "Dr. Ramesh Kumar", facultyCount: 20, studentCount: 380, status: "active" },
    { id: "3", name: "Mechanical Engineering", code: "MECH", hodName: "Dr. Suresh Patel", facultyCount: 18, studentCount: 320, status: "active" },
    { id: "4", name: "Civil Engineering", code: "CIVIL", hodName: "Dr. Anita Reddy", facultyCount: 15, studentCount: 280, status: "active" },
    { id: "5", name: "Electrical Engineering", code: "EEE", hodName: "Dr. Vinod Singh", facultyCount: 16, studentCount: 300, status: "active" },
    { id: "6", name: "Information Technology", code: "IT", hodName: "Dr. Kavitha Menon", facultyCount: 22, studentCount: 400, status: "active" },
];

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState<Department[]>(initialDepartments);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<Department | null>(null);
    const [formData, setFormData] = useState({ name: "", code: "", hodName: "" });

    const filtered = departments.filter((d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreate = () => {
        const newDept: Department = {
            id: Date.now().toString(),
            name: formData.name,
            code: formData.code,
            hodName: formData.hodName,
            facultyCount: 0,
            studentCount: 0,
            status: "active",
        };
        setDepartments([...departments, newDept]);
        setFormData({ name: "", code: "", hodName: "" });
        setIsCreateOpen(false);
    };

    const handleEdit = () => {
        if (!selected) return;
        setDepartments(departments.map((d) => d.id === selected.id ? { ...d, ...formData } : d));
        setIsEditOpen(false);
        setSelected(null);
    };

    const handleDelete = () => {
        if (!selected) return;
        setDepartments(departments.filter((d) => d.id !== selected.id));
        setIsDeleteOpen(false);
        setSelected(null);
    };

    const openEdit = (dept: Department) => {
        setSelected(dept);
        setFormData({ name: dept.name, code: dept.code, hodName: dept.hodName });
        setIsEditOpen(true);
    };

    const totalFaculty = departments.reduce((a, d) => a + d.facultyCount, 0);
    const totalStudents = departments.reduce((a, d) => a + d.studentCount, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Departments</h1>
                    <p className="text-slate-500">Manage academic departments</p>
                </div>
                <Button size="sm" onClick={() => setIsCreateOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Department</Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-sm text-slate-500">Departments</p><p className="text-2xl font-bold">{departments.length}</p></CardContent></Card>
                <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-sm text-slate-500">Total Faculty</p><p className="text-2xl font-bold">{totalFaculty}</p></CardContent></Card>
                <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-sm text-slate-500">Total Students</p><p className="text-2xl font-bold">{totalStudents}</p></CardContent></Card>
                <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-sm text-slate-500">Active</p><p className="text-2xl font-bold text-green-600">{departments.filter(d => d.status === "active").length}</p></CardContent></Card>
            </div>

            <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                    <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="Search departments..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Building className="h-5 w-5" />All Departments</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Department</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>HOD</TableHead>
                                <TableHead>Faculty</TableHead>
                                <TableHead>Students</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((dept) => (
                                <TableRow key={dept.id}>
                                    <TableCell className="font-medium">{dept.name}</TableCell>
                                    <TableCell><Badge variant="outline">{dept.code}</Badge></TableCell>
                                    <TableCell>{dept.hodName}</TableCell>
                                    <TableCell>{dept.facultyCount}</TableCell>
                                    <TableCell>{dept.studentCount}</TableCell>
                                    <TableCell><Badge variant={dept.status === "active" ? "default" : "secondary"}>{dept.status}</Badge></TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openEdit(dept)}><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => { setSelected(dept); setIsDeleteOpen(true); }} className="text-red-600"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
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
                    <DialogHeader><DialogTitle>Add Department</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2"><label className="text-sm font-medium">Department Name</label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Computer Science" /></div>
                        <div className="space-y-2"><label className="text-sm font-medium">Code</label><Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="CSE" /></div>
                        <div className="space-y-2"><label className="text-sm font-medium">HOD Name</label><Input value={formData.hodName} onChange={(e) => setFormData({ ...formData, hodName: e.target.value })} placeholder="Dr. Name" /></div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button><Button onClick={handleCreate}>Create</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Department</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2"><label className="text-sm font-medium">Department Name</label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
                        <div className="space-y-2"><label className="text-sm font-medium">Code</label><Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} /></div>
                        <div className="space-y-2"><label className="text-sm font-medium">HOD Name</label><Input value={formData.hodName} onChange={(e) => setFormData({ ...formData, hodName: e.target.value })} /></div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button><Button onClick={handleEdit}>Save Changes</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete Department</DialogTitle></DialogHeader>
                    <p className="py-4">Are you sure you want to delete <strong>{selected?.name}</strong>?</p>
                    <DialogFooter><Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
