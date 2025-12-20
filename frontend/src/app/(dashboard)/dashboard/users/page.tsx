"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserService, User } from "@/lib/services/user.service";
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
    Users, Search, Plus, Download, MoreHorizontal, Pencil, Trash2, Eye
} from "lucide-react";

// Use role enum array from backend/common/enums/role.enum if possible, for now hardcode matches
const roles = [
    "SUPER_ADMIN", "UNIVERSITY_ADMIN", "REGISTRAR", "HOD", "FACULTY",
    "STUDENT", "LIBRARIAN", "ACCOUNTANT", "HOSTEL_WARDEN", "PLACEMENT_OFFICER"
];

export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");

    // Dialog States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Form Data - Added password for creation
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        role: "STUDENT",
        department: ""
    });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await UserService.getAll();
            setUsers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreate = async () => {
        try {
            if (!formData.username || !formData.email || !formData.password) {
                alert("Please fill required fields (username, email, password)");
                return;
            }
            await UserService.create(formData);
            setIsCreateOpen(false);
            fetchUsers();
            // Reset form
            setFormData({ username: "", email: "", password: "", role: "STUDENT", department: "" });
        } catch (error: any) {
            console.error("Create failed", error);
            alert("Failed to create user: " + (error.response?.data?.message || "Unknown error"));
        }
    };

    const handleEdit = async () => {
        if (!selectedUser) return;
        try {
            await UserService.update(selectedUser._id || selectedUser.id, {
                email: formData.email,
            });
            setIsEditOpen(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (error) {
            console.error("Update failed", error);
        }
    };

    const handleDelete = async () => {
        if (!selectedUser) return;
        try {
            await UserService.delete(selectedUser._id || selectedUser.id);
            setIsDeleteOpen(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    const openEdit = (user: User) => {
        setSelectedUser(user);
        setFormData({ ...formData, username: user.username, email: user.email, role: user.role });
        setIsEditOpen(true);
    };

    const openDelete = (user: User) => {
        setSelectedUser(user);
        setIsDeleteOpen(true);
    };

    const filteredUsers = users.filter((u) => {
        const matchesSearch = (u.username + u.email).toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === "all" || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Users</h1>
                    <p className="text-slate-500">Manage all system users</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
                    <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />Add User
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-sm text-slate-500">Total Users</p>
                        <p className="text-2xl font-bold">{users.length}</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-sm text-slate-500">Active</p>
                        <p className="text-2xl font-bold text-green-600">{users.filter(u => u.isActive).length}</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-sm text-slate-500">Faculty</p>
                        <p className="text-2xl font-bold">{users.filter(u => u.role === "FACULTY").length}</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-sm text-slate-500">Students</p>
                        <p className="text-2xl font-bold">{users.filter(u => u.role === "STUDENT").length}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input placeholder="Search users..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-48"><SelectValue placeholder="Filter by role" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                {roles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5" />All Users ({filteredUsers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Username</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow key="loading">
                                    <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                                </TableRow>
                            ) : filteredUsers.map((user) => (
                                <TableRow key={user._id || user.id}>
                                    <TableCell className="font-medium">{user.username}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                                    <TableCell><Badge variant={user.isActive ? "default" : "secondary"}>{user.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => router.push(`/dashboard/users/${user._id || user.id}`)} className="cursor-pointer">
                                                    <Eye className="h-4 w-4 mr-2" />View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => openEdit(user)} className="cursor-pointer">
                                                    <Pencil className="h-4 w-4 mr-2" />Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => openDelete(user)} className="text-red-600 cursor-pointer">
                                                    <Trash2 className="h-4 w-4 mr-2" />Delete
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
                <DialogContent>
                    <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2"><label className="text-sm font-medium">Username</label><Input value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} /></div>
                        <div className="space-y-2"><label className="text-sm font-medium">Email</label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
                        <div className="space-y-2"><label className="text-sm font-medium">Password</label><Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} /></div>
                        <div className="space-y-2"><label className="text-sm font-medium">Role</label>
                            <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                                <SelectContent>{roles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button><Button onClick={handleCreate}>Create User</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2"><label className="text-sm font-medium">Username</label><Input disabled value={formData.username} /></div>
                        <div className="space-y-2"><label className="text-sm font-medium">Email</label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button><Button onClick={handleEdit}>Save Changes</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete User</DialogTitle></DialogHeader>
                    <p className="py-4">Are you sure you want to delete <strong>{selectedUser?.username}</strong>? This action cannot be undone.</p>
                    <DialogFooter><Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
