"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs";
import {
    User, Bell, Shield, Palette, Globe, Loader2
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

export default function SettingsPage() {
    const { user, activeRole } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userId = (user as any)?.id || (user as any)?._id;
                if (!userId) {
                    // Fallback: use data from auth context
                    setProfile({
                        name: (user as any)?.name || (user as any)?.username || "",
                        username: (user as any)?.username || "",
                        email: (user as any)?.email || "",
                        phoneNumber: (user as any)?.phoneNumber || "",
                        role: activeRole || (user as any)?.role || "",
                    });
                    setLoading(false);
                    return;
                }
                const res = await api.get(`/users/${userId}`);
                setProfile(res.data);
            } catch (error) {
                console.error("Failed to load profile", error);
                // Fallback to auth context data
                setProfile({
                    name: (user as any)?.name || (user as any)?.username || "",
                    username: (user as any)?.username || "",
                    email: (user as any)?.email || "",
                    phoneNumber: (user as any)?.phoneNumber || "",
                    role: activeRole || (user as any)?.role || "",
                });
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user, activeRole]);

    const handleSaveProfile = async () => {
        try {
            const userId = (user as any)?.id || (user as any)?._id;
            if (!userId || !profile) return;
            const payload: any = {
                name: profile.name,
                username: profile.username,
                email: profile.email,
                phoneNumber: profile.phoneNumber,
            };
            await api.patch(`/users/${userId}`, payload);
            toast.success("Profile updated successfully");
        } catch {
            toast.error("Failed to update profile");
        }
    };

    const handleChangePassword = async () => {
        try {
            const userId = (user as any)?.id || (user as any)?._id;
            if (!userId) return;
            if (!newPassword || newPassword !== confirmPassword) {
                toast.error("Passwords do not match");
                return;
            }
            if (newPassword.length < 8) {
                toast.error("Password must be at least 8 characters");
                return;
            }
            await api.patch(`/users/${userId}`, { password: newPassword });
            setNewPassword("");
            setConfirmPassword("");
            toast.success("Password updated successfully");
        } catch {
            toast.error("Failed to update password");
        }
    };

    // Format role for display (e.g. "UNIVERSITY_ADMIN" -> "University Admin")
    const formatRole = (role: string) => {
        if (!role) return "N/A";
        return role.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    };

    // Get initials from username or name
    const getInitials = () => {
        const name = profile?.name || profile?.username || (user as any)?.name || "U";
        return name.substring(0, 2).toUpperCase();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-slate-500 text-sm">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-slate-500">Manage your account and preferences</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />Profile
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />Notifications
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />Security
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />Appearance
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Profile Information</CardTitle>
                            <CardDescription>Your personal account details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                    {getInitials()}
                                </div>
                                <div>
                                    <p className="font-bold text-lg">{profile?.name || profile?.username || "N/A"}</p>
                                    <p className="text-sm text-slate-500">{formatRole(profile?.role || activeRole || "")}</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Full Name</label>
                                    <Input
                                        value={profile?.name || ""}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input
                                        type="email"
                                        value={profile?.email || ""}
                                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Phone</label>
                                    <Input
                                        value={profile?.phoneNumber || ""}
                                        onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                                        placeholder="Enter phone number"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Role</label>
                                    <Input
                                        value={formatRole(profile?.role || activeRole || "")}
                                        disabled
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={handleSaveProfile}>Save Changes</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications">
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Notification Preferences</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { title: "Email Notifications", desc: "Receive email updates" },
                                { title: "Push Notifications", desc: "Receive push notifications" },
                                { title: "SMS Alerts", desc: "Receive SMS for important updates" },
                                { title: "Weekly Digest", desc: "Receive weekly summary emails" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="font-medium">{item.title}</p>
                                        <p className="text-sm text-slate-500">{item.desc}</p>
                                    </div>
                                    <input type="checkbox" defaultChecked={i < 2} className="h-5 w-5" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security">
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Security Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="font-medium">Change Password</h3>
                                <div className="grid gap-4 max-w-md">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">New Password</label>
                                        <Input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Minimum 8 characters"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Confirm New Password</label>
                                        <Input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm your new password"
                                        />
                                    </div>
                                    <Button className="w-fit" onClick={handleChangePassword}>Update Password</Button>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h3 className="font-medium">Two-Factor Authentication</h3>
                                <p className="text-sm text-slate-500">Add an extra layer of security to your account</p>
                                <Button variant="outline">Enable 2FA</Button>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h3 className="font-medium">Active Sessions</h3>
                                <div className="p-4 bg-slate-50 rounded-lg flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Current Session</p>
                                        <p className="text-sm text-slate-500">Active now</p>
                                    </div>
                                    <Button variant="outline" size="sm">Sign Out</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="appearance">
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Appearance</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="font-medium">Theme</h3>
                                <div className="flex gap-4">
                                    {["Light", "Dark", "System"].map((theme) => (
                                        <div
                                            key={theme}
                                            className={`p-4 border-2 rounded-lg cursor-pointer ${theme === "Light" ? "border-blue-500" : "border-slate-200"
                                                }`}
                                        >
                                            <div className={`w-16 h-10 rounded ${theme === "Dark" ? "bg-slate-800" : "bg-slate-100"
                                                }`} />
                                            <p className="text-sm text-center mt-2">{theme}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h3 className="font-medium">Language</h3>
                                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg max-w-xs">
                                    <Globe className="h-5 w-5 text-slate-500" />
                                    <span>English (US)</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
