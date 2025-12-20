"use client";

import { useState, useEffect } from "react";
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

const MANDATORY_ROLES = [
    { role: "REGISTRAR", label: "Registrar", description: "Academic operations & compliance" },
    { role: "FINANCE", label: "Finance Officer", description: "Fee management & payroll" },
    { role: "EXAM_CONTROLLER", label: "Exam Controller", description: "Assessment & grading governance" },
];

export default function StaffSetup() {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);

    const [newStaff, setNewStaff] = useState({
        name: "",
        email: "",
        username: "",
        password: "",
        role: "REGISTRAR",
        departmentId: ""
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [staffRes, deptRes] = await Promise.all([
                api.get("/users"),
                api.get("/departments")
            ]);
            // Filter users belonging to this university (excluding self if needed, but showing all is fine)
            setStaffList(staffRes.data.filter((u: any) => u.role !== 'SUPER_ADMIN'));
            setDepartments(deptRes.data);
        } catch (err) {
            console.error("Failed to fetch staff/depts", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newStaff.email || !newStaff.password || !newStaff.name) {
            toast.error("Please fill all required fields");
            return;
        }

        try {
            const res = await api.post("/users", newStaff);
            setStaffList([...staffList, res.data]);
            setNewStaff({
                name: "",
                email: "",
                username: "",
                password: "",
                role: "REGISTRAR",
                departmentId: ""
            });
            toast.success(`${newStaff.role} account created successfully!`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to create user");
        }
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
            await api.post("/onboarding/staff", { staffCount: staffList.length });
            window.location.href = "/onboarding/modules";
        } catch (err) {
            toast.error("Failed to save progress");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <p className="text-slate-500 font-medium font-outfit">Recruiting Institutional Leadership...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight font-outfit">Staff & Roles</h1>
                <p className="text-slate-500 font-medium mt-2">Appoint key administrative officers and department heads.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Form Column */}
                <Card className="lg:col-span-1 border-0 shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden sticky top-8 h-fit">
                    <CardHeader className="bg-slate-50/50 border-b p-8">
                        <CardTitle className="text-xl font-bold flex items-center gap-3 font-outfit text-blue-600">
                            <UserPlus className="h-6 w-6" />
                            Create Account
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleAddStaff} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</Label>
                                <Input
                                    value={newStaff.name}
                                    onChange={e => setNewStaff({ ...newStaff, name: e.target.value })}
                                    placeholder="Prof. John Doe"
                                    className="rounded-xl border-slate-200"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</Label>
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
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Temporary Password</Label>
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
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Primary Role</Label>
                                <select
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium"
                                    value={newStaff.role}
                                    onChange={e => setNewStaff({ ...newStaff, role: e.target.value })}
                                >
                                    {MANDATORY_ROLES.map(r => <option key={r.role} value={r.role}>{r.label}</option>)}
                                    <option value="HOD">HOD (Dept Head)</option>
                                    <option value="FACULTY">Faculty Member</option>
                                </select>
                            </div>

                            {newStaff.role === 'HOD' && (
                                <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Department</Label>
                                    <select
                                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium"
                                        value={newStaff.departmentId}
                                        onChange={e => setNewStaff({ ...newStaff, departmentId: e.target.value })}
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                    </select>
                                </div>
                            )}

                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-bold mt-4 shadow-lg shadow-blue-100">
                                Create Account
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* List Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        {MANDATORY_ROLES.map(role => {
                            const isAdded = staffList.some(s => s.role === role.role);
                            return (
                                <div key={role.role} className={cn(
                                    "p-6 rounded-3xl border-2 transition-all",
                                    isAdded ? "bg-emerald-50/50 border-emerald-100" : "bg-white border-slate-100 border-dashed"
                                )}>
                                    <div className="flex justify-between items-start mb-2">
                                        <ShieldCheck className={cn("h-6 w-6", isAdded ? "text-emerald-500" : "text-slate-300")} />
                                        {isAdded && <Badge className="bg-emerald-500 text-white border-0 shadow-sm">Assigned</Badge>}
                                    </div>
                                    <h3 className="font-bold text-slate-900">{role.label}</h3>
                                    <p className="text-xs text-slate-500 mt-1">{role.description}</p>
                                </div>
                            );
                        })}
                    </div>

                    <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b p-8">
                            <CardTitle className="text-xl font-bold flex items-center gap-3 font-outfit">
                                <Users className="h-6 w-6 text-slate-600" />
                                Institutional Roster
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100">
                                {staffList.map((staff) => (
                                    <div key={staff._id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400">
                                                {staff.name.split(' ').map((n: string) => n[0]).join('')}
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
                                            {staff.role === 'UNIVERSITY_ADMIN' && <Badge className="bg-blue-50 text-blue-600 border-0 text-[10px]">OWNER</Badge>}
                                        </div>
                                    </div>
                                ))}
                                {staffList.length === 0 && (
                                    <div className="p-12 text-center text-slate-400 font-medium">
                                        No officers appointed yet.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end pt-8">
                        <Button
                            onClick={handleProceed}
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] px-12 h-16 text-lg font-black shadow-2xl shadow-blue-200 flex items-center gap-3 transition-all hover:scale-105"
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
