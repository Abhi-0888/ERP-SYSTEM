"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    LifeBuoy, UserCog, Megaphone, ShieldAlert,
    MessageCircle, Search, Clock, ShieldCheck,
    History, Ban, ExternalLink, RefreshCw,
    AlertCircle, CheckCircle2
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

export default function SupportHubPage() {
    const [activeTab, setActiveTab] = useState("tickets");
    const [loading, setLoading] = useState(true);
    const [tickets, setTickets] = useState<any[]>([]);

    useEffect(() => {
        const fetchTickets = async () => {
            setLoading(true);
            try {
                // Assuming /support/tickets exists or we simulate with a real-like call
                const res = await api.get('/support/tickets');
                setTickets(res.data);
            } catch (error) {
                toast.error("Failed to load global support queue");
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, []);

    const handleImpersonate = async (userId: string) => {
        toast.warning("IMPERSONATION PROTOCOL INITIATED. Every action will be recorded in the security audit trail.");
        try {
            const res = await api.post(`/auth/impersonate/${userId}`);
            // Hande the redirection or token swap
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
                window.location.href = '/dashboard';
            }
        } catch (error) {
            toast.error("Impersonation failed");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Governance Support Hub</h1>
                    <p className="text-slate-500 mt-1">Platform-level assistance, crisis management, and controlled impersonation.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl border-slate-200 bg-white">
                        <Megaphone className="h-4 w-4 mr-2" />Global Announcement
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-slate-100 p-1 rounded-2xl h-12 w-full max-w-lg shadow-inner">
                    <TabsTrigger value="tickets" className="rounded-xl flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <LifeBuoy className="h-4 w-4 mr-2" />Global Tickets
                    </TabsTrigger>
                    <TabsTrigger value="impersonation" className="rounded-xl flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <UserCog className="h-4 w-4 mr-2" />Controlled Access
                    </TabsTrigger>
                </TabsList>

                {/* Global Tickets Tab */}
                <TabsContent value="tickets" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        <Card className="bg-blue-600 text-white border-0 rounded-2xl p-6 shadow-lg shadow-blue-100">
                            <p className="text-blue-100 font-bold text-xs uppercase tracking-tighter">Pending Critical</p>
                            <h3 className="text-4xl font-black mt-2">12</h3>
                        </Card>
                        <Card className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-tighter">Avg Response</p>
                            <h3 className="text-4xl font-black text-slate-900 mt-2">14<span className="text-sm font-medium text-slate-400 ml-1">min</span></h3>
                        </Card>
                        <Card className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-tighter">Resolved Today</p>
                            <h3 className="text-4xl font-black text-slate-900 mt-2">142</h3>
                        </Card>
                        <Card className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl p-6 flex flex-col justify-center">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5" />
                                <span className="font-bold">SLA Compliance: 99.8%</span>
                            </div>
                        </Card>
                    </div>

                    <Card className="border-0 shadow-sm rounded-3xl border border-slate-100 overflow-hidden">
                        <div className="p-4 border-b bg-slate-50/50 flex flex-wrap items-center gap-4">
                            <div className="relative flex-1 min-w-[300px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input placeholder="Find ticket by ID or University..." className="pl-10 h-10 rounded-xl" />
                            </div>
                            <Button variant="outline" size="sm" className="rounded-xl bg-white">
                                <RefreshCw className="h-4 w-4 mr-2" />Reload Queue
                            </Button>
                        </div>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-50">
                                {[
                                    { id: "T-8234", uni: "SRM AP", subject: "DB Connection timeouts in production", status: "CRITICAL", time: "5m ago" },
                                    { id: "T-8235", uni: "Vellore Tech", subject: "Bulk user upload failing at 98%", status: "HIGH", time: "22m ago" },
                                    { id: "T-8236", uni: "Amrita University", subject: "Request for white-labeling DNS change", status: "MEDIUM", time: "1h ago" },
                                ].map((t, idx) => (
                                    <div key={idx} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mt-1">
                                                <MessageCircle className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs font-bold text-slate-400">#{t.id}</span>
                                                    <Badge className={
                                                        t.status === 'CRITICAL' ? 'bg-red-500' :
                                                            t.status === 'HIGH' ? 'bg-orange-500' :
                                                                'bg-blue-500'
                                                    }>{t.status}</Badge>
                                                    <Badge variant="outline" className="text-[10px] bg-white border-slate-200">{t.uni}</Badge>
                                                </div>
                                                <h4 className="font-bold text-slate-900 mt-1">{t.subject}</h4>
                                                <p className="text-xs text-slate-500 mt-0.5">Reported {t.time}</p>
                                            </div>
                                        </div>
                                        <Button size="sm" className="rounded-xl bg-slate-900 opacity-0 group-hover:opacity-100 transition-opacity">
                                            Assign to Specialist
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Controlled Access (Impersonation) Tab */}
                <TabsContent value="impersonation" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <Card className="lg:col-span-2 border-0 shadow-sm rounded-3xl border border-slate-100 overflow-hidden flex flex-col">
                            <CardHeader className="bg-slate-900 text-white p-8">
                                <CardTitle className="text-2xl font-black italic tracking-tighter uppercase">Support Impersonation Console</CardTitle>
                                <CardDescription className="text-slate-400">Time-limited session mirroring for high-level troubleshooting.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 flex-1 space-y-8">
                                <div className="p-6 border-2 border-dashed border-slate-100 rounded-3xl space-y-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ShieldAlert className="h-5 w-5 text-orange-500" />
                                        <h4 className="font-bold text-slate-800">Authorization Identity</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Target User Email/UUID</label>
                                            <Input placeholder="admin@tenant-university.edu" className="rounded-xl h-12" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Time Allotment (Minutes)</label>
                                            <select className="w-full h-12 border rounded-xl px-4 text-sm bg-white">
                                                <option>15 Minutes (Default)</option>
                                                <option>30 Minutes (Deep Debug)</option>
                                                <option>60 Minutes (Requires Lead Approval)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Justification (Audited)</label>
                                        <textarea className="w-full h-24 border rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-slate-900" placeholder="Provide reason for impersonation..." />
                                    </div>
                                    <Button onClick={handleImpersonate} className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black text-lg shadow-xl hover:scale-[1.01] transition-transform">
                                        EXECUTE SESSION MIRRORING
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            <Card className="border-0 shadow-sm rounded-3xl bg-orange-50 border border-orange-100 overflow-hidden">
                                <CardHeader className="p-6 pb-2">
                                    <div className="flex items-center gap-2 text-orange-700">
                                        <AlertCircle className="h-5 w-5" />
                                        <CardTitle className="text-base font-black uppercase tracking-tighter">Security Protocol</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <p className="text-xs text-orange-800 leading-relaxed font-medium italic">
                                        Impersonation allows you to SEE and ACT as the user. This is governed by Rule #3: Every action must be auditable and reversible.
                                    </p>
                                    <ul className="space-y-3">
                                        {[
                                            "Target user is notified of access",
                                            "All session logs are replicated in real-time",
                                            "Financial modification is BLOCKED",
                                            "Session terminates on tab close"
                                        ].map((rule, idx) => (
                                            <li key={idx} className="flex items-center gap-2 text-[10px] font-bold text-orange-700">
                                                <ShieldCheck className="h-3 w-3" /> {rule}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-sm rounded-3xl bg-white border border-slate-100 overflow-hidden">
                                <CardHeader className="p-6 bg-slate-50/50 flex flex-row items-center justify-between">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                        <History className="h-4 w-4 text-slate-400" />
                                        Recent Sessions
                                    </CardTitle>
                                    <Badge variant="outline" className="text-[9px] uppercase">Logged</Badge>
                                </CardHeader>
                                <CardContent className="p-4 space-y-3">
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 relative group overflow-hidden">
                                        <div className="relative z-10 flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-slate-800 text-xs">admin@srm.edu</p>
                                                <p className="text-[10px] text-slate-500">Duration: 15m | Status: Expired</p>
                                            </div>
                                            <ExternalLink className="h-3 w-3 text-slate-300 group-hover:text-slate-900 cursor-pointer" />
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 relative group overflow-hidden">
                                        <div className="relative z-10 flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-slate-800 text-xs">finance.vit@vit.edu</p>
                                                <p className="text-[10px] text-slate-500">Duration: 30m | Status: Expired</p>
                                            </div>
                                            <ExternalLink className="h-3 w-3 text-slate-300 group-hover:text-slate-900 cursor-pointer" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

