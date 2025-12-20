"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    BookOpen, Plus, Trash2, Building2,
    Save, ArrowRight, Loader2, GraduationCap
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function AcademicsSetup() {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [departments, setDepartments] = useState<any[]>([]);
    const [programs, setPrograms] = useState<any[]>([]);

    // Form states for adding
    const [newDept, setNewDept] = useState({ name: "", code: "" });
    const [newProg, setNewProg] = useState({ name: "", code: "", departmentId: "", level: "UG", duration: 4 });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [deptRes, progRes] = await Promise.all([
                api.get("/departments"),
                api.get("/programs")
            ]);
            setDepartments(deptRes.data);
            setPrograms(progRes.data);
        } catch (err) {
            console.error("Failed to fetch academics", err);
        } finally {
            setLoading(false);
        }
    };

    const addDepartment = async () => {
        if (!newDept.name || !newDept.code) return;
        try {
            const res = await api.post("/departments", newDept);
            setDepartments([...departments, res.data]);
            setNewDept({ name: "", code: "" });
            toast.success("Department added");
        } catch (err) {
            toast.error("Failed to add department");
        }
    };

    const addProgram = async () => {
        if (!newProg.name || !newProg.code || !newProg.departmentId) return;
        try {
            const res = await api.post("/programs", newProg);
            setPrograms([...programs, res.data]);
            setNewProg({ ...newProg, name: "", code: "" });
            toast.success("Program added");
        } catch (err) {
            toast.error("Failed to add program");
        }
    };

    const deleteItem = async (type: 'dept' | 'prog', id: string) => {
        try {
            await api.delete(`/${type === 'dept' ? 'departments' : 'programs'}/${id}`);
            if (type === 'dept') setDepartments(departments.filter(d => d._id !== id));
            else setPrograms(programs.filter(p => p._id !== id));
            toast.success("Item removed");
        } catch (err) {
            toast.error("Failed to remove item");
        }
    };

    const handleProceed = async () => {
        if (departments.length === 0) {
            toast.error("At least one department is required to proceed.");
            return;
        }
        setSaving(true);
        try {
            await api.post("/onboarding/academics", { departmentCount: departments.length, programCount: programs.length });
            // router.push("/onboarding/staff"); // We'll use window.location if router is tricky in this env
            window.location.href = "/onboarding/staff";
        } catch (err) {
            toast.error("Failed to save progress.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <p className="text-slate-500 font-medium font-outfit">Mapping Academic Architecture...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight font-outfit">Academic Structure</h1>
                <p className="text-slate-500 font-medium mt-2">Define your departments and educational programs.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Department Section */}
                <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b p-8">
                        <CardTitle className="text-xl font-bold flex items-center gap-3 font-outfit">
                            <Building2 className="h-6 w-6 text-indigo-600" />
                            Departments
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-600 text-[10px] uppercase tracking-widest">Dept Name</Label>
                                <Input
                                    value={newDept.name}
                                    onChange={e => setNewDept({ ...newDept, name: e.target.value })}
                                    placeholder="Computer Science"
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-600 text-[10px] uppercase tracking-widest">Code</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={newDept.code}
                                        onChange={e => setNewDept({ ...newDept, code: e.target.value.toUpperCase() })}
                                        placeholder="CSE"
                                        className="rounded-xl uppercase"
                                    />
                                    <Button onClick={addDepartment} size="icon" className="bg-indigo-600 rounded-xl shrink-0">
                                        <Plus className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4">
                            {departments.map((dept) => (
                                <div key={dept._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                                    <div>
                                        <p className="font-bold text-slate-900">{dept.name}</p>
                                        <Badge variant="outline" className="text-[10px] font-black">{dept.code}</Badge>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => deleteItem('dept', dept._id)}
                                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {departments.length === 0 && (
                                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-3xl">
                                    <p className="text-slate-400 text-sm font-medium">No departments defined yet.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Programs Section */}
                <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b p-8">
                        <CardTitle className="text-xl font-bold flex items-center gap-3 font-outfit">
                            <BookOpen className="h-6 w-6 text-emerald-600" />
                            Programs (Degrees)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <Label className="font-bold text-slate-600 text-[10px] uppercase tracking-widest">Program Name</Label>
                                <Input
                                    value={newProg.name}
                                    onChange={e => setNewProg({ ...newProg, name: e.target.value })}
                                    placeholder="B.Tech Computer Science"
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-600 text-[10px] uppercase tracking-widest">Level</Label>
                                <select
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
                                    value={newProg.level}
                                    onChange={e => setNewProg({ ...newProg, level: e.target.value })}
                                >
                                    <option value="UG">Undergraduate</option>
                                    <option value="PG">Postgraduate</option>
                                    <option value="PhD">Doctorate</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-600 text-[10px] uppercase tracking-widest">Department</Label>
                                <select
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
                                    value={newProg.departmentId}
                                    onChange={e => setNewProg({ ...newProg, departmentId: e.target.value })}
                                >
                                    <option value="">Select Dept</option>
                                    {departments.map(d => <option key={d._id} value={d._id}>{d.code}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Button onClick={addProgram} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 font-bold gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Program
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4">
                            {programs.map((prog) => (
                                <div key={prog._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                                    <div>
                                        <p className="font-bold text-slate-900">{prog.name}</p>
                                        <div className="flex gap-2 mt-1">
                                            <Badge className="bg-emerald-50 text-emerald-700 border-0 text-[10px]">{prog.level}</Badge>
                                            <Badge variant="outline" className="text-[10px]">{departments.find(d => d._id === prog.departmentId)?.code || "N/A"}</Badge>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => deleteItem('prog', prog._id)}
                                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {programs.length === 0 && (
                                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-3xl">
                                    <p className="text-slate-400 text-sm font-medium">No programs added yet.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end pt-12">
                <Button
                    onClick={handleProceed}
                    disabled={saving || departments.length === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] px-12 h-16 text-lg font-black shadow-2xl shadow-blue-200 flex items-center gap-3 transition-all hover:scale-105"
                >
                    {saving ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
                    Lock Structure & Proceed
                    <ArrowRight className="h-6 w-6" />
                </Button>
            </div>
        </div>
    );
}
