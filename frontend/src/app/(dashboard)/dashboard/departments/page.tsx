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
import { Building, Search, Plus, MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import { AcademicService } from "@/lib/services/academic.service";
import { toast } from "sonner";

interface Department {
    _id: string;
    name: string;
    code: string;
    hodId?: {
        username: string;
        email: string;
    };
    description?: string;
    isActive: boolean;
}

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<Department | null>(null);
    const [formData, setFormData] = useState({ name: "", code: "", description: "" });

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const response = await AcademicService.getDepartments();
            setDepartments(response.data || []);
        } catch (error) {
            console.error("Failed to fetch departments", error);
            toast.error("Failed to load departments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const filtered = departments.filter((d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreate = async () => {
        try {
            await AcademicService.createDepartment(formData);
            toast.success("Department created successfully");
            setIsCreateOpen(false);
            setFormData({ name: "", code: "", description: "" });
            fetchDepartments();
        } catch (error) {
            toast.error("Failed to create department");
        }
    };

    const handleEdit = async () => {
        if (!selected) return;
        try {
            await AcademicService.updateDepartment(selected._id, formData);
            toast.success("Department updated successfully");
            setIsEditOpen(false);
            setSelected(null);
            fetchDepartments();
        } catch (error) {
            toast.error("Failed to update department");
        }
    };

    const handleDelete = async () => {
        if (!selected) return;
        try {
            await AcademicService.deleteDepartment(selected._id);
            toast.success("Department deleted successfully");
            setIsDeleteOpen(false);
            setSelected(null);
            fetchDepartments();
        } catch (error) {
            toast.error("Failed to delete department");
        }
    };

    const openEdit = (dept: Department) => {
        setSelected(dept);
        setFormData({ name: dept.name, code: dept.code, description: dept.description || "" });
        setIsEditOpen(true);
    };

    if (loading) return (
        <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
    );

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
                <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-sm text-slate-500">Active</p><p className="text-2xl font-bold text-green-600">{departments.filter(d => d.isActive).length}</p></CardContent></Card>
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
                                <TableHead>Status</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length > 0 ? (
                                filtered.map((dept) => (
                                    <TableRow key={dept._id}>
                                        <TableCell className="font-medium">{dept.name}</TableCell>
                                        <TableCell><Badge variant="outline">{dept.code}</Badge></TableCell>
                                        <TableCell>{dept.hodId?.username || "Not Assigned"}</TableCell>
                                        <TableCell><Badge variant={dept.isActive ? "default" : "secondary"}>{dept.isActive ? "Active" : "Inactive"}</Badge></TableCell>
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
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-slate-500">No departments found</TableCell>
                                </TableRow>
                            )}
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
                        <div className="space-y-2"><label className="text-sm font-medium">Description</label><Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Department description..." /></div>
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
                        <div className="space-y-2"><label className="text-sm font-medium">Description</label><Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
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
