import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserService, User } from "@/lib/services/user.service";
import { AcademicService } from "@/lib/services/academic.service";
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
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
    Users, Search, Plus, Download, MoreHorizontal, Pencil, Trash2, Eye, 
    Upload, RefreshCw, Key, ShieldAlert, Ban, CheckCircle2, History
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ROLE_AUTHORITY } from "@/lib/constants";
import { Role, Department } from "@/lib/types";
import { toast } from "sonner";

export default function UsersPage() {
    const router = useRouter();
    const { user: currentUser, activeRole } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");

    // Dialog States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [importLoading, setImportLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form Data
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        role: "STUDENT" as Role,
        departmentId: ""
    });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await UserService.getAll();
            setUsers(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load user records");
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const data = await AcademicService.getDepartments();
            setDepartments(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchDepartments();
    }, []);

    // Filter roles that the current user is authorized to assign
    const assignableRoles = Object.keys(ROLE_AUTHORITY).filter(r => {
        if (!activeRole) return false;
        if (activeRole === 'SUPER_ADMIN') return true;
        return ROLE_AUTHORITY[r as Role] <= ROLE_AUTHORITY[activeRole];
    }) as Role[];

    const handleCreate = async () => {
        try {
            if (!formData.username || !formData.email || !formData.password) {
                toast.error("Required: username, email, password");
                return;
            }
            
            // HOD override: ensure department is correct
            const payload = { ...formData };
            if (activeRole === 'HOD') {
                payload.departmentId = currentUser?.departmentId || "";
            }

            await UserService.create(payload);
            toast.success("User provisioned successfully");
            setIsCreateOpen(false);
            fetchUsers();
            setFormData({ username: "", email: "", password: "", role: "STUDENT", departmentId: "" });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Provisioning failed");
        }
    };

    const handleEdit = async () => {
        if (!selectedUser) return;
        try {
            await UserService.update(selectedUser._id || selectedUser.id, {
                email: formData.email,
                role: formData.role,
                departmentId: formData.departmentId
            });
            toast.success("Identity updated");
            setIsEditOpen(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Update failed");
        }
    };

    const handleDelete = async () => {
        if (!selectedUser) return;
        try {
            await UserService.delete(selectedUser._id || selectedUser.id);
            toast.warning("User access revoked");
            setIsDeleteOpen(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (error) {
            toast.error("Deactivation failed");
        }
    };

    const handleBulkImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImportLoading(true);
        try {
            const result = await UserService.bulkImport(file);
            toast.success(`Onboarded ${result.success} users successfully. ${result.failed} failed.`);
            if (result.errors.length > 0) {
                console.warn("Import errors:", result.errors);
            }
            setIsBulkImportOpen(false);
            fetchUsers();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Bulk onboarding failed");
        } finally {
            setImportLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleStatusToggle = async (user: User) => {
        try {
            const newStatus = user.isActive ? 'suspended' : 'active';
            await UserService.updateStatus(user._id || user.id, newStatus);
            toast.info(`User ${newStatus === 'active' ? 'activated' : 'suspended'}`);
            fetchUsers();
        } catch (error) {
            toast.error("Status update failed");
        }
    };

    const handleResetPassword = async (userId: string) => {
        try {
            await UserService.resetPassword(userId);
            toast.success("Security reset initiated. User must change password at next login.");
        } catch (error) {
            toast.error("Reset failed");
        }
    };

    const openEdit = (user: User) => {
        setSelectedUser(user);
        setFormData({ 
            ...formData, 
            username: user.username, 
            email: user.email, 
            role: user.role as Role,
            departmentId: user.departmentId || "" 
        });
        setIsEditOpen(true);
    };

    const openDelete = (user: User) => {
        setSelectedUser(user);
        setIsDeleteOpen(true);
    };

    const filteredUsers = users.filter((u) => {
        const matchesSearch = (u.username + u.email + (u.departmentName || "")).toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === "all" || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">User Provisioning</h1>
                    <p className="text-slate-500">Manage institutional lifecycle and role hierarchy</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsBulkImportOpen(true)}>
                        <Upload className="h-4 w-4 mr-2" />Bulk Onboard
                    </Button>
                    <Button size="sm" onClick={() => setIsCreateOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="h-4 w-4 mr-2" />New Provisioning
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Users className="h-5 w-5" /></div>
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Entities</p>
                            <p className="text-xl font-bold">{users.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><CheckCircle2 className="h-5 w-5" /></div>
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Active Access</p>
                            <p className="text-xl font-bold text-emerald-600">{users.filter(u => u.isActive).length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><ShieldAlert className="h-5 w-5" /></div>
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Admin Layer</p>
                            <p className="text-xl font-bold">{users.filter(u => ROLE_AUTHORITY[u.role as Role] >= 60).length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-orange-50 rounded-lg text-orange-600"><RefreshCw className="h-5 w-5" /></div>
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Onboarding</p>
                            <p className="text-xl font-bold">{users.filter(u => !u.lastLogin).length}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input placeholder="Search by name, email, or department..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-48"><SelectValue placeholder="Filter by role" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                {assignableRoles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" onClick={fetchUsers} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></Button>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50">
                                <TableHead className="font-bold">Identity</TableHead>
                                <TableHead className="font-bold">Governance</TableHead>
                                <TableHead className="font-bold">Department</TableHead>
                                <TableHead className="font-bold">Status</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow key="loading">
                                    <TableCell colSpan={5} className="text-center py-20 text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <RefreshCw className="h-8 w-8 animate-spin" />
                                            <p>Scanning institutional records...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.length === 0 ? (
                                <TableRow key="empty">
                                    <TableCell colSpan={5} className="text-center py-20 text-slate-400">No matching user identities found.</TableCell>
                                </TableRow>
                            ) : filteredUsers.map((user) => (
                                <TableRow key={user._id || user.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900">{user.username}</span>
                                            <span className="text-xs text-slate-500">{user.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`font-mono text-[10px] tracking-wider uppercase ${ROLE_AUTHORITY[user.role as Role] >= 60 ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : ''}`}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm font-medium text-slate-600">{user.departmentName || "Institutional"}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.isActive ? "default" : "secondary"} className={user.isActive ? "bg-emerald-500" : ""}>
                                            {user.isActive ? "Authorized" : "Revoked"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl">
                                                <DropdownMenuItem onClick={() => router.push(`/dashboard/users/${user._id || user.id}`)} className="rounded-lg gap-2 cursor-pointer">
                                                    <Eye className="h-4 w-4 text-slate-400" /> View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => openEdit(user)} className="rounded-lg gap-2 cursor-pointer">
                                                    <Pencil className="h-4 w-4 text-slate-400" /> Modify Identity
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleResetPassword(user._id || user.id)} className="rounded-lg gap-2 cursor-pointer">
                                                    <Key className="h-4 w-4 text-blue-400" /> Reset Credentials
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => router.push(`/dashboard/security/audit?userId=${user._id || user.id}`)} className="rounded-lg gap-2 cursor-pointer">
                                                    <History className="h-4 w-4 text-slate-400" /> Audit Trail
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleStatusToggle(user)} className={`rounded-lg gap-2 cursor-pointer ${user.isActive ? 'text-orange-600' : 'text-emerald-600'}`}>
                                                    {user.isActive ? <Ban className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                                    {user.isActive ? "Revoke Access" : "Restore Access"}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => openDelete(user)} className="text-red-600 rounded-lg gap-2 cursor-pointer font-bold">
                                                    <Trash2 className="h-4 w-4" /> Permanent Delete
                                                </DropdownMenuItem>
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
                <DialogContent className="max-w-md bg-white rounded-3xl p-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight">Provision Identity</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Username</label>
                            <Input placeholder="j.doe" className="rounded-xl" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Email</label>
                            <Input type="email" placeholder="john@university.edu" className="rounded-xl" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Temporary Password</label>
                            <Input type="password" placeholder="••••••••" className="rounded-xl" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Role Hierarchy</label>
                                <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v as Role })}>
                                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select role" /></SelectTrigger>
                                    <SelectContent>
                                        {assignableRoles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Department Scope</label>
                                <Select 
                                    disabled={activeRole === 'HOD'} 
                                    value={activeRole === 'HOD' ? currentUser?.departmentId : formData.departmentId} 
                                    onValueChange={(v) => setFormData({ ...formData, departmentId: v })}
                                >
                                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Institutional" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Institutional (Global)</SelectItem>
                                        {departments.map(dept => <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 pt-4">
                        <Button variant="ghost" onClick={() => setIsCreateOpen(false)} className="rounded-xl px-6">Cancel</Button>
                        <Button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 font-bold">Provision</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-md bg-white rounded-3xl p-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight">Modify Identity</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Username (Immutable)</label>
                            <Input disabled value={formData.username} className="rounded-xl bg-slate-50" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                            <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="rounded-xl" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Update Role</label>
                                <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v as Role })}>
                                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select role" /></SelectTrigger>
                                    <SelectContent>
                                        {assignableRoles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Department Scope</label>
                                <Select 
                                    disabled={activeRole === 'HOD'} 
                                    value={activeRole === 'HOD' ? currentUser?.departmentId : formData.departmentId} 
                                    onValueChange={(v) => setFormData({ ...formData, departmentId: v })}
                                >
                                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Institutional" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Institutional (Global)</SelectItem>
                                        {departments.map(dept => <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 pt-4">
                        <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="rounded-xl px-6">Cancel</Button>
                        <Button onClick={handleEdit} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 font-bold">Commit Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Import Dialog */}
            <Dialog open={isBulkImportOpen} onOpenChange={setIsBulkImportOpen}>
                <DialogContent className="max-w-md bg-white rounded-3xl p-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight">Institutional Onboarding</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-8">
                        <div 
                            className="border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center gap-4 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:scale-110 transition-transform">
                                <Upload className="h-8 w-8" />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-slate-900">Upload CSV Record</p>
                                <p className="text-xs text-slate-500 mt-1">name, email, role, departmentId</p>
                            </div>
                            <input 
                                type="file" 
                                accept=".csv" 
                                className="hidden" 
                                ref={fileInputRef} 
                                onChange={handleBulkImport} 
                                disabled={importLoading}
                            />
                        </div>
                        {importLoading && (
                            <div className="flex items-center justify-center gap-3 text-indigo-600 animate-pulse font-bold">
                                <RefreshCw className="h-5 w-5 animate-spin" />
                                <span>Provisioning bulk identities...</span>
                            </div>
                        )}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Instructions</h4>
                            <ul className="text-xs text-slate-600 space-y-1">
                                <li>• Role must match system enum (e.g., STUDENT, FACULTY)</li>
                                <li>• Department ID must match system ID for correct scoping</li>
                                <li>• Passwords will be generated as 'EduCore@123' by default</li>
                            </ul>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsBulkImportOpen(false)} className="rounded-xl w-full">Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="max-w-md bg-white rounded-3xl p-8">
                    <DialogHeader><DialogTitle className="text-xl font-black uppercase">Revoke Access</DialogTitle></DialogHeader>
                    <div className="py-6">
                        <p className="text-slate-600">Are you sure you want to permanently revoke access for <strong className="text-slate-900">{selectedUser?.username}</strong>?</p>
                        <p className="text-xs text-red-500 mt-2 font-bold uppercase tracking-tighter flex items-center gap-1">
                            <ShieldAlert className="h-3 w-3" /> This action will terminate all active sessions and archive records.
                        </p>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} className="rounded-xl px-6">Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} className="rounded-xl px-8 font-bold">Revoke Access</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
