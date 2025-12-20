"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    ShieldAlert, Activity, FileSearch, ShieldCheck,
    Terminal, Lock, Laptop, Globe, AlertCircle, RefreshCw,
    Filter, Download, Trash2, Ban
} from "lucide-react";

export default function SecurityCenterPage() {
    const [activeTab, setActiveTab] = useState("audit");

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Audit & Security Center</h1>
                    <p className="text-slate-500 mt-1">Platform forensics, immutable logging, and session governance.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl bg-white">
                        <Download className="h-4 w-4 mr-2" />Export Logs (CSV)
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
                                    <TableRow className="bg-slate-50/10 border-0">
                                        <TableHead className="font-bold text-slate-600 h-12">Timestamp</TableHead>
                                        <TableHead className="font-bold text-slate-600 h-12">Identity</TableHead>
                                        <TableHead className="font-bold text-slate-600 h-12">Scope</TableHead>
                                        <TableHead className="font-bold text-slate-600 h-12">Vector/Module</TableHead>
                                        <TableHead className="font-bold text-slate-600 h-12">Payload Action</TableHead>
                                        <TableHead className="font-bold text-slate-600 h-12">Severity</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[
                                        { time: "2025-12-20T13:42:01Z", user: "SA_ADMIN_01", scope: "PLATFORM", module: "AUTH", action: "JWT_REFRESH", severity: "INFO" },
                                        { time: "2025-12-20T13:41:45Z", user: "UNI_ADMIN_SRM", scope: "SRM_AP", module: "UNIVERSITY", action: "CONFIG_UPDATE", severity: "WARNING" },
                                        { time: "2025-12-20T13:40:12Z", user: "REGISTRAR_XYZ", scope: "XYZ_UNI", module: "REPORTS", action: "BULK_EXPORT", severity: "WARNING" },
                                        { time: "2025-12-20T13:38:55Z", user: "SYSTEM", scope: "GLOBAL", module: "AUDIT", action: "LOG_COMPRESSION", severity: "INFO" },
                                        { time: "2025-12-20T13:35:20Z", user: "UNKNOWN", scope: "IP_BLOCKED", module: "WAF", action: "SQL_INJECTION_BLOCK", severity: "CRITICAL" },
                                    ].map((log, i) => (
                                        <TableRow key={i} className="hover:bg-slate-50/50 transition-colors border-slate-50 font-mono text-[11px]">
                                            <TableCell className="text-slate-400">{log.time}</TableCell>
                                            <TableCell className="font-bold text-slate-900">{log.user}</TableCell>
                                            <TableCell><Badge variant="outline" className="text-[9px] uppercase">{log.scope}</Badge></TableCell>
                                            <TableCell className="text-blue-600 font-bold">{log.module}</TableCell>
                                            <TableCell className="text-slate-700">{log.action}</TableCell>
                                            <TableCell>
                                                <Badge className={
                                                    log.severity === 'CRITICAL' ? 'bg-red-500' :
                                                        log.severity === 'WARNING' ? 'bg-orange-500' :
                                                            'bg-blue-500'
                                                }>
                                                    {log.severity}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
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
                            {[
                                { vector: "Brute Force Attempt", count: 42, target: "srm_admin_portal", status: "BLOCKED" },
                                { vector: "Invalid API Key", count: 128, target: "gateway_v2", status: "THROTTLED" },
                                { vector: "Expired Token Usage", count: 15, target: "session_manager", status: "LOGGED" },
                            ].map((ev, i) => (
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
                            ))}
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
                            {[
                                { action: "Permission Override Created", user: "SA_ALEX", delta: "+SUPER_USER", time: "2m ago" },
                                { action: "Bulk DB Export Ignited", user: "UNI_DB_MANAGER", delta: "TABLE_USERS", time: "15m ago" },
                                { action: "Global Config Mutation", user: "SYSTEM_ROOOT", delta: "PLAN_UPGRADE", time: "1h ago" },
                            ].map((ev, i) => (
                                <div key={i} className="flex items-start justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                                    <div>
                                        <p className="font-bold text-slate-900">{ev.action}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge className="bg-slate-200 text-slate-700 border-0 text-[9px] uppercase">{ev.user}</Badge>
                                            <span className="text-[10px] text-slate-400">Changed: {ev.delta}</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400">{ev.time}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="sessions" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { uni: "SRM Institute of Science", active: 142, peak: 250, status: "Normal" },
                            { uni: "Vellore Tech", active: 210, peak: 220, status: "Peak" },
                            { uni: "Amrita University", active: 89, peak: 150, status: "Normal" },
                        ].map((s, i) => (
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
                                        <p className="text-xl font-black text-slate-600">{s.peak}</p>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-slate-50 flex gap-2">
                                    <Button variant="ghost" size="sm" className="text-xs text-blue-600 flex-1 hover:bg-blue-50 rounded-xl">Monitor Details</Button>
                                    <Button variant="ghost" size="sm" className="text-xs text-red-600 flex-1 hover:bg-red-50 rounded-xl">Blast Sessions</Button>
                                </div>
                            </Card>
                        ))}
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
                                    {[
                                        { user: "SuperAdmin_01", device: "MacBook Pro / Chrome", location: "Singapore", ip: "13.250.x.x", time: "Now" },
                                        { user: "UniAdmin_Srm_Head", device: "Windows 11 / Edge", location: "Chennai, India", ip: "182.74.x.x", time: "14m ago" },
                                        { user: "Global_Support_Lead", device: "Ubuntu / Firefox", location: "London, UK", ip: "82.162.x.x", time: "1h ago" },
                                    ].map((auth, i) => (
                                        <TableRow key={i} className="border-slate-50 font-outfit">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white text-[10px] font-black">
                                                        {auth.user.charAt(0)}
                                                    </div>
                                                    <span className="font-bold text-slate-900">{auth.user}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-500 text-xs">
                                                <div className="flex items-center gap-1">
                                                    <Laptop className="h-3 w-3" /> {auth.device}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-500 text-xs text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Globe className="h-3 w-3" /> {auth.location}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-400 font-mono text-[10px]">{auth.ip}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-0 text-[10px]">
                                                    {auth.time}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
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

