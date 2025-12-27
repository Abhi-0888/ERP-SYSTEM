"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    Box, Library, Home, Briefcase, BrainCircuit,
    ShieldAlert, Zap, Search, LayoutGrid, AlertCircle, RefreshCw
} from "lucide-react";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { toast } from "sonner";
import { UniversityService } from "@/lib/services/university.service";
import { SuperAdminService } from "@/lib/services/super-admin.service";

const MODULES = [
    { id: "library", name: "Library Management", icon: Library, color: "text-blue-500", bg: "bg-blue-50" },
    { id: "hostel", name: "Hostel & Housing", icon: Home, color: "text-emerald-500", bg: "bg-emerald-50" },
    { id: "placement", name: "Career Placement", icon: Briefcase, color: "text-orange-500", bg: "bg-orange-50" },
    { id: "ai", name: "AI Academic Insights", icon: BrainCircuit, color: "text-purple-500", bg: "bg-purple-50" },
    { id: "transport", name: "Fleet & Transport", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-50" },
];

export default function ModuleFlagsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [universities, setUniversities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>({});

    const fetchData = async () => {
        setLoading(true);
        try {
            const [univData, statsData] = await Promise.all([
                UniversityService.getAll(),
                SuperAdminService.getModuleStats()
            ]);
            setUniversities(univData);
            setStats(statsData.data);
        } catch (error) {
            toast.error("Failed to load tenant modules base");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleToggleModule = async (univId: string, moduleName: string, currentlyEnabled: boolean) => {
        const univ = universities.find(u => u._id === univId);
        if (!univ) return;

        const enabledModules = univ.enabledModules || [];
        const newModules = currentlyEnabled
            ? enabledModules.filter((m: string) => m !== moduleName)
            : [...enabledModules, moduleName];

        try {
            // Optimistic update
            const updatedUniv = { ...univ, enabledModules: newModules };
            setUniversities(prev => prev.map(u => u._id === univId ? updatedUniv : u));

            await UniversityService.update(univId, { enabledModules: newModules });
            toast.success(`${moduleName} ${currentlyEnabled ? 'disabled' : 'enabled'} for tenant.`);
        } catch (error) {
            toast.error("Module configuration failed");
            fetchData(); // Revert on failure
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Module & Feature Control</h1>
                    <p className="text-slate-500 mt-1">Granular feature rollout and emergency kill-switch management.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="destructive" className="rounded-xl shadow-lg shadow-red-100 font-bold">
                        <ShieldAlert className="h-4 w-4 mr-2" />Global Emergency Kill-Switch
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <LayoutGrid className="h-5 w-5 text-slate-400" />
                            Tenant-Specific Capability
                        </h2>
                        <div className="relative max-w-xs w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search university..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-10 rounded-xl bg-white border-slate-200"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {universities.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())).map((uni, idx) => (
                            <Card key={idx} className="border-0 shadow-sm rounded-3xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                                <CardHeader className="bg-slate-50/50 flex flex-row items-center justify-between px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-900 shadow-sm">
                                            {uni.code.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 leading-none">{uni.name}</p>
                                            <p className="text-[10px] text-slate-400 mt-1 font-mono uppercase">{uni.code}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="bg-white text-slate-600 border-slate-200">
                                        {(uni.enabledModules || []).length} Modules Active
                                    </Badge>
                                </CardHeader>
                                <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {MODULES.map((mod) => {
                                        const isActive = (uni.enabledModules || []).includes(mod.id);
                                        const Icon = mod.icon;
                                        return (
                                            <div key={mod.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm relative overflow-hidden group">
                                                <div className="flex items-center gap-3 z-10">
                                                    <div className={`p-2 rounded-lg ${mod.bg} ${mod.color}`}>
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-700">{mod.name}</span>
                                                </div>
                                                <Switch
                                                    checked={isActive}
                                                    onCheckedChange={() => handleToggleModule(uni._id, mod.id, isActive)}
                                                    className="scale-75 z-10"
                                                />
                                            </div>
                                        )
                                    })}
                                </CardContent>
                            </Card>
                        ))}
                        {universities.length === 0 && !loading && (
                            <div className="p-12 text-center text-slate-400 border border-dashed rounded-3xl">
                                <p>No tenants found to configure.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="border-0 shadow-sm rounded-3xl bg-slate-900 text-white overflow-hidden relative border border-slate-800">
                        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                            <Box className="h-32 w-32" />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Zap className="h-5 w-5 text-yellow-400" />
                                Deployment Strategy
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-2">
                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-bold">Beta Toggles</p>
                                        <Switch />
                                    </div>
                                    <p className="text-[11px] text-slate-400 leading-relaxed">Allow enrollment in experimental feature sets for selected pilot institutions.</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-bold">Global Maintenance</p>
                                        <Switch />
                                    </div>
                                    <p className="text-[11px] text-slate-400 leading-relaxed">Broadcast a read-only state across all tenants during scheduled patching.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm rounded-3xl bg-white border border-slate-100 overflow-hidden">
                        <CardHeader className="bg-red-50 text-red-900">
                            <CardTitle className="text-base flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                                Protection Protocol
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Disabling a module for a tenant will immediately invalidate all related API requests and hide the UI elements from their localized dashboard. This protects against:
                            </p>
                            <ul className="space-y-2">
                                {[
                                    "Critical Bug Rollbacks",
                                    "Unpaid Subscription Locks",
                                    "Scheduled Maintenance Isolation"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <Button variant="outline" className="w-full rounded-xl text-xs h-10 border-red-100 text-red-600 hover:bg-red-50">
                                View Rollover History
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm rounded-3xl bg-indigo-50 border border-indigo-100">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 text-indigo-700 mb-2">
                                <RefreshCw className="h-4 w-4" />
                                <span className="text-xs font-black uppercase tracking-tighter">Real-time Sync</span>
                            </div>
                            <p className="text-[11px] text-indigo-600 leading-relaxed font-medium">
                                Feature flag changes propagate via WebSocket within &lt;100ms to all active client sessions.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
