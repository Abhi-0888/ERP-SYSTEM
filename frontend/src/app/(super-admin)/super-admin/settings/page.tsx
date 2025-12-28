"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "next/navigation";
import {
    Settings, Shield, Clock, HardDrive,
    Mail, MessageSquare, Zap, Save,
    RefreshCcw, Eye, EyeOff, AlertCircle, Lock
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export default function SystemSettingsPage() {
    const [maskKeys, setMaskKeys] = useState(true);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState<any>(null);
    const { user } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const searchParams = useSearchParams();
    const initialTab = searchParams.get("tab") === "system" ? "system" : "profile";
    const [activeTab, setActiveTab] = useState<string>(initialTab);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/settings/global');
                setSettings(res.data);
            } catch (error) {
                toast.error("Failed to load global configuration");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
        const fetchProfile = async () => {
            try {
                if (!user?.id) return;
                const res = await api.get(`/users/${user.id}`);
                setProfile(res.data);
            } catch (error) {
                toast.error("Failed to load profile");
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        try {
            await api.patch('/settings/global', settings);
            toast.success('System settings updated and distributed successfully');
        } catch (error) {
            toast.error('Failed to update system settings');
        }
    };

    const handleRevert = async () => {
        try {
            const res = await api.get('/settings/global');
            setSettings(res.data);
            toast.success('Configuration reverted');
        } catch {
            toast.error('Failed to revert configuration');
        }
    };

    const handleSaveProfile = async () => {
        try {
            if (!user?.id || !profile) return;
            const payload: any = {
                username: profile.username,
                email: profile.email,
                phoneNumber: profile.phoneNumber,
            };
            await api.patch(`/users/${user.id}`, payload);
            toast.success('Profile updated');
        } catch {
            toast.error('Failed to update profile');
        }
    };

    const handleChangePassword = async () => {
        try {
            if (!user?.id) return;
            if (!newPassword || newPassword !== confirmPassword) {
                toast.error('Passwords do not match');
                return;
            }
            await api.patch(`/users/${user.id}`, { password: newPassword });
            setNewPassword("");
            setConfirmPassword("");
            toast.success('Password updated');
        } catch {
            toast.error('Failed to update password');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 border-l-4 border-slate-900 pl-4">Global System Settings</h1>
                    <p className="text-slate-500 mt-1">Foundational platform rules, security policies, and service integrations.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl border-slate-200" onClick={handleRevert}>
                        <RefreshCcw className="h-4 w-4 mr-2" />Revert to Default
                    </Button>
                    <Button onClick={handleSave} className="rounded-xl bg-slate-900 text-white shadow-xl px-8">
                        <Save className="h-4 w-4 mr-2" />Save Configuration
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <TabsList>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="system">System</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <Card className="border-0 shadow-sm rounded-3xl border border-slate-100 overflow-hidden">
                        <CardHeader className="bg-slate-50/50 p-6">
                            <CardTitle className="text-lg">Account Profile</CardTitle>
                            <CardDescription>Manage your Super Admin account.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Username</label>
                                    <Input value={profile?.username || ""} onChange={(e) => setProfile({ ...profile, username: e.target.value })} className="rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Email</label>
                                    <Input type="email" value={profile?.email || ""} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Phone</label>
                                    <Input value={profile?.phoneNumber || ""} onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })} className="rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Role</label>
                                    <Input value="SUPER_ADMIN" disabled className="rounded-xl" />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={handleSaveProfile} className="rounded-xl">Save Profile</Button>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold">Change Password</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">New Password</label>
                                        <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Confirm Password</label>
                                        <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="rounded-xl" />
                                    </div>
                                    <div className="flex items-end">
                                        <Button onClick={handleChangePassword} className="rounded-xl">Update Password</Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="system">
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
                                <Input type="number" value={settings?.jwtAccessExpiry ?? ""} onChange={(e) => setSettings({ ...settings, jwtAccessExpiry: Number(e.target.value) })} className="rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Refresh Token Expiry (days)</label>
                                <Input type="number" value={settings?.jwtRefreshExpiry ?? ""} onChange={(e) => setSettings({ ...settings, jwtRefreshExpiry: Number(e.target.value) })} className="rounded-xl" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 italic">
                                <div>
                                    <p className="text-sm font-semibold">Strict Password Complexity</p>
                                    <p className="text-[10px] text-slate-500">Require symbols, digits, and mixed-case.</p>
                                </div>
                                <Switch checked={!!settings?.strictPasswordComplexity} onCheckedChange={(v) => setSettings({ ...settings, strictPasswordComplexity: v })} />
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 italic">
                                <div>
                                    <p className="text-sm font-semibold">Session Heartbeat Check</p>
                                    <p className="text-[10px] text-slate-500">Monitor active browser tab every 30s.</p>
                                </div>
                                <Switch checked={!!settings?.sessionHeartbeatEnabled} onCheckedChange={(v) => setSettings({ ...settings, sessionHeartbeatEnabled: v })} />
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
                                <Input type="number" value={settings?.globalRateLimit ?? ""} onChange={(e) => setSettings({ ...settings, globalRateLimit: Number(e.target.value) })} className="rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">File Upload Limit (MB)</label>
                                <Input type="number" value={settings?.maxFileUploadSizeMB ?? ""} onChange={(e) => setSettings({ ...settings, maxFileUploadSizeMB: Number(e.target.value) })} className="rounded-xl" />
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
                                        <Input value={settings?.emailProvider?.host || ""} onChange={(e) => setSettings({ ...settings, emailProvider: { ...(settings?.emailProvider || {}), host: e.target.value } })} className="rounded-xl text-xs bg-slate-50 border-slate-100" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">API Key / Token</label>
                                        <div className="relative">
                                            <Input
                                                type={maskKeys ? "password" : "text"}
                                                value={settings?.emailProvider?.apiKey || ""}
                                                onChange={(e) => setSettings({ ...settings, emailProvider: { ...(settings?.emailProvider || {}), apiKey: e.target.value } })}
                                                className="rounded-xl text-xs bg-slate-50 border-slate-100 pr-10"
                                                readOnly={maskKeys}
                                            />
                                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-300" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Sender</label>
                                        <Input value={settings?.emailProvider?.sender || ""} onChange={(e) => setSettings({ ...settings, emailProvider: { ...(settings?.emailProvider || {}), sender: e.target.value } })} className="rounded-xl text-xs bg-slate-50 border-slate-100" />
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
                                        <Input value={settings?.smsProvider?.accountSid || ""} onChange={(e) => setSettings({ ...settings, smsProvider: { ...(settings?.smsProvider || {}), accountSid: e.target.value } })} className="rounded-xl text-xs bg-slate-50 border-slate-100" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Auth Token</label>
                                        <div className="relative">
                                            <Input
                                                type={maskKeys ? "password" : "text"}
                                                value={settings?.smsProvider?.authToken || ""}
                                                onChange={(e) => setSettings({ ...settings, smsProvider: { ...(settings?.smsProvider || {}), authToken: e.target.value } })}
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
                                        <Input value={settings?.storageProvider?.bucket || ""} onChange={(e) => setSettings({ ...settings, storageProvider: { ...(settings?.storageProvider || {}), bucket: e.target.value } })} className="rounded-xl text-xs bg-slate-50 border-slate-100" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Region/Zone</label>
                                        <Input value={settings?.storageProvider?.region || ""} onChange={(e) => setSettings({ ...settings, storageProvider: { ...(settings?.storageProvider || {}), region: e.target.value } })} className="rounded-xl text-xs bg-slate-50 border-slate-100" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Access Key</label>
                                        <Input type={maskKeys ? "password" : "text"} value={settings?.storageProvider?.accessKey || ""} onChange={(e) => setSettings({ ...settings, storageProvider: { ...(settings?.storageProvider || {}), accessKey: e.target.value } })} className="rounded-xl text-xs bg-slate-50 border-slate-100" readOnly={maskKeys} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Secret Key</label>
                                        <Input type={maskKeys ? "password" : "text"} value={settings?.storageProvider?.secretKey || ""} onChange={(e) => setSettings({ ...settings, storageProvider: { ...(settings?.storageProvider || {}), secretKey: e.target.value } })} className="rounded-xl text-xs bg-slate-50 border-slate-100" readOnly={maskKeys} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
                </TabsContent>
            </Tabs>

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

