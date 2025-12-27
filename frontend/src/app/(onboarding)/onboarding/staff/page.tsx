"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Users, Plus, Trash2, UserPlus,
    ShieldCheck, ArrowRight, Loader2, Mail, Lock
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StaffMember {
    id: string;
    name: string;
    username: string;
    email: string;
    password: string;
    role: string;
    phoneNumber?: string;
}

const MANDATORY_ROLES = [
    { role: "REGISTRAR", label: "Registrar", description: "Academic operations & compliance" },
    { role: "FINANCE", label: "Finance Officer", description: "Fee management & payroll" },
];

const OPTIONAL_ROLES = [
    { role: "EXAM_CONTROLLER", label: "Exam Controller", description: "Assessment & grading governance" },
    { role: "HOD", label: "HOD (Dept Head)", description: "Department leadership" },
    { role: "FACULTY", label: "Faculty Member", description: "Teaching staff" },
    { role: "LIBRARIAN", label: "Librarian", description: "Library management" },
    { role: "ACCOUNTANT", label: "Accountant", description: "Financial records" },
];

const ALL_ROLES = [...MANDATORY_ROLES, ...OPTIONAL_ROLES];

export default function StaffSetup() {
    const [saving, setSaving] = useState(false);
    const [staffList, setStaffList] = useState<StaffMember[]>([]);

    const [newStaff, setNewStaff] = useState({
        name: "",
        email: "",
        username: "",
        password: "",
        role: "REGISTRAR",
        phoneNumber: ""
    });

    const handleAddStaff = (e: React.FormEvent) => {
        e.preventDefault();

        if (!newStaff.email || !newStaff.password || !newStaff.name) {
            toast.error("Please fill all required fields (name, email, password)");
            return;
        }

        // Generate username from email if not provided
        const username = newStaff.username || newStaff.email.split('@')[0];

        // Check for duplicate email
        if (staffList.some(s => s.email === newStaff.email)) {
            toast.error("A staff member with this email already exists");
            return;
        }

        // Check for duplicate username
        if (staffList.some(s => s.username === username)) {
            toast.error("A staff member with this username already exists");
            return;
        }

        const staff: StaffMember = {
            id: `temp-${Date.now()}`,
            name: newStaff.name,
            username: username,
            email: newStaff.email,
            password: newStaff.password,
            role: newStaff.role,
            phoneNumber: newStaff.phoneNumber || undefined
        };

        setStaffList([...staffList, staff]);
        setNewStaff({
            name: "",
            email: "",
            username: "",
            password: "",
            role: "REGISTRAR",
            phoneNumber: ""
        });
        toast.success(`${newStaff.role} added to roster`);
    };

    const deleteStaff = (id: string) => {
        setStaffList(staffList.filter(s => s.id !== id));
        toast.success("Staff member removed");
    };

    const handleProceed = async () => {
        const hasRegistrar = staffList.some(s => s.role === 'REGISTRAR');
        const hasFinance = staffList.some(s => s.role === 'FINANCE');

        if (!hasRegistrar || !hasFinance) {
            toast.error("Registrar and Finance Officer are mandatory to proceed.");
            return;
        }

        setSaving(true);
        try {
            // Submit all staff via onboarding endpoint for batch creation
            const payload = {
                staff: staffList.map(s => ({
                    username: s.username,
                    email: s.email,
                    password: s.password,
                    role: s.role,
                    phoneNumber: s.phoneNumber
                }))
            };

            const response = await api.post("/onboarding/staff", payload);

            if (response.data?.stageData?.errors?.length > 0) {
                toast.warning(`Completed with warnings: ${response.data.stageData.errors.join(", ")}`);
            } else {
                toast.success("Staff accounts created successfully!");
            }

            window.location.href = "/onboarding/modules";
        } catch (err: any) {
            console.error("Failed to save staff:", err);
            toast.error(err.response?.data?.message || "Failed to create staff accounts");
        } finally {
            setSaving(false);
        }
    };

    const isRoleAssigned = (role: string) => staffList.some(s => s.role === role);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight font-outfit">Staff & Roles</h1>
                <p className="text-slate-500 font-medium mt-2">Appoint key administrative officers. Registrar and Finance Officer are required.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Form Column */}
                <Card className="lg:col-span-1 border-0 shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden sticky top-8 h-fit">
                    <CardHeader className="bg-slate-50/50 border-b p-8">
                        <CardTitle className="text-xl font-bold flex items-center gap-3 font-outfit text-blue-600">
                            <UserPlus className="h-6 w-6" />
                            Add Staff Member
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleAddStaff} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name *</Label>
                                <Input
                                    value={newStaff.name}
                                    onChange={e => setNewStaff({ ...newStaff, name: e.target.value })}
                                    placeholder="Prof. John Doe"
                                    className="rounded-xl border-slate-200"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address *</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        type="email"
                                        value={newStaff.email}
                                        onChange={e => setNewStaff({ ...newStaff, email: e.target.value })}
                                        placeholder="registrar@univ.edu"
                                        className="rounded-xl border-slate-200 pl-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Username (optional)</Label>
                                <Input
                                    value={newStaff.username}
                                    onChange={e => setNewStaff({ ...newStaff, username: e.target.value })}
                                    placeholder="Auto-generated from email"
                                    className="rounded-xl border-slate-200"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password *</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        type="password"
                                        value={newStaff.password}
                                        onChange={e => setNewStaff({ ...newStaff, password: e.target.value })}
                                        placeholder="••••••••"
                                        className="rounded-xl border-slate-200 pl-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Primary Role *</Label>
                                <select
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium"
                                    value={newStaff.role}
                                    onChange={e => setNewStaff({ ...newStaff, role: e.target.value })}
                                >
                                    {ALL_ROLES.map(r => (
                                        <option key={r.role} value={r.role}>{r.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone (optional)</Label>
                                <Input
                                    value={newStaff.phoneNumber}
                                    onChange={e => setNewStaff({ ...newStaff, phoneNumber: e.target.value })}
                                    placeholder="+1234567890"
                                    className="rounded-xl border-slate-200"
                                />
                            </div>

                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-bold mt-4 shadow-lg shadow-blue-100">
                                <Plus className="h-4 w-4 mr-2" />
                                Add to Roster
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* List Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Mandatory Roles Status */}
                    <div className="grid grid-cols-2 gap-4">
                        {MANDATORY_ROLES.map(role => {
                            const isAdded = isRoleAssigned(role.role);
                            return (
                                <div key={role.role} className={cn(
                                    "p-6 rounded-3xl border-2 transition-all",
                                    isAdded ? "bg-emerald-50/50 border-emerald-100" : "bg-amber-50/50 border-amber-200 border-dashed"
                                )}>
                                    <div className="flex justify-between items-start mb-2">
                                        <ShieldCheck className={cn("h-6 w-6", isAdded ? "text-emerald-500" : "text-amber-400")} />
                                        {isAdded ? (
                                            <Badge className="bg-emerald-500 text-white border-0 shadow-sm">Assigned</Badge>
                                        ) : (
                                            <Badge className="bg-amber-500 text-white border-0 shadow-sm">Required</Badge>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-slate-900">{role.label}</h3>
                                    <p className="text-xs text-slate-500 mt-1">{role.description}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Staff List */}
                    <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b p-8">
                            <CardTitle className="text-xl font-bold flex items-center gap-3 font-outfit">
                                <Users className="h-6 w-6 text-slate-600" />
                                Institutional Roster
                                {staffList.length > 0 && (
                                    <Badge className="ml-auto bg-blue-100 text-blue-700 border-0">{staffList.length}</Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100">
                                {staffList.map((staff) => (
                                    <div key={staff.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400">
                                                {staff.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{staff.name}</p>
                                                <p className="text-xs text-slate-400 font-bold">{staff.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="secondary" className="bg-white border-slate-200 text-[10px] font-black uppercase tracking-widest px-3 py-1">
                                                {staff.role}
                                            </Badge>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => deleteStaff(staff.id)}
                                                className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {staffList.length === 0 && (
                                    <div className="p-12 text-center text-slate-400 font-medium">
                                        No officers appointed yet. Add Registrar and Finance Officer to proceed.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end pt-8">
                        <Button
                            onClick={handleProceed}
                            disabled={saving || !isRoleAssigned('REGISTRAR') || !isRoleAssigned('FINANCE')}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] px-12 h-16 text-lg font-black shadow-2xl shadow-blue-200 flex items-center gap-3 transition-all hover:scale-105 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="h-6 w-6 animate-spin" /> : <ShieldCheck className="h-6 w-6" />}
                            Verify Authority & Proceed
                            <ArrowRight className="h-6 w-6" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
