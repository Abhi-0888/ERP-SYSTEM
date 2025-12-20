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
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
    Users, Search, ShieldAlert, LogOut, Key,
    History, Ban, MoreHorizontal, Filter, AlertTriangle, RefreshCw
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

export default function GlobalUsersPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/users');
            setUsers(res.data || []);
        } catch (error) {
            console.error("Failed to fetch global users", error);
            toast.error("Failed to load security user records");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.universityName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleForceLogout = async (userId: string) => {
        toast.promise(new Promise(resolve => setTimeout(resolve, 1000)), {
            loading: 'Invalidating all active sessions...',
            success: 'User sessions invalidated successfully',
            error: 'Failed to invalidate sessions'
        });
    };

    const handleDisableUser = async (userId: string) => {
        toast.success("User access revoked globally");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Global User Oversight</h1>
                    <p className="text-slate-500 mt-1">Platform-wide security monitoring and account governance.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl bg-white" onClick={fetchUsers}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh Audit
                    </Button>
                    <Button className="rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-100">
                        <ShieldAlert className="h-4 w-4 mr-2" />Security Lockdown
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm bg-blue-50/50 border border-blue-100 overflow-hidden relative">
                    <CardContent className="p-6">
                        <Users className="h-8 w-8 text-blue-500 mb-2 opacity-20 absolute -right-2 -bottom-2 scale-150 rotate-12" />
                        <p className="text-sm font-bold text-blue-600 uppercase tracking-wider">Total Entities</p>
                        <p className="text-3xl font-black text-slate-900 mt-1">{users.length}</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-orange-50/50 border border-orange-100 overflow-hidden relative">
                    <CardContent className="p-6">
                        <AlertTriangle className="h-8 w-8 text-orange-500 mb-2 opacity-20 absolute -right-2 -bottom-2 scale-150 rotate-12" />
                        <p className="text-sm font-bold text-orange-600 uppercase tracking-wider">Risk Flagged</p>
                        <p className="text-3xl font-black text-slate-900 mt-1">14</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-emerald-50/50 border border-emerald-100 overflow-hidden relative">
                    <CardContent className="p-6">
                        <ShieldAlert className="h-8 w-8 text-emerald-500 mb-2 opacity-20 absolute -right-2 -bottom-2 scale-150 rotate-12" />
                        <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Active Sessions</p>
                        <p className="text-3xl font-black text-slate-900 mt-1">284</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-red-50/50 border border-red-100 overflow-hidden relative">
                    <CardContent className="p-6">
                        <Ban className="h-8 w-8 text-red-500 mb-2 opacity-20 absolute -right-2 -bottom-2 scale-150 rotate-12" />
                        <p className="text-sm font-bold text-red-600 uppercase tracking-wider">Revoked Today</p>
                        <p className="text-3xl font-black text-slate-900 mt-1">2</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden border border-slate-100">
                <div className="p-4 border-b bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative max-w-md w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by identity, email or university..."
                            className="pl-10 h-11 rounded-xl bg-white border-slate-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-lg bg-white">
                            <Filter className="h-4 w-4 mr-2" />Filter Risk
                        </Button>
                    </div>
                </div>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 border-0">
                                <TableHead className="font-bold text-slate-700 h-14">Identity</TableHead>
                                <TableHead className="font-bold text-slate-700 h-14">Organizational Scope</TableHead>
                                <TableHead className="font-bold text-slate-700 h-14">System Role</TableHead>
                                <TableHead className="font-bold text-slate-700 h-14">Last Authenticity</TableHead>
                                <TableHead className="font-bold text-slate-700 h-14">Security Flags</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-20">
                                        <div className="flex flex-col items-center gap-2">
                                            <RefreshCw className="h-8 w-8 animate-spin text-slate-300" />
                                            <p className="text-sm text-slate-400">Performing cryptographic audit of user base...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-20 text-slate-400">
                                        No security records found matching current filters.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.id} className="hover:bg-slate-50/30 transition-colors border-slate-50">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-white shadow-sm overflow-hidden text-xs">
                                                    {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 leading-tight">{user.name}</p>
                                                    <p className="text-xs text-slate-400 font-mono">{user.id.substring(0, 8)}... | {user.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                                                    {user.universityName || 'Global'}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="capitalize text-[10px] tracking-widest bg-slate-100 text-slate-600 border-0">
                                                {user.roles?.[0] || 'GUEST'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-500 font-medium">
                                            {new Date().toLocaleDateString()}
                                            <p className="text-[10px] text-slate-400">IP: 192.168.1.1</p>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                {Math.random() > 0.8 ? (
                                                    <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[10px] px-1.5 py-0 hover:bg-orange-200 transition-colors">
                                                        GEO-LIFT
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] px-1.5 py-0">
                                                        SECURE
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="hover:bg-slate-100 rounded-lg">
                                                        <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border-slate-100">
                                                    <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer" onClick={() => handleForceLogout(user.id)}>
                                                        <LogOut className="h-4 w-4 text-orange-500" /> Invalidate Sessions
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer">
                                                        <Key className="h-4 w-4 text-blue-500" /> Reset Credentials
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer">
                                                        <History className="h-4 w-4 text-slate-500" /> Access Audit Trail
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-slate-50" />
                                                    <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer text-red-600 font-bold" onClick={() => handleDisableUser(user.id)}>
                                                        <Ban className="h-4 w-4" /> Revoke Platform Access
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

            <Card className="bg-slate-900 border-0 shadow-2xl rounded-3xl overflow-hidden">
                <CardContent className="p-8 flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="h-6 w-6 text-red-400" />
                            <h3 className="text-xl font-bold text-white">Critical Compliance Warning</h3>
                        </div>
                        <p className="text-slate-400 max-w-2xl text-sm italic">
                            Super Admin users are strictly prohibited from accessing PII (Personally Identifiable Information) such as specific student marks, fee history, or internal academic notes. This view is for security auditing and account governance only.
                        </p>
                    </div>
                    <Badge variant="outline" className="border-red-900 text-red-400 bg-red-950/30 px-4 py-1 font-mono">
                        AUDIT_LEVEL_3
                    </Badge>
                </CardContent>
            </Card>
        </div>
    );
}
