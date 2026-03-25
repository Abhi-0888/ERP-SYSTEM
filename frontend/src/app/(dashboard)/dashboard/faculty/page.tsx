"use client";

import { useState, useEffect } from "react";
import { UserService } from "@/lib/services/user.service";
import { AcademicService } from "@/lib/services/academic.service";
import { User } from "@/lib/types";
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
import {
    Users, Search, Plus, MoreHorizontal, Pencil, Trash2, BookOpen, Award,
    Loader2, CheckCircle, Copy, ShieldCheck, UserCheck
} from "lucide-react";
import { toast } from "sonner";

interface FacultyData {
    id: string;
    name: string;
    email: string;
    employeeId: string;
    department: string;
    status: "active" | "on_leave" | "inactive";
    originalUser?: User;
}

export default function FacultyPage() {
    const [faculty, setFaculty] = useState<FacultyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [saving, setSaving] = useState(false);

    // Dialogs
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<FacultyData | null>(null);

    // Departments from API
    const [departments, setDepartments] = useState<any[]>([]);

    // Credentials dialog
    const [credentialsDialog, setCredentialsDialog] = useState(false);
    const [generatedCredentials, setGeneratedCredentials] = useState<{
        username: string; password: string; facultyName: string;
    } | null>(null);

    const [formData, setFormData] = useState({
        name: "", email: "", employeeId: "", departmentId: "", phoneNumber: "",
    });

    const fetchFaculty = async () => {
        setLoading(true);
        try {
            const [users, deptRes] = await Promise.all([
                UserService.getByRole('FACULTY'),
                AcademicService.getDepartments(),
            ]);
            setDepartments(deptRes.data || []);

            const mapped: FacultyData[] = users.map(u => ({
                id: u.id || u._id,
                name: u.name || u.username,
                email: u.email || "N/A",
                employeeId: u.username || "N/A",
                department: (u as any).departmentId?.name || (u as any).departmentName || "N/A",
                status: u.isActive ? "active" : "inactive",
                originalUser: u,
            }));
            setFaculty(mapped);
        } catch (error) {
            console.error("Failed to fetch faculty", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaculty();
    }, []);

    const filtered = faculty.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const resetForm = () => {
        setFormData({ name: "", email: "", employeeId: "", departmentId: "", phoneNumber: "" });
    };

    const handleCreate = async () => {
        if (!formData.name || !formData.email) {
            toast.error("Name and Email are required");
            return;
        }
        setSaving(true);
        try {
            // Auto-generate credentials
            const username = formData.employeeId || formData.email.split('@')[0];
            const tempPassword = 'Edu@' + Math.random().toString(36).substring(2, 10) + Math.floor(Math.random() * 10);

            await UserService.create({
                name: formData.name,
                username,
                email: formData.email,
                password: tempPassword,
                role: 'FACULTY',
                departmentId: formData.departmentId || undefined,
                phoneNumber: formData.phoneNumber || undefined,
                isActive: true,
            } as any);

            setIsCreateOpen(false);
            resetForm();

            // Show credentials dialog
            setGeneratedCredentials({
                username,
                password: tempPassword,
                facultyName: formData.name,
            });
            setCredentialsDialog(true);

            fetchFaculty();
            toast.success("Faculty enrolled successfully!");
        } catch (error: any) {
            console.error("Creation failed", error);
            toast.error(error.response?.data?.message || "Failed to create faculty");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = async () => {
        if (!selected) return;
        try {
            await UserService.update(selected.id, {
                name: formData.name,
                email: formData.email,
            });
            setIsEditOpen(false);
            fetchFaculty();
            toast.success("Faculty updated");
        } catch (error) {
            console.error("Update failed", error);
            toast.error("Failed to update faculty");
        }
    };

    const handleDelete = async () => {
        if (!selected) return;
        try {
            await UserService.delete(selected.id);
            setIsDeleteOpen(false);
            fetchFaculty();
            toast.success("Faculty removed");
        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Failed to delete faculty");
        }
    };

    const openEdit = (fac: FacultyData) => {
        setSelected(fac);
        setFormData({
            name: fac.name, email: fac.email, employeeId: fac.employeeId,
            departmentId: "", phoneNumber: "",
        });
        setIsEditOpen(true);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Faculty</h1>
                    <p className="text-slate-500">Enroll and manage faculty members</p>
                </div>
                <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />Enroll Faculty
                </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg"><Users className="h-5 w-5 text-blue-600" /></div>
                            <div><p className="text-sm text-slate-500">Total Faculty</p><p className="text-xl font-bold">{faculty.length}</p></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg"><UserCheck className="h-5 w-5 text-green-600" /></div>
                            <div><p className="text-sm text-slate-500">Active</p><p className="text-xl font-bold">{faculty.filter(f => f.status === "active").length}</p></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg"><Users className="h-5 w-5 text-orange-600" /></div>
                            <div><p className="text-sm text-slate-500">Inactive</p><p className="text-xl font-bold">{faculty.filter(f => f.status === "inactive").length}</p></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="Search faculty by name, ID or email..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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
                                <TableHead>Username</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow key="loading"><TableCell colSpan={5} className="text-center py-8">
                                    <div className="flex items-center justify-center gap-2 text-slate-500"><Loader2 className="h-5 w-5 animate-spin" /> Loading faculty...</div>
                                </TableCell></TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow key="empty"><TableCell colSpan={5} className="text-center py-8 text-slate-500">No faculty found. Click &quot;Enroll Faculty&quot; to add one.</TableCell></TableRow>
                            ) : (
                                filtered.map((fac) => (
                                    <TableRow key={fac.id}>
                                        <TableCell>
                                            <div><p className="font-medium">{fac.name}</p><p className="text-xs text-slate-500">{fac.email}</p></div>
                                        </TableCell>
                                        <TableCell><Badge variant="outline">{fac.employeeId}</Badge></TableCell>
                                        <TableCell>{fac.department}</TableCell>
                                        <TableCell>
                                            <Badge variant={fac.status === "active" ? "default" : "secondary"}>{fac.status}</Badge>
                                        </TableCell>
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
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserCheck className="h-5 w-5 text-blue-600" />
                            Enroll New Faculty
                        </DialogTitle>
                        <p className="text-sm text-slate-500 mt-1">
                            This will create a faculty account and generate login credentials automatically.
                        </p>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Full Name <span className="text-red-500">*</span></label>
                                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Dr. John Doe" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Employee ID</label>
                                <Input value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} placeholder="FAC001" />
                                <p className="text-xs text-slate-400">Used as the login username</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
                                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="faculty@university.edu" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Phone</label>
                                <Input value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} placeholder="9876543210" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Department</label>
                            <Select value={formData.departmentId} onValueChange={(v) => setFormData({ ...formData, departmentId: v })}>
                                <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                                <SelectContent>
                                    {departments.map(d => (
                                        <SelectItem key={d._id || d.id} value={d._id || d.id}>{d.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={saving}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Enroll & Generate Credentials
                        </Button>
                    </DialogFooter>
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
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button><Button onClick={handleEdit}>Save</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete Faculty</DialogTitle></DialogHeader>
                    <p className="py-4">Delete <strong>{selected?.name}</strong>? This action cannot be undone.</p>
                    <DialogFooter><Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ===== CREDENTIALS SUCCESS DIALOG ===== */}
            <Dialog open={credentialsDialog} onOpenChange={setCredentialsDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-green-700">
                            <CheckCircle className="h-6 w-6" />
                            Faculty Enrolled Successfully
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <p className="text-sm font-bold text-green-800 mb-1">{generatedCredentials?.facultyName}</p>
                            <p className="text-xs text-green-600">Login credentials have been generated. Please share them securely with the faculty member.</p>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Username</p>
                                    <p className="text-lg font-mono font-bold text-slate-900 mt-0.5">{generatedCredentials?.username}</p>
                                </div>
                                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(generatedCredentials?.username || "")}><Copy className="h-4 w-4" /></Button>
                            </div>
                            <div className="border-t border-slate-200" />
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Temporary Password</p>
                                    <p className="text-lg font-mono font-bold text-slate-900 mt-0.5">{generatedCredentials?.password}</p>
                                </div>
                                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(generatedCredentials?.password || "")}><Copy className="h-4 w-4" /></Button>
                            </div>
                        </div>

                        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
                            <p>The faculty member should change this password upon first login. These credentials will not be shown again.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            const text = `Username: ${generatedCredentials?.username}\nPassword: ${generatedCredentials?.password}`;
                            copyToClipboard(text);
                        }}>
                            <Copy className="h-4 w-4 mr-2" />Copy All
                        </Button>
                        <Button onClick={() => setCredentialsDialog(false)}>Done</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
