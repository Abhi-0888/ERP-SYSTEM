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
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
    Building2, Search, Plus, MoreHorizontal, Eye, Pencil,
    ShieldCheck, RefreshCw, Ban, ChevronUp, UserPlus
} from "lucide-react";
import { UniversityService, University } from "@/lib/services/university.service";
import { toast } from "sonner";

export default function UniversitiesManagementPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [universities, setUniversities] = useState<any[]>([]);
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
            toast.error("Failed to load secure university records");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUniversities();
    }, []);

    const handleCreate = async () => {
        if (!formData.name || !formData.code) {
            toast.error("Name and Unique Code are mandatory");
            return;
        }
        try {
            await UniversityService.create(formData);
            toast.success("New Tenant Provisioned Successfully");
            setIsCreateDialogOpen(false);
            setFormData({
                name: "",
                code: "",
                contactEmail: "",
                address: "",
                subscriptionPlan: "basic"
            });
            fetchUniversities();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Provisioning Failed");
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        try {
            // Assuming the service supports partial update or status update
            // For now, using UniversityService.update if available
            await UniversityService.update(id, { status: newStatus });
            toast.success(`University ${newStatus === 'active' ? 'Activated' : 'Suspended'}`);
            fetchUniversities();
        } catch (error) {
            toast.error("Status Change Failed");
        }
    };

    const filteredUniversities = (universities || []).filter(
        (u) =>
            u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.code?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">University Management</h1>
                    <p className="text-slate-500 text-sm">Central control panel for multi-tenant isolation and governance.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchUniversities} disabled={loading} className="rounded-xl">
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Sync Records
                    </Button>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl">
                                <Plus className="h-4 w-4 mr-2" />Provision New Tenant
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md bg-white">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold">New University Credentials</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Entity Name</label>
                                    <Input
                                        placeholder="Full Legal Name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">System Code</label>
                                        <Input
                                            placeholder="UNIV-01"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                            className="rounded-xl font-mono uppercase"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Initial Plan</label>
                                        <select
                                            className="w-full h-10 border rounded-xl px-3 text-sm"
                                            value={formData.subscriptionPlan}
                                            onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value })}
                                        >
                                            <option value="basic">Basic</option>
                                            <option value="pro">Pro</option>
                                            <option value="enterprise">Enterprise</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Root Admin Email</label>
                                    <Input
                                        type="email"
                                        placeholder="admin@entity.edu"
                                        value={formData.contactEmail}
                                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                        className="rounded-xl"
                                    />
                                </div>
                                <DialogFooter className="pt-4">
                                    <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)} className="rounded-xl">Cancel</Button>
                                    <Button onClick={handleCreate} className="bg-slate-900 text-white rounded-xl px-8">Provision</Button>
                                </DialogFooter>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card className="border-0 shadow-sm overflow-hidden rounded-2xl border border-slate-100">
                <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Filter by name or system code..."
                            className="pl-10 h-10 rounded-xl bg-white border-slate-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100">
                        Isolated Data Storage Active
                    </Badge>
                </div>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 border-0">
                                <TableHead className="font-bold text-slate-700 h-12">Entity Details</TableHead>
                                <TableHead className="font-bold text-slate-700 h-12 text-center">System Code</TableHead>
                                <TableHead className="font-bold text-slate-700 h-12">Subscription</TableHead>
                                <TableHead className="font-bold text-slate-700 h-12">Tenant Health</TableHead>
                                <TableHead className="font-bold text-slate-700 h-12">Last Audit</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-20">
                                        <div className="flex flex-col items-center gap-2">
                                            <RefreshCw className="h-8 w-8 animate-spin text-slate-300" />
                                            <p className="text-sm text-slate-400">Verifying secure multi-tenant mappings...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredUniversities.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-20 text-slate-400">
                                        No tenant records matched the query.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUniversities.map((uni) => (
                                    <TableRow key={uni._id || uni.id} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-slate-600 font-bold border border-slate-200 shadow-sm">
                                                    {uni.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{uni.name}</p>
                                                    <p className="text-xs text-slate-500">{uni.contactEmail || 'unassigned@tenant.system'}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className="font-mono bg-slate-50 text-slate-600 border-slate-200 uppercase px-3">
                                                {uni.code}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <Badge variant="secondary" className={`capitalize text-[10px] tracking-widest ${uni.subscriptionPlan === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                                                    uni.subscriptionPlan === 'pro' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-slate-100 text-slate-700'
                                                    }`}>
                                                    {uni.subscriptionPlan}
                                                </Badge>
                                                <p className="text-[10px] text-slate-400">Expires: Dec 2026</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={uni.status === "active" ? "default" : "destructive"} className={`text-[10px] uppercase tracking-wider rounded-full ${uni.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'
                                                }`}>
                                                {uni.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-500">
                                            {new Date(uni.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="hover:bg-slate-100 rounded-lg">
                                                        <MoreHorizontal className="h-4 w-4 text-slate-500" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl">
                                                    <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer">
                                                        <Eye className="h-4 w-4 text-slate-400" /> View Tenant Summary
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer">
                                                        <UserPlus className="h-4 w-4 text-slate-400" /> Assign Global Admin
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer">
                                                        <ChevronUp className="h-4 w-4 text-slate-400" /> Upgrade License
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className={`rounded-lg gap-2 cursor-pointer ${uni.status === 'active' ? 'text-red-600' : 'text-emerald-600'}`}
                                                        onClick={() => handleToggleStatus(uni._id, uni.status)}
                                                    >
                                                        {uni.status === 'active' ? <Ban className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                                                        {uni.status === 'active' ? 'Suspend Tenant' : 'Activate Tenant'}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <Card className="bg-slate-900 text-white border-0 shadow-lg rounded-2xl overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-emerald-400" />
                            Data Access Restriction
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-400 leading-relaxed">
                        <p>Super Admin level access is restricted to system configuration and tenant oversight. Individual student records, academic results, and financial transactions per person are strictly blocked to ensure compliance with privacy regulations.</p>
                        <div className="mt-4 flex gap-2">
                            <Badge className="bg-slate-800 text-slate-300 border-0">GDPR</Badge>
                            <Badge className="bg-slate-800 text-slate-300 border-0">FERPA</Badge>
                            <Badge className="bg-slate-800 text-slate-300 border-0">HIPAA</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border border-slate-100 shadow-sm rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-lg text-slate-800">Quick Resource Usage</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                                <span>Global Storage Utilization</span>
                                <span>68%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-slate-900 h-full w-[68%]" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                                <span>Provisioning Queue</span>
                                <span>Idle</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
