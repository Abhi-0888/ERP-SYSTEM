"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Upload, FileText, CheckCircle2,
    AlertCircle, ArrowRight, Loader2, Download,
    Users, GraduationCap, BookOpen
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const IMPORT_TYPES = [
    { id: "faculty", name: "Faculty Roster", icon: Users, template: "/templates/faculty_template.csv" },
    { id: "students", name: "Student Enrollment", icon: GraduationCap, template: "/templates/student_template.csv" },
    { id: "courses", name: "Course Curriculum", icon: BookOpen, template: "/templates/course_template.csv" },
];

export default function ImportSetup() {
    const [loading, setLoading] = useState(false);
    const [imports, setImports] = useState<Record<string, any>>({});

    const handleFileUpload = (type: string) => {
        setLoading(true);
        // Mocking upload delay
        setTimeout(() => {
            setImports(prev => ({
                ...prev,
                [type]: { status: 'success', count: Math.floor(Math.random() * 100) + 20 }
            }));
            setLoading(false);
            toast.success(`${type} data previewed successfully`);
        }, 1500);
    };

    const handleProceed = async () => {
        setLoading(true);
        try {
            await api.post("/onboarding/import", { importedTypes: Object.keys(imports) });
            window.location.href = "/onboarding/review";
        } catch (err) {
            toast.error("Failed to save import progress");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight font-outfit">Initial Data Import</h1>
                    <p className="text-slate-500 font-medium mt-2">Migrate your existing records via secure CSV batch processing.</p>
                </div>
                <Button variant="ghost" className="text-slate-400 font-bold hover:text-slate-900" onClick={() => (window.location.href = "/onboarding/review")}>
                    Skip for Now
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {IMPORT_TYPES.map((type) => {
                    const status = imports[type.id];
                    return (
                        <Card key={type.id} className="border-0 shadow-xl shadow-slate-100 rounded-[2.5rem] overflow-hidden group">
                            <CardContent className="p-8 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                        <type.icon className="h-8 w-8 text-slate-400 group-hover:text-blue-600 transition-colors" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg">{type.name}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <a href={type.template} className="text-[10px] font-black uppercase text-blue-600 tracking-widest flex items-center gap-1 hover:underline">
                                                <Download className="h-3 w-3" /> Download Template
                                            </a>
                                            {status && (
                                                <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest flex items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3" /> {status.count} Records Found
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => handleFileUpload(type.id)}
                                        className="rounded-2xl h-12 border-slate-200 hover:border-blue-200 hover:bg-blue-50 font-bold px-6 flex items-center gap-2"
                                    >
                                        <Upload className="h-4 w-4" />
                                        Upload CSV
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Card className="border-0 bg-amber-50 rounded-[2.5rem] p-8 border border-amber-100">
                <div className="flex gap-6">
                    <div className="p-4 bg-white rounded-2xl shadow-sm">
                        <AlertCircle className="h-8 w-8 text-amber-500" />
                    </div>
                    <div>
                        <h4 className="font-bold text-amber-900">Validation Check Required</h4>
                        <p className="text-sm text-amber-800/80 leading-relaxed max-w-2xl mt-1">
                            Uploaded data is stored in temporary buffer. Final ingestion will occur
                            after "Go Live" validation. Ensure headers match the template exactly
                            to avoid record rejection.
                        </p>
                    </div>
                </div>
            </Card>

            <div className="flex justify-end pt-8">
                <Button
                    onClick={handleProceed}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] px-12 h-16 text-lg font-black shadow-2xl shadow-blue-200 flex items-center gap-3 transition-all hover:scale-105"
                >
                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ArrowRight className="h-6 w-6" />}
                    Lock Data & Proceed
                    <ArrowRight className="h-6 w-6" />
                </Button>
            </div>
        </div>
    );
}
