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
import { GraduationCap, Search, Plus, MoreHorizontal, Pencil, Trash2, Loader2, RefreshCw } from "lucide-react";
import { AcademicService } from "@/lib/services/academic.service";

interface Department {
    _id: string;
    name: string;
    code: string;
}

interface Program {
    _id: string;
    name: string;
    code: string;
    departmentId: Department | string; // Backend might populate
    type: "BACHELOR" | "MASTER" | "DIPLOMA" | "PHD";
    totalSemesters: number;
    description?: string;
}

export default function ProgramsPage() {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Dialog States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<Program | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        departmentId: "",
        totalSemesters: 8,
        type: "BACHELOR" as "BACHELOR" | "MASTER" | "DIPLOMA" | "PHD"
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [progsRes, deptsRes] = await Promise.all([
                AcademicService.getPrograms({ limit: 100 }), // Fetch all for now
                AcademicService.getDepartments({ limit: 100 })
            ]);
            setPrograms(progsRes.data || []);
            setDepartments(deptsRes.data || []);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filtered = programs.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreate = async () => {
        if (!formData.departmentId) {
            alert("Please select a department");
            return;
        }
        setActionLoading(true);
        try {
            await AcademicService.createProgram(formData);
            await fetchData();
            setIsCreateOpen(false);
            setFormData({ name: "", code: "", departmentId: "", totalSemesters: 8, type: "BACHELOR" });
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to create program");
        } finally {
            setActionLoading(false);
        }
    };

    const handleEdit = async () => {
        if (!selected) return;
        setActionLoading(true);
        try {
            await AcademicService.updateProgram(selected._id, formData);
            await fetchData();
            setIsEditOpen(false);
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to update program");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selected) return;
        setActionLoading(true);
        try {
            await AcademicService.deleteProgram(selected._id);
            await fetchData();
            setIsDeleteOpen(false);
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to delete program");
        } finally {
            setActionLoading(false);
        }
    };

    const openEdit = (prog: Program) => {
        setSelected(prog);
        setFormData({
            name: prog.name,
            code: prog.code,
            departmentId: typeof prog.departmentId === 'object' ? prog.departmentId._id : prog.departmentId,
            totalSemesters: prog.totalSemesters,
            type: prog.type
        });
        setIsEditOpen(true);
    };

    const getDeptName = (deptId: string | Department) => {
        if (typeof deptId === 'object') return deptId.name;
        const dept = departments.find(d => d._id === deptId);
        return dept ? dept.name : "Unknown Dept";
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Programs</h1>
                    <p className="text-slate-500">Manage academic degrees and programs.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />Add Program
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-sm text-slate-500 font-medium">Total Programs</p>
                        <p className="text-2xl font-bold mt-1">{programs.length}</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-sm text-slate-500 font-medium">Bachelor's</p>
                        <p className="text-2xl font-bold mt-1 text-blue-600">{programs.filter(p => p.type === "BACHELOR").length}</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-sm text-slate-500 font-medium">Master's</p>
                        <p className="text-2xl font-bold mt-1 text-purple-600">{programs.filter(p => p.type === "MASTER").length}</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-sm text-slate-500 font-medium">PhD</p>
                        <p className="text-2xl font-bold mt-1 text-orange-600">{programs.filter(p => p.type === "PHD").length}</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search programs by name or code..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-blue-600" />
                        All Programs
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Program Name</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Semesters</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">Loading programs...</TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-slate-500">No programs found.</TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((prog) => (
                                    <TableRow key={prog._id}>
                                        <TableCell className="font-medium">{prog.name}</TableCell>
                                        <TableCell><Badge variant="outline">{prog.code}</Badge></TableCell>
                                        <TableCell>{getDeptName(prog.departmentId)}</TableCell>
                                        <TableCell>{prog.totalSemesters}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                prog.type === 'BACHELOR' ? 'default' :
                                                    prog.type === 'MASTER' ? 'secondary' :
                                                        'outline'
                                            }>
                                                {prog.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openEdit(prog)}>
                                                        <Pencil className="h-4 w-4 mr-2" />Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => { setSelected(prog); setIsDeleteOpen(true); }} className="text-red-600">
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Program</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Program Name</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="B.Tech Computer Science"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Program Code</label>
                                <Input
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    placeholder="BTCS"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Semesters</label>
                                <Input
                                    type="number"
                                    value={formData.totalSemesters}
                                    onChange={(e) => setFormData({ ...formData, totalSemesters: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Department</label>
                                <Select value={formData.departmentId} onValueChange={(v) => setFormData({ ...formData, departmentId: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map(d => (
                                            <SelectItem key={d._id} value={d._id}>{d.name} ({d.code})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Type</label>
                                <Select value={formData.type} onValueChange={(v: any) => setFormData({ ...formData, type: v })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BACHELOR">Bachelor's (UG)</SelectItem>
                                        <SelectItem value="MASTER">Master's (PG)</SelectItem>
                                        <SelectItem value="PHD">PhD</SelectItem>
                                        <SelectItem value="DIPLOMA">Diploma</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={actionLoading}>
                            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Program
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Program</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Program Name</label>
                            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Code</label>
                                <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Semesters</label>
                                <Input type="number" value={formData.totalSemesters} onChange={(e) => setFormData({ ...formData, totalSemesters: parseInt(e.target.value) })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Department</label>
                                <Select value={formData.departmentId} onValueChange={(v) => setFormData({ ...formData, departmentId: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>{departments.map(d => <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Type</label>
                                <Select value={formData.type} onValueChange={(v: any) => setFormData({ ...formData, type: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BACHELOR">Bachelor</SelectItem>
                                        <SelectItem value="MASTER">Master</SelectItem>
                                        <SelectItem value="PHD">PhD</SelectItem>
                                        <SelectItem value="DIPLOMA">Diploma</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
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
                    <DialogHeader>
                        <DialogTitle>Delete Program</DialogTitle>
                    </DialogHeader>
                    <p className="py-4">Are you sure you want to delete <strong>{selected?.name}</strong>? This action cannot be undone.</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>
                            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete Program
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

