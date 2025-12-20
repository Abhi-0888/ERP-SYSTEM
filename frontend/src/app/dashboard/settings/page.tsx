"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs";
import {
    Settings, User, Bell, Shield, Palette, Globe
} from "lucide-react";

export default function SettingsPage() {
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
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                    SA
                                </div>
                                <Button variant="outline">Change Avatar</Button>
                            </div>

                            <Separator />

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Full Name</label>
                                    <Input defaultValue="Super Admin" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input defaultValue="superadmin@educore.com" type="email" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Phone</label>
                                    <Input defaultValue="+91 98765 43210" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Role</label>
                                    <Input defaultValue="Super Admin" disabled />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button>Save Changes</Button>
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
                                        <label className="text-sm font-medium">Current Password</label>
                                        <Input type="password" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">New Password</label>
                                        <Input type="password" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Confirm New Password</label>
                                        <Input type="password" />
                                    </div>
                                    <Button className="w-fit">Update Password</Button>
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
                                        <p className="font-medium">Windows - Chrome</p>
                                        <p className="text-sm text-slate-500">Current session • Active now</p>
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
