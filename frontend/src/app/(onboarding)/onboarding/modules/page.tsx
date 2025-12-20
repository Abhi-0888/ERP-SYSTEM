"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Settings2, CheckCircle2, Circle,
    ArrowRight, Loader2, BookOpen, Save,
    ClipboardList, CreditCard, Library,
    Building2, Briefcase, GraduationCap
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const ERP_MODULES = [
    { id: "academics", name: "Academic Management", icon: GraduationCap, description: "Programs, Courses & Enrollments", color: "text-blue-600", bg: "bg-blue-50" },
    { id: "attendance", name: "Smart Attendance", icon: ClipboardList, description: "Biometric & manual tracking", color: "text-emerald-600", bg: "bg-emerald-50" },
    { id: "exams", name: "Examination Engine", icon: BookOpen, description: "Results & transcript generation", color: "text-purple-600", bg: "bg-purple-50" },
    { id: "fees", name: "Financial Control", icon: CreditCard, description: "Fee collection & reconciliations", color: "text-orange-600", bg: "bg-orange-50" },
    { id: "library", name: "Digital Library", icon: Library, description: "Koha integration & book tracking", color: "text-indigo-600", bg: "bg-indigo-50" },
    { id: "hostel", name: "Residence Management", icon: Building2, description: "Room allocation & warden controls", color: "text-pink-600", bg: "bg-pink-50" },
    { id: "placement", name: "Career Services", icon: Briefcase, description: "Corporate relations & scheduling", color: "text-cyan-600", bg: "bg-cyan-50" },
];

export default function ModulesSetup() {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [enabledModules, setEnabledModules] = useState<string[]>(["academics"]);

    useEffect(() => {
        const fetchModules = async () => {
            setLoading(true);
            try {
                const res = await api.get("/onboarding/status");
                if (res.data.stageData?.stage4?.enabledModules) {
                    setEnabledModules(res.data.stageData.stage4.enabledModules);
                }
            } catch (err) {
                console.error("Failed to fetch modules", err);
            } finally {
                setLoading(false);
            }
        };
        fetchModules();
    }, []);

    const toggleModule = (id: string) => {
        if (id === "academics") return; // Academics is core and mandatory
        setEnabledModules(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const handleProceed = async () => {
        setSaving(true);
        try {
            await api.post("/onboarding/modules", { enabledModules });
            toast.success("Module configuration synchronized");
            window.location.href = "/onboarding/import";
        } catch (err) {
            toast.error("Failed to save module configuration");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <p className="text-slate-500 font-medium font-outfit">Calibrating Specialized Modules...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight font-outfit">Module Configuration</h1>
                <p className="text-slate-500 font-medium mt-2">Enable or disable core subsystems based on your institutional needs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ERP_MODULES.map((module) => {
                    const isEnabled = enabledModules.includes(module.id);
                    return (
                        <Card
                            key={module.id}
                            className={cn(
                                "border-2 transition-all p-6 rounded-[2.5rem] cursor-pointer group flex items-center justify-between",
                                isEnabled ? "bg-white border-blue-100 shadow-xl shadow-blue-50" : "bg-slate-50/50 border-transparent opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                            )}
                            onClick={() => toggleModule(module.id)}
                        >
                            <div className="flex items-center gap-6">
                                <div className={cn("p-5 rounded-2xl group-hover:scale-110 transition-transform", module.bg)}>
                                    <module.icon className={cn("h-8 w-8", module.color)} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-slate-900 text-lg">{module.name}</h3>
                                    <p className="text-sm text-slate-500">{module.description}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <Switch
                                    checked={isEnabled}
                                    onCheckedChange={() => toggleModule(module.id)}
                                    disabled={module.id === "academics"}
                                    className="data-[state=checked]:bg-blue-600"
                                />
                            </div>
                        </Card>
                    );
                })}
            </div>

            <div className="bg-blue-50 rounded-3xl p-8 border border-blue-100 flex items-center gap-6">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                    <Settings2 className="h-8 w-8 text-blue-600 animate-spin-slow" />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-blue-900">Dynamic UI Adaptation</h4>
                    <p className="text-sm text-blue-700/80">Disabling a module will automatically hide all related navigation entries and lock associated API routes for all users in your institution.</p>
                </div>
            </div>

            <div className="flex justify-end pt-8">
                <Button
                    onClick={handleProceed}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] px-12 h-16 text-lg font-black shadow-2xl shadow-blue-200 flex items-center gap-3 transition-all hover:scale-105"
                >
                    {saving ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
                    Lock Configuration & Proceed
                    <ArrowRight className="h-6 w-6" />
                </Button>
            </div>
        </div>
    );
}
