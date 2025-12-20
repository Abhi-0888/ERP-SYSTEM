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
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Building2, Search, Plus, Filter, Download, MoreHorizontal, Eye, Pencil, Trash2, Users, TrendingUp, RefreshCw
} from "lucide-react";
import { UniversityService, University } from "@/lib/services/university.service";
import { toast } from "sonner";

export default function UniversitiesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [universities, setUniversities] = useState<University[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        contactEmail: "",
        address: "",
        subscriptionPlan: "basic"
    });

    const fetchUniversities = async () => {
        setLoading(true);
        try {
            const data = await UniversityService.getAll();
            setUniversities(data);
        } catch (error) {
            console.error("Failed to fetch universities", error);
            toast.error("Failed to load universities");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUniversities();
    }, []);

    const handleCreate = async () => {
        if (!formData.name || !formData.code) {
            toast.error("Name and Code are required");
            return;
        }
        try {
            await UniversityService.create(formData);
            toast.success("University created successfully");
            setIsDialogOpen(false);
            setFormData({
                name: "",
                code: "",
                contactEmail: "",
                address: "",
                subscriptionPlan: "basic"
            });
            fetchUniversities();
        } catch (error: any) {
            console.error("Failed to create university", error);
            toast.error(error.response?.data?.message || "Failed to create university");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this university?")) return;
        try {
            await UniversityService.delete(id);
            toast.success("University deleted");
            fetchUniversities();
        } catch (error) {
            toast.error("Failed to delete university");
        }
    };

    const filteredUniversities = (universities || []).filter(
        (u) =>
            u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.code?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalStudents = 0; // In a full implementation, we'd fetch this count from an aggregator

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Universities</h1>
                    <p className="text-slate-500">Manage all registered universities on the platform</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchUniversities} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />Add University
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Add New University</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">University Name</label>
                                    <Input
                                        placeholder="Enter university name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Code</label>
                                        <Input
                                            placeholder="UNIV"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Plan</label>
                                        <Input
                                            placeholder="basic/pro/enterprise"
                                            value={formData.subscriptionPlan}
                                            onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Admin Email</label>
                                    <Input
                                        type="email"
                                        placeholder="admin@university.edu"
                                        value={formData.contactEmail}
                                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Address</label>
                                    <Input
                                        placeholder="Full address"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                    <Button onClick={handleCreate}>Create University</Button>
                                </DialogFooter>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm transition-all hover:shadow-md">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <Building2 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium font-outfit">Total Universities</p>
                            <p className="text-2xl font-bold text-slate-900">{universities.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm transition-all hover:shadow-md">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-xl">
                            <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium font-outfit">Active Nodes</p>
                            <p className="text-2xl font-bold text-slate-900">{universities.filter(u => u.status === 'active').length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm transition-all hover:shadow-md">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-xl">
                            <Users className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium font-outfit">Multi-Tenancy</p>
                            <p className="text-2xl font-bold text-slate-900">Isolated</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm transition-all hover:shadow-md">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-orange-100 rounded-xl">
                            <TrendingUp className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium font-outfit">Health</p>
                            <p className="text-2xl font-bold text-slate-900">99.9%</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card className="border-0 shadow-sm">
                <div className="p-4 border-b">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search universities..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50">
                                <TableHead className="font-outfit">University</TableHead>
                                <TableHead className="font-outfit">Code</TableHead>
                                <TableHead className="font-outfit">Plan</TableHead>
                                <TableHead className="font-outfit">Status</TableHead>
                                <TableHead className="font-outfit">Created At</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow key="loading">
                                    <TableCell colSpan={6} className="text-center py-10 text-slate-400">
                                        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 opacity-20" />
                                        Fetching secure audit records...
                                    </TableCell>
                                </TableRow>
                            ) : filteredUniversities.length === 0 ? (
                                <TableRow key="empty">
                                    <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                                        No universities found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUniversities.map((uni) => (
                                    <TableRow key={uni._id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 font-bold">
                                                    {uni.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{uni.name}</p>
                                                    <p className="text-xs text-slate-500">{uni.contactEmail || 'No contact email'}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-mono bg-slate-50 uppercase">{uni.code}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="capitalize text-xs">
                                                {uni.subscriptionPlan}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={uni.status === "active" ? "default" : "destructive"} className="text-[10px] uppercase tracking-wider">
                                                {uni.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-500">
                                            {new Date(uni.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem><Eye className="h-4 w-4 mr-2" />Details</DropdownMenuItem>
                                                    <DropdownMenuItem><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => handleDelete(uni._id)}
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
