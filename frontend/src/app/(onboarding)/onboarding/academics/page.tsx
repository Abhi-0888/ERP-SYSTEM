"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    BookOpen, Plus, Trash2, Building2,
    Save, ArrowRight, Loader2
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Department {
    id: string;
    name: string;
    code: string;
}

interface Program {
    id: string;
    name: string;
    code: string;
    departmentCode: string;
    level: string;
    duration: number;
}

export default function AcademicsSetup() {
    const [saving, setSaving] = useState(false);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);

    // Form states for adding
    const [newDept, setNewDept] = useState({ name: "", code: "" });
    const [newProg, setNewProg] = useState({ name: "", code: "", departmentCode: "", level: "UG", duration: 4 });

    const addDepartment = () => {
        if (!newDept.name || !newDept.code) {
            toast.error("Please fill in department name and code");
            return;
        }

        // Check for duplicate code
        if (departments.some(d => d.code === newDept.code.toUpperCase())) {
            toast.error("Department code already exists");
            return;
        }

        const dept: Department = {
            id: `temp-${Date.now()}`,
            name: newDept.name,
            code: newDept.code.toUpperCase()
        };
        setDepartments([...departments, dept]);
        setNewDept({ name: "", code: "" });
        toast.success("Department added to list");
    };

    const addProgram = () => {
        if (!newProg.name || !newProg.code || !newProg.departmentCode) {
            toast.error("Please fill in all program fields");
            return;
        }

        // Check for duplicate code
        if (programs.some(p => p.code === newProg.code.toUpperCase())) {
            toast.error("Program code already exists");
            return;
        }

        const prog: Program = {
            id: `temp-${Date.now()}`,
            name: newProg.name,
            code: newProg.code.toUpperCase(),
            departmentCode: newProg.departmentCode,
            level: newProg.level,
            duration: newProg.duration
        };
        setPrograms([...programs, prog]);
        setNewProg({ ...newProg, name: "", code: "" });
        toast.success("Program added to list");
    };

    const deleteDepartment = (id: string) => {
        const dept = departments.find(d => d.id === id);
        if (dept) {
            // Also remove any programs linked to this department
            setPrograms(programs.filter(p => p.departmentCode !== dept.code));
        }
        setDepartments(departments.filter(d => d.id !== id));
        toast.success("Department removed");
    };

    const deleteProgram = (id: string) => {
        setPrograms(programs.filter(p => p.id !== id));
        toast.success("Program removed");
    };

    const handleProceed = async () => {
        if (departments.length === 0) {
            toast.error("At least one department is required to proceed.");
            return;
        }

        setSaving(true);
        try {
            // Submit all data via onboarding endpoint
            const payload = {
                departments: departments.map(d => ({
                    name: d.name,
                    code: d.code
                })),
                programs: programs.map(p => ({
                    name: p.name,
                    code: p.code,
                    departmentCode: p.departmentCode,
                    level: p.level,
                    duration: p.duration
                }))
            };

            const response = await api.post("/onboarding/academics", payload);

            // Check for errors in response
            if (response.data?.stageData?.errors?.length > 0) {
                toast.warning(`Completed with warnings: ${response.data.stageData.errors.join(", ")}`);
            } else {
                toast.success("Academic structure saved successfully!");
            }

            window.location.href = "/onboarding/staff";
        } catch (err: any) {
            console.error("Failed to save academics:", err);
            toast.error(err.response?.data?.message || "Failed to save academic structure");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight font-outfit">Academic Structure</h1>
                <p className="text-slate-500 font-medium mt-2">Define your departments and educational programs. Add items below and click "Lock Structure" when ready.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Department Section */}
                <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b p-8">
                        <CardTitle className="text-xl font-bold flex items-center gap-3 font-outfit">
                            <Building2 className="h-6 w-6 text-indigo-600" />
                            Departments
                            {departments.length > 0 && (
                                <Badge className="ml-auto bg-indigo-100 text-indigo-700 border-0">{departments.length}</Badge>
                            )}
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
                                <div key={dept.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                                    <div>
                                        <p className="font-bold text-slate-900">{dept.name}</p>
                                        <Badge variant="outline" className="text-[10px] font-black">{dept.code}</Badge>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => deleteDepartment(dept.id)}
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
                            {programs.length > 0 && (
                                <Badge className="ml-auto bg-emerald-100 text-emerald-700 border-0">{programs.length}</Badge>
                            )}
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
                                <Label className="font-bold text-slate-600 text-[10px] uppercase tracking-widest">Code</Label>
                                <Input
                                    value={newProg.code}
                                    onChange={e => setNewProg({ ...newProg, code: e.target.value.toUpperCase() })}
                                    placeholder="BTECH-CS"
                                    className="rounded-xl uppercase"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-600 text-[10px] uppercase tracking-widest">Duration (Years)</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={newProg.duration}
                                    onChange={e => setNewProg({ ...newProg, duration: parseInt(e.target.value) || 4 })}
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
                                    <option value="Diploma">Diploma</option>
                                    <option value="PhD">Doctorate</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-600 text-[10px] uppercase tracking-widest">Department</Label>
                                <select
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
                                    value={newProg.departmentCode}
                                    onChange={e => setNewProg({ ...newProg, departmentCode: e.target.value })}
                                    disabled={departments.length === 0}
                                >
                                    <option value="">{departments.length === 0 ? "Add dept first" : "Select Dept"}</option>
                                    {departments.map(d => <option key={d.id} value={d.code}>{d.name} ({d.code})</option>)}
                                </select>
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Button
                                    onClick={addProgram}
                                    disabled={departments.length === 0}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 font-bold gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Program
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4">
                            {programs.map((prog) => (
                                <div key={prog.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                                    <div>
                                        <p className="font-bold text-slate-900">{prog.name}</p>
                                        <div className="flex gap-2 mt-1">
                                            <Badge className="bg-emerald-50 text-emerald-700 border-0 text-[10px]">{prog.level}</Badge>
                                            <Badge variant="outline" className="text-[10px]">{prog.departmentCode}</Badge>
                                            <Badge variant="outline" className="text-[10px]">{prog.duration} yrs</Badge>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => deleteProgram(prog.id)}
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
