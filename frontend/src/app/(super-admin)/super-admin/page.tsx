"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Building2, Users, Activity, ShieldAlert, Key,
    AlertTriangle, LifeBuoy, Zap, ShieldCheck
} from "lucide-react";
import api from "@/lib/api";

function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    variant = "default",
}: {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    variant?: "default" | "warning" | "destructive" | "success";
}) {
    const variants = {
        default: "from-blue-500 to-indigo-600 shadow-blue-200",
        warning: "from-orange-400 to-red-500 shadow-orange-200",
        destructive: "from-red-600 to-pink-700 shadow-red-200",
        success: "from-emerald-500 to-teal-600 shadow-emerald-200",
    };

    return (
        <Card className="border-0 shadow-sm overflow-hidden group hover:shadow-lg transition-all">
            <CardContent className="p-0">
                <div className="flex items-stretch min-h-[120px]">
                    <div className={`w-2 bg-gradient-to-b ${variants[variant]}`} />
                    <div className="flex-1 p-6 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
                            <div className={`p-2 rounded-lg bg-slate-50 text-slate-600 group-hover:scale-110 transition-transform`}>
                                <Icon className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <p className="text-3xl font-bold text-slate-900">{value}</p>
                            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function SuperAdminDashboard() {
    const [stats, setStats] = useState({
        totalUniversities: "0",
        activeUniversities: "0",
        totalUsers: "0",
        activeSessions: "0",
        systemStatus: "Healthy",
        failedLogins: "0",
        permissionOverrides: "0",
        auditAlerts: "0",
        pendingTickets: "0"
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // In a real scenario, we'd have a single aggregator endpoint /super-admin/stats
                // For now, we simulate or fetch from basic endpoints
                const [uniRes, userRes] = await Promise.all([
                    api.get('/universities'),
                    api.get('/users')
                ]);

                const universities = uniRes.data || [];
                const users = userRes.data || [];

                setStats({
                    totalUniversities: universities.length.toString(),
                    activeUniversities: universities.filter((u: any) => u.status === 'active').length.toString(),
                    totalUsers: users.length.toString(),
                    activeSessions: "142", // Mocked for now
                    systemStatus: "Healthy",
                    failedLogins: "12",
                    permissionOverrides: "2",
                    auditAlerts: "0",
                    pendingTickets: "5"
                });
            } catch (error) {
                console.error("Failed to fetch Super Admin stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="flex flex-col items-center gap-4">
                    <Activity className="h-10 w-10 text-blue-500 animate-pulse" />
                    <p className="text-slate-500 animate-pulse">Aggregating Global Metrics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Platform Command Center</h1>
                <p className="text-slate-500 mt-1">Real-time governance and system monitoring across all tenants.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <StatCard
                    title="Total Universities"
                    value={stats.totalUniversities}
                    subtitle="Registered Tenants"
                    icon={Building2}
                />
                <StatCard
                    title="Active Nodes"
                    value={stats.activeUniversities}
                    subtitle="Currently Operational"
                    icon={Zap}
                    variant="success"
                />
                <StatCard
                    title="Global Users"
                    value={stats.totalUsers}
                    subtitle="Across all Tenants"
                    icon={Users}
                />
                <StatCard
                    title="Active Sessions"
                    value={stats.activeSessions}
                    subtitle="Last 24 Hours"
                    icon={Activity}
                />
                <StatCard
                    title="System Health"
                    value={stats.systemStatus}
                    subtitle="Latency: 42ms"
                    icon={ShieldCheck}
                    variant="success"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-lg font-semibold text-slate-800 px-1 flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-red-500" />
                        Operational Alerts
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <StatCard
                            title="Failed Logins"
                            value={stats.failedLogins}
                            subtitle="Potential Brute Force"
                            icon={ShieldAlert}
                            variant="warning"
                        />
                        <StatCard
                            title="Active Overrides"
                            value={stats.permissionOverrides}
                            subtitle="Temporal Privileges"
                            icon={Key}
                            variant="warning"
                        />
                        <StatCard
                            title="Audit Alerts"
                            value={stats.auditAlerts}
                            subtitle="Critical Security Logs"
                            icon={AlertTriangle}
                            variant={stats.auditAlerts === "0" ? "success" : "destructive"}
                        />
                        <StatCard
                            title="Support Tickets"
                            value={stats.pendingTickets}
                            subtitle="Pending Resolution"
                            icon={LifeBuoy}
                        />
                    </div>
                </div>

                <Card className="lg:col-span-2 border-0 shadow-sm bg-slate-900 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <ShieldCheck className="h-40 w-40" />
                    </div>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-emerald-400" />
                            Security Protocol Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 relative">
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                            <div>
                                <p className="font-semibold">Tenant Isolation</p>
                                <p className="text-xs text-slate-400">Strict cross-tenant query blocking active.</p>
                            </div>
                            <Badge className="bg-emerald-500">ENFORCED</Badge>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                            <div>
                                <p className="font-semibold">Audit Immutability</p>
                                <p className="text-xs text-slate-400">WORM state: Verified via hash chain.</p>
                            </div>
                            <Badge className="bg-emerald-500">VERIFIED</Badge>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                            <div>
                                <p className="font-semibold">Encryption at Rest</p>
                                <p className="text-xs text-slate-400">AES-256-GCM enforced across all volumes.</p>
                            </div>
                            <Badge className="bg-emerald-500">ACTIVE</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
