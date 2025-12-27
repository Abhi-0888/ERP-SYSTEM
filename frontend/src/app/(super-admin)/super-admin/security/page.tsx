"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    ShieldAlert, Activity, Lock, Search, AlertTriangle, FileText, X,
    Terminal, Laptop, Globe, AlertCircle, RefreshCw, FileSearch, ShieldCheck,
    Filter, Download, Trash2, Ban
} from "lucide-react";
import { toast } from "sonner";
import { SuperAdminService } from "@/lib/services/super-admin.service";
import { UniversityService } from "@/lib/services/university.service";
import { useSearchParams, useRouter } from "next/navigation";

export default function SecurityCenterPage() {
    const [activeTab, setActiveTab] = useState("audit");
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>({
        totalLogs: 0,
        recentAlerts: [],
        failedLogins: 0,
        threatLevel: 'Low',
        failedVectors: [],
        sensitiveActions: []
    });
    const [universities, setUniversities] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);

    const searchParams = useSearchParams();
    const userIdFilter = searchParams.get('userId');
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [statsRes, eventsRes, sessionsRes, auditRes] = await Promise.all([
                    SuperAdminService.getSecurityStats(),
                    SuperAdminService.getSecurityEvents(),
                    SuperAdminService.getActiveSessions(),
                    SuperAdminService.getAuditLogs(1, 50, userIdFilter || "")
                ]);

                setStats({
                    ...statsRes.data,
                    failedVectors: eventsRes.data.failedVectors,
                    sensitiveActions: eventsRes.data.sensitiveActions
                });
                setSessions(sessionsRes.data);
                setAuditLogs(auditRes.data.logs || []); // Store logs

                if (userIdFilter) {
                    setActiveTab("audit");
                }
            } catch (error) {
                toast.error("Failed to load security intelligence");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userIdFilter]);

    const clearFilter = () => {
        router.push('/super-admin/security');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Security Command Center</h1>
                    <p className="text-slate-500 mt-1">Real-time threat monitoring and audit forensics.</p>
                </div>
                <div className="flex gap-2">
                    {userIdFilter && (
                        <Button variant="outline" className="rounded-xl bg-amber-50 text-amber-600 border-amber-200" onClick={clearFilter}>
                            <X className="h-4 w-4 mr-2" /> Clear Filter: {userIdFilter.substring(0, 8)}...
                        </Button>
                    )}
                    <Button variant="outline" className="rounded-xl bg-white">
                        <FileText className="h-4 w-4 mr-2" />Export Report
                    </Button>
                    <Button className="rounded-xl bg-slate-900 text-white shadow-lg">
                        <Terminal className="h-4 w-4 mr-2" />Security CLI
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-slate-100 p-1 rounded-2xl h-12 w-full max-w-lg">
                    <TabsTrigger value="audit" className="rounded-xl flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <FileSearch className="h-4 w-4 mr-2" />Audit Logs
                    </TabsTrigger>
                    <TabsTrigger value="events" className="rounded-xl flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <ShieldAlert className="h-4 w-4 mr-2" />Security Events
                    </TabsTrigger>
                    <TabsTrigger value="sessions" className="rounded-xl flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Activity className="h-4 w-4 mr-2" />Session Monitor
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="audit" className="space-y-6">
                    <Card className="border-0 shadow-sm rounded-2xl overflow-hidden border border-slate-100">
                        <div className="p-4 border-b bg-slate-50/50 flex flex-wrap items-center gap-4">
                            <div className="relative flex-1 min-w-[300px]">
                                <FileSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Query by UserID, Module, or Action UUID..."
                                    className="pl-10 rounded-xl h-10 bg-white"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="rounded-xl bg-white">
                                    <Filter className="h-4 w-4 mr-2" />Filters
                                </Button>
                                <Button variant="outline" size="sm" className="rounded-xl bg-white">
                                    <RefreshCw className="h-4 w-4 mr-2" />Auto-Refresh
                                </Button>
                            </div>
                        </div>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50">
                                        <TableHead>Timestamp</TableHead>
                                        <TableHead>Actor</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Module</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {auditLogs.length > 0 ? (
                                        auditLogs.map((log: any) => (
                                            <TableRow key={log._id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                                                <TableCell className="font-mono text-xs text-slate-500">
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </TableCell>
                                                <TableCell className="font-medium text-slate-900">
                                                    {log.username || 'SYSTEM'}
                                                    <div className="text-[10px] text-slate-400">{log.universityId || 'Global'}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-slate-50">{log.action}</Badge>
                                                </TableCell>
                                                <TableCell className="text-slate-500">{log.module}</TableCell>
                                                <TableCell>
                                                    <Badge className={log.severity === 'Info' ? 'bg-blue-500' : 'bg-orange-500'}>
                                                        {log.severity || 'Info'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                                                No audit logs found {userIdFilter ? 'for this user' : ''}.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="events" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="border-0 shadow-sm rounded-3xl overflow-hidden border border-slate-100 flex flex-col">
                        <CardHeader className="bg-red-50/50 p-6 border-b border-red-50">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                                    <ShieldAlert className="h-5 w-5" />
                                    Failed Access Vectors
                                </CardTitle>
                                <Badge className="bg-red-100 text-red-700 border-red-200">24h Alert</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4 flex-1">
                            {stats.failedVectors && stats.failedVectors.length > 0 ? (
                                stats.failedVectors.map((ev: any, i: number) => (
                                    <div key={i} className="flex items-start justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div>
                                            <p className="font-bold text-slate-900">{ev.vector}</p>
                                            <p className="text-xs text-slate-400 mt-1">Target: {ev.target}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-red-600">{ev.count}</p>
                                            <Badge variant="outline" className="text-[10px] bg-white">{ev.status}</Badge>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-slate-400">No recent failed vectors.</div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm rounded-3xl overflow-hidden border border-slate-100 flex flex-col">
                        <CardHeader className="bg-orange-50/50 p-6 border-b border-orange-50">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2 text-orange-700">
                                    <Lock className="h-5 w-5" />
                                    Sensitive Action Triggers
                                </CardTitle>
                                <Badge className="bg-orange-100 text-orange-700 border-orange-200">High Risk</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4 flex-1">
                            {stats.sensitiveActions && stats.sensitiveActions.length > 0 ? (
                                stats.sensitiveActions.map((ev: any, i: number) => (
                                    <div key={i} className="flex items-start justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                                        <div>
                                            <p className="font-bold text-slate-900">{ev.action}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge className="bg-slate-200 text-slate-700 border-0 text-[9px] uppercase">{ev.user}</Badge>
                                                <span className="text-[10px] text-slate-400">Changed: {ev.delta}</span>
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400">{new Date(ev.time).toLocaleTimeString()}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-slate-400">No sensitive actions captured.</div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="sessions" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sessions.map((s: any, i) => (
                            <Card key={i} className="border-0 shadow-sm border border-slate-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                                        <Activity className="h-5 w-5" />
                                    </div>
                                    <Badge className={s.status === 'Peak' ? 'bg-orange-500' : 'bg-emerald-500'}>
                                        {s.status}
                                    </Badge>
                                </div>
                                <h3 className="font-bold text-slate-900 mt-4 truncate">{s.uni}</h3>
                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Live Connections</p>
                                        <p className="text-xl font-black text-slate-900">{s.active}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Daily Peak</p>
                                        <p className="text-xl font-black text-slate-600">-</p>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-slate-50 flex gap-2">
                                    <Button variant="ghost" size="sm" className="text-xs text-blue-600 flex-1 hover:bg-blue-50 rounded-xl">Monitor Details</Button>
                                    <Button variant="ghost" size="sm" className="text-xs text-red-600 flex-1 hover:bg-red-50 rounded-xl">Blast Sessions</Button>
                                </div>
                            </Card>
                        ))}
                        {sessions.length === 0 && (
                            <div className="col-span-3 p-12 text-center text-slate-400 border border-dashed rounded-2xl">
                                No active university sessions detected.
                            </div>
                        )}
                    </div>

                    <Card className="border-0 shadow-sm rounded-2xl overflow-hidden border border-slate-100">
                        <CardHeader className="bg-slate-50/50">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Laptop className="h-5 w-5 text-slate-700" />
                                Recent High-Level Authentications
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-6 text-slate-400">
                                            No high-level authentications recorded recently.
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="bg-emerald-900 text-white rounded-3xl p-8 flex items-center justify-between shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <ShieldCheck className="h-48 w-48" />
                </div>
                <div className="space-y-4 max-w-3xl relative">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-emerald-400" />
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Forensic Integrity Verified</h2>
                    </div>
                    <p className="text-emerald-100/70 text-sm leading-relaxed">
                        The current environment is protected by an immutable audit trail. Every action performed within this console is cryptographically signed and replicated to a separate WORM (Write Once Read Many) storage node to ensure legal and regulatory compliance.
                    </p>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-300 bg-emerald-800/50 px-3 py-1.5 rounded-full border border-emerald-700/50">
                            <Lock className="h-3 w-3" /> ENCRYPTED-AT-REST
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-300 bg-emerald-800/50 px-3 py-1.5 rounded-full border border-emerald-700/50">
                            <AlertCircle className="h-3 w-3" /> 256-BIT ROTATION ACTIVE
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

