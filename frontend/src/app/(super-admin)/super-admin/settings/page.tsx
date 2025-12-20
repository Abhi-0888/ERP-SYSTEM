"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    Settings, Shield, Clock, HardDrive,
    Mail, MessageSquare, Zap, Save,
    RefreshCcw, Eye, EyeOff
} from "lucide-react";
import { toast } from "sonner";

export default function SystemSettingsPage() {
    const [maskKeys, setMaskKeys] = useState(true);

    const handleSave = () => {
        toast.promise(new Promise(resolve => setTimeout(resolve, 1500)), {
            loading: 'Propagating global configuration changes...',
            success: 'System settings updated and distributed successfully',
            error: 'Failed to update system settings'
        });
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 border-l-4 border-slate-900 pl-4">Global System Settings</h1>
                    <p className="text-slate-500 mt-1">Foundational platform rules, security policies, and service integrations.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl border-slate-200">
                        <RefreshCcw className="h-4 w-4 mr-2" />Revert to Default
                    </Button>
                    <Button onClick={handleSave} className="rounded-xl bg-slate-900 text-white shadow-xl px-8">
                        <Save className="h-4 w-4 mr-2" />Save Configuration
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Security & Authentication */}
                <Card className="border-0 shadow-sm rounded-3xl border border-slate-100 overflow-hidden">
                    <CardHeader className="bg-slate-50/50 p-6">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-600" />
                            Core Security & JWT Policies
                        </CardTitle>
                        <CardDescription>Configure protocol-level security enforcement.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">JWT Access Expiry (min)</label>
                                <Input type="number" defaultValue={60} className="rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Refresh Token Expiry (days)</label>
                                <Input type="number" defaultValue={7} className="rounded-xl" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 italic">
                                <div>
                                    <p className="text-sm font-semibold">Strict Password Complexity</p>
                                    <p className="text-[10px] text-slate-500">Require symbols, digits, and mixed-case.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 italic">
                                <div>
                                    <p className="text-sm font-semibold">Session Heartbeat Check</p>
                                    <p className="text-[10px] text-slate-500">Monitor active browser tab every 30s.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Infrastructure Limits */}
                <Card className="border-0 shadow-sm rounded-3xl border border-slate-100 overflow-hidden">
                    <CardHeader className="bg-slate-50/50 p-6">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Zap className="h-5 w-5 text-orange-500" />
                            Rate Limiting & Throttling
                        </CardTitle>
                        <CardDescription>Protect backend resources from abuse.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Global Rate Limit (req/min)</label>
                                <Input type="number" defaultValue={600} className="rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">File Upload Limit (MB)</label>
                                <Input type="number" defaultValue={25} className="rounded-xl" />
                            </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 text-orange-800">
                            <div className="flex gap-3">
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                <p className="text-xs leading-relaxed font-medium">Increasing rate limits may impact database performance across all tenants. Monitor CPU utilization during deployment.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* External Provider Integrations */}
                <Card className="lg:col-span-2 border-0 shadow-sm rounded-3xl border border-slate-100 overflow-hidden">
                    <CardHeader className="bg-slate-900 text-white p-6 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Settings className="h-5 w-5 text-slate-400" />
                                External Provider Mesh
                            </CardTitle>
                            <CardDescription className="text-slate-400">Masked configuration for platform utilities.</CardDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setMaskKeys(!maskKeys)}
                            className="text-white hover:bg-white/10"
                        >
                            {maskKeys ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                            {maskKeys ? 'Decrypt Preview' : 'Mask Credentials'}
                        </Button>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Email Provider */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-slate-800">
                                    <Mail className="h-5 w-5 text-blue-500" />
                                    <h3 className="font-bold text-sm uppercase tracking-tighter">Email Gateway (SMTP)</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Sender Host</label>
                                        <Input defaultValue="smtp.sendgrid.net" className="rounded-xl text-xs bg-slate-50 border-slate-100" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">API Key / Token</label>
                                        <div className="relative">
                                            <Input
                                                type={maskKeys ? "password" : "text"}
                                                defaultValue="SG.iW8sk219Sksk...masking..."
                                                className="rounded-xl text-xs bg-slate-50 border-slate-100 pr-10"
                                                readOnly={maskKeys}
                                            />
                                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-300" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SMS Provider */}
                            <div className="space-y-4 border-l border-slate-100 pl-8">
                                <div className="flex items-center gap-2 text-slate-800">
                                    <MessageSquare className="h-5 w-5 text-emerald-500" />
                                    <h3 className="font-bold text-sm uppercase tracking-tighter">SMS Gateway (Twilio)</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Account SID</label>
                                        <Input defaultValue="AC92839482934892348" className="rounded-xl text-xs bg-slate-50 border-slate-100" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Auth Token</label>
                                        <div className="relative">
                                            <Input
                                                type={maskKeys ? "password" : "text"}
                                                defaultValue="tw_secret_8234jkslkdfjlsdkj"
                                                className="rounded-xl text-xs bg-slate-50 border-slate-100 pr-10"
                                                readOnly={maskKeys}
                                            />
                                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-300" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Storage Provider */}
                            <div className="space-y-4 border-l border-slate-100 pl-8">
                                <div className="flex items-center gap-2 text-slate-800">
                                    <HardDrive className="h-5 w-5 text-purple-500" />
                                    <h3 className="font-bold text-sm uppercase tracking-tighter">Cloud Storage (AWS S3)</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Bucket Name</label>
                                        <Input defaultValue="educore-erp-production-us" className="rounded-xl text-xs bg-slate-50 border-slate-100" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Region/Zone</label>
                                        <Input defaultValue="us-east-1" className="rounded-xl text-xs bg-slate-50 border-slate-100" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600">
                    <Clock className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm font-bold text-blue-900">Config Propagation Lag: &lt; 5s</p>
                    <p className="text-xs text-blue-600">All connected environment nodes will be notified via cluster-bus of these changes immediately.</p>
                </div>
            </div>
        </div>
    );
}

