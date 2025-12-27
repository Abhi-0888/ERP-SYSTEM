"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
    LifeBuoy, UserCog, Megaphone, ShieldAlert,
    MessageCircle, Search, Clock, ShieldCheck,
    History, Ban, ExternalLink, RefreshCw,
    AlertCircle, CheckCircle2, Send, XCircle
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

export default function SupportHubPage() {
    const [activeTab, setActiveTab] = useState("tickets");
    const [loading, setLoading] = useState(true);
    const [tickets, setTickets] = useState<any[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [replyMessage, setReplyMessage] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await api.get('/support/tickets');
            const mappedTickets = (res.data || []).map((t: any) => ({
                ...t,
                universityName: t.universityId?.name
            }));
            setTickets(mappedTickets);
        } catch (error) {
            toast.error("Failed to load global support queue");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleImpersonate = async (userId: string) => {
        toast.warning("IMPERSONATION PROTOCOL INITIATED. Every action will be recorded in the security audit trail.");
        try {
            const res = await api.post(`/auth/impersonate/${userId}`);
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
                window.location.href = '/dashboard';
            }
        } catch (error) {
            toast.error("Impersonation failed");
        }
    };

    const handleReply = async () => {
        if (!replyMessage.trim()) return;
        setActionLoading(true);
        try {
            await api.post(`/support/tickets/${selectedTicket._id}/reply`, { message: replyMessage });
            toast.success("Reply sent successfully");
            setReplyMessage("");
            fetchTickets();
            setSelectedTicket(null); // Close modal
        } catch (error) {
            toast.error("Failed to send reply");
        } finally {
            setActionLoading(false);
        }
    };

    const handleCloseTicket = async () => {
        setActionLoading(true);
        try {
            await api.patch(`/support/tickets/${selectedTicket._id}/status`, { status: "resolved" });
            toast.success("Ticket resolved");
            fetchTickets();
            setSelectedTicket(null);
        } catch (error) {
            toast.error("Failed to close ticket");
        } finally {
            setActionLoading(false);
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

                <TabsContent value="tickets" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        <Card className="bg-blue-600 text-white border-0 rounded-2xl p-6 shadow-lg shadow-blue-100">
                            <p className="text-blue-100 font-bold text-xs uppercase tracking-tighter">Pending Critical</p>
                            <h3 className="text-4xl font-black mt-2">{tickets.filter((t: any) => t.priority === 'critical').length}</h3>
                        </Card>
                        <Card className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-tighter">Open Tickets</p>
                            <h3 className="text-4xl font-black text-slate-900 mt-2">{tickets.filter((t: any) => t.status === 'open').length}</h3>
                        </Card>
                        <Card className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-tighter">Resolved Today</p>
                            <h3 className="text-4xl font-black text-slate-900 mt-2">0</h3>
                        </Card>
                        <Card className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl p-6 flex flex-col justify-center">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5" />
                                <span className="font-bold">System Status: Nominal</span>
                            </div>
                        </Card>
                    </div>

                    <Card className="border-0 shadow-sm rounded-3xl border border-slate-100 overflow-hidden">
                        <div className="p-4 border-b bg-slate-50/50 flex flex-wrap items-center gap-4">
                            <div className="relative flex-1 min-w-[300px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input placeholder="Find ticket by ID or University..." className="pl-10 h-10 rounded-xl" />
                            </div>
                            <Button variant="outline" size="sm" className="rounded-xl bg-white" onClick={fetchTickets}>
                                <RefreshCw className="h-4 w-4 mr-2" />Reload Queue
                            </Button>
                        </div>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-50">
                                {tickets.length === 0 ? (
                                    <div className="p-12 text-center text-slate-400">
                                        <p>No pending support tickets found.</p>
                                    </div>
                                ) : (
                                    tickets.map((t: any, idx) => (
                                        <div
                                            key={idx}
                                            className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group cursor-pointer"
                                            onClick={() => setSelectedTicket(t)}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mt-1">
                                                    <MessageCircle className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-xs font-bold text-slate-400">#{t._id.substring(t._id.length - 6)}</span>
                                                        <Badge className={
                                                            t.priority === 'critical' ? 'bg-red-500' :
                                                                t.priority === 'high' ? 'bg-orange-500' :
                                                                    'bg-blue-500'
                                                        }>{t.priority || 'Normal'}</Badge>
                                                        <Badge variant="outline" className="text-[10px] bg-white border-slate-200">{t.universityName || 'Unknown'}</Badge>
                                                        <Badge variant="secondary" className="text-[10px]">{t.status}</Badge>
                                                    </div>
                                                    <h4 className="font-bold text-slate-900 mt-1">{t.subject}</h4>
                                                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{t.description}</p>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="ghost" className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                                View Details
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

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
                                    <Button onClick={() => handleImpersonate('demo')} className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black text-lg shadow-xl hover:scale-[1.01] transition-transform">
                                        EXECUTE SESSION MIRRORING
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                        {/* Static Impersonation Rule Cards Kept Same */}
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
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
                <DialogContent className="max-w-2xl rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="font-mono text-slate-400">#{selectedTicket?._id.slice(-6)}</span>
                            {selectedTicket?.subject}
                        </DialogTitle>
                        <DialogDescription>
                            From {selectedTicket?.userId?.username} @ {selectedTicket?.universityName}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="bg-slate-50 p-4 rounded-2xl text-sm leading-relaxed text-slate-700">
                            {selectedTicket?.description}
                        </div>

                        {(selectedTicket?.updates || []).length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-slate-400 uppercase">Discussion History</h4>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                    {selectedTicket?.updates.map((u: any, i: number) => (
                                        <div key={i} className="flex flex-col gap-1 bg-white border border-slate-100 p-3 rounded-xl">
                                            <div className="flex justify-between text-[10px] text-slate-400">
                                                <span className="font-bold text-slate-700">{u.updatedBy}</span>
                                                <span>{new Date(u.at).toLocaleString()}</span>
                                            </div>
                                            <p className="text-xs text-slate-600">{u.message}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">Your Response</label>
                            <Textarea
                                className="min-h-[100px] rounded-2xl resize-none"
                                placeholder="Type your reply here..."
                                value={replyMessage}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyMessage(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex gap-2">
                        <Button variant="destructive" onClick={handleCloseTicket} disabled={actionLoading} className="rounded-xl">
                            <XCircle className="h-4 w-4 mr-2" />
                            Close Ticket
                        </Button>
                        <Button onClick={handleReply} disabled={actionLoading || !replyMessage} className="rounded-xl bg-slate-900 text-white">
                            <Send className="h-4 w-4 mr-2" />
                            Send Reply
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

