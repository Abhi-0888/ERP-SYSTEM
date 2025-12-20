"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
    Key, ShieldAlert, Clock, UserPlus,
    Trash2, AlertTriangle, ShieldCheck, History as HistoryIcon,
    CheckCircle2, XCircle, Activity
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

export default function PermissionOverridesPage() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [overrides, setOverrides] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        userId: "",
        tempRole: "REGISTRAR",
        durationHours: 4,
        reason: ""
    });

    const fetchOverrides = async () => {
        setLoading(true);
        try {
            const res = await api.get('/super-admin/overrides');
            setOverrides(res.data);
        } catch (error) {
            toast.error("Failed to load secure access records");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOverrides();
    }, []);

    const handleCreate = async () => {
        if (!formData.userId || !formData.reason) {
            toast.error("User ID and Justification are required");
            return;
        }
        try {
            await api.post('/super-admin/overrides', formData);
            toast.success("Override Deployed Successfully");
            setIsCreateDialogOpen(false);
            setFormData({ userId: "", tempRole: "REGISTRAR", durationHours: 4, reason: "" });
            fetchOverrides();
        } catch (error) {
            toast.error("Failed to execute elevation");
        }
    };

    const handleRevoke = async (id: string) => {
        try {
            await api.patch(`/super-admin/overrides/${id}/revoke`);
            toast.info("Temporal override revoked and logged.");
            fetchOverrides();
        } catch (error) {
            toast.error("Revocation failed");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                    <Key className="h-48 w-48" />
                </div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-black tracking-tight uppercase">Temporal Access Governance</h1>
                    <p className="text-indigo-200 mt-2 max-w-xl">Super Admin override authority. Issue time-bound, auditable permission escalations for emergency support and intervention.</p>
                </div>
                <div className="relative z-10">
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-white text-indigo-900 hover:bg-slate-100 rounded-2xl h-12 px-8 font-bold shadow-lg">
                                <UserPlus className="h-5 w-5 mr-2" />Initiate Override
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md bg-white rounded-3xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black text-slate-900">Permission Elevation</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Target User (Identity GUID)</label>
                                    <Input placeholder="USER_XXXXXXXXXXXX" className="rounded-xl h-11 border-slate-200" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Temporary Role</label>
                                        <select className="w-full h-11 border rounded-xl px-3 text-sm bg-white border-slate-200">
                                            <option>REGISTRAR</option>
                                            <option>UNIVERSITY_ADMIN</option>
                                            <option>EXAM_CONTROLLER</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Duration (Hours)</label>
                                        <Input type="number" defaultValue={4} className="rounded-xl h-11 border-slate-200" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Mandatory Access Reason</label>
                                    <textarea
                                        className="w-full h-24 border rounded-xl p-3 text-sm border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Explain why this override is required for forensic auditing..."
                                    />
                                </div>
                                <div className="p-3 bg-red-50 rounded-2xl border border-red-100 flex gap-3 mt-2">
                                    <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-red-700 font-medium">WARNING: This action is irreversible in audit logs and will be broadcast to the University Security Lead.</p>
                                </div>
                                <DialogFooter className="pt-4">
                                    <Button variant="ghost" className="rounded-xl" onClick={() => setIsCreateDialogOpen(false)}>Abort</Button>
                                    <Button className="bg-slate-900 text-white rounded-xl px-8" onClick={() => {
                                        toast.success("Override Deployed Successfully");
                                        setIsCreateDialogOpen(false);
                                    }}>Execute Elevation</Button>
                                </DialogFooter>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border-0 shadow-sm rounded-3xl border border-slate-100 overflow-hidden">
                    <CardHeader className="bg-slate-50/50 p-6">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Clock className="h-5 w-5 text-indigo-600" />
                            Active Temporal Overrides
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/20 border-0 h-12">
                                    <TableHead className="font-bold text-[10px] uppercase text-slate-500 px-6">Identity / Scope</TableHead>
                                    <TableHead className="font-bold text-[10px] uppercase text-slate-500">Elevation Mapping</TableHead>
                                    <TableHead className="font-bold text-[10px] uppercase text-slate-500">Time To Live</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {overrides.map((o) => (
                                    <TableRow key={o.id} className="border-slate-50 group hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold border border-indigo-100">
                                                    {o.user.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 leading-none">{o.user}</p>
                                                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-mono tracking-tighter">{o.university}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-[9px] font-mono text-slate-400">{o.originalRole}</Badge>
                                                <div className="h-[1px] w-4 bg-slate-200" />
                                                <Badge className="bg-indigo-600 text-[9px] font-mono">{o.tempRole}</Badge>
                                            </div>
                                            <p className="text-[10px] text-slate-500 mt-1 italic">&quot;{o.reason}&quot;</p>
                                        </TableCell>
                                        <TableCell>
                                            {o.status === 'active' ? (
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5 text-emerald-600 font-black text-xs">
                                                        <Activity className="h-3 w-3 animate-pulse" /> ACTIVE
                                                    </div>
                                                    <p className="text-[10px] text-slate-400">Ends: {new Date(o.end).toLocaleTimeString()}</p>
                                                </div>
                                            ) : (
                                                <Badge variant="outline" className="text-slate-400 bg-slate-50 border-slate-100">REVOKED</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-6">
                                            {o.status === 'active' && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                                                    onClick={() => handleRevoke(o.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="border-0 shadow-sm rounded-3xl bg-slate-900 text-white overflow-hidden relative border border-slate-800">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <ShieldCheck className="h-32 w-32" />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                                Governance Protocol
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                                <div>
                                    <p className="text-sm font-bold">Immutable Logging</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Every override is permanently etched into the global security ledger.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                                <div>
                                    <p className="text-sm font-bold">Auto-Purge Engine</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Sessions are strictly terminated automatically at T-Minus 0.</p>
                                </div>
                            </div>
                            <div className="flex gap-3 text-red-400">
                                <XCircle className="h-5 w-5 shrink-0" />
                                <div>
                                    <p className="text-sm font-bold">No Persistence</p>
                                    <p className="text-[11px] text-red-400/70 mt-0.5">Temporary roles never touch the core user profile database record.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm rounded-3xl bg-white border border-slate-100 overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2 text-slate-800">
                                <HistoryIcon className="h-5 w-5 text-slate-400" />
                                Recent Revocations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-6 space-y-4">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 italic text-[11px] text-slate-500">
                                No recently revoked credentials in current session.
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

