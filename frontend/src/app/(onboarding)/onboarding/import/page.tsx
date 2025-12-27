"use client";

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Upload, CheckCircle2,
    AlertCircle, ArrowRight, Loader2, Download,
    Users, GraduationCap, BookOpen, X, FileText
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ImportStatus {
    status: 'pending' | 'uploading' | 'success' | 'error';
    count?: number;
    errors?: string[];
    preview?: any[];
}

const IMPORT_TYPES = [
    {
        id: "faculty",
        name: "Faculty Roster",
        icon: Users,
        description: "Import faculty members with their departments",
        fields: "name, email, department"
    },
    {
        id: "students",
        name: "Student Enrollment",
        icon: GraduationCap,
        description: "Import student records with program assignments",
        fields: "name, email, program, enrollment_year"
    },
    {
        id: "courses",
        name: "Course Curriculum",
        icon: BookOpen,
        description: "Import course catalog with credits",
        fields: "name, code, credits, program"
    },
];

export default function ImportSetup() {
    const [saving, setSaving] = useState(false);
    const [imports, setImports] = useState<Record<string, ImportStatus>>({});
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const handleFileSelect = (type: string) => {
        const input = fileInputRefs.current[type];
        if (input) {
            input.click();
        }
    };

    const handleFileUpload = async (type: string, file: File) => {
        if (!file || !file.name.endsWith('.csv')) {
            toast.error("Please select a valid CSV file");
            return;
        }

        setImports(prev => ({
            ...prev,
            [type]: { status: 'uploading' }
        }));

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post(`/onboarding/import/upload/${type}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const data = response.data;

            setImports(prev => ({
                ...prev,
                [type]: {
                    status: 'success',
                    count: data.validCount,
                    errors: data.errors,
                    preview: data.preview
                }
            }));

            if (data.errorCount > 0) {
                toast.warning(`${data.validCount} valid records, ${data.errorCount} errors`);
            } else {
                toast.success(`${data.validCount} records ready for import`);
            }
        } catch (err: any) {
            console.error("Upload failed:", err);
            setImports(prev => ({
                ...prev,
                [type]: {
                    status: 'error',
                    errors: [err.response?.data?.message || "Upload failed"]
                }
            }));
            toast.error(err.response?.data?.message || "Failed to upload file");
        }
    };

    const handleFileChange = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(type, file);
        }
        // Reset input
        e.target.value = '';
    };

    const removeImport = (type: string) => {
        setImports(prev => {
            const newImports = { ...prev };
            delete newImports[type];
            return newImports;
        });
    };

    const handleProceed = async () => {
        setSaving(true);
        try {
            // Process all uploaded imports
            await api.post("/onboarding/import", {
                importedTypes: Object.keys(imports).filter(k => imports[k].status === 'success')
            });
            toast.success("Data import completed!");
            window.location.href = "/onboarding/review";
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to process imports");
        } finally {
            setSaving(false);
        }
    };

    const handleSkip = async () => {
        setSaving(true);
        try {
            await api.post("/onboarding/import", { importedTypes: [] });
            window.location.href = "/onboarding/review";
        } catch (err) {
            toast.error("Failed to skip");
        } finally {
            setSaving(false);
        }
    };

    const successfulImports = Object.keys(imports).filter(k => imports[k].status === 'success');

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight font-outfit">Initial Data Import</h1>
                    <p className="text-slate-500 font-medium mt-2">Migrate your existing records via CSV upload. This step is optional.</p>
                </div>
                <Button
                    variant="ghost"
                    className="text-slate-400 font-bold hover:text-slate-900"
                    onClick={handleSkip}
                    disabled={saving}
                >
                    Skip for Now
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {IMPORT_TYPES.map((type) => {
                    const status = imports[type.id];
                    const isUploading = status?.status === 'uploading';
                    const isSuccess = status?.status === 'success';
                    const isError = status?.status === 'error';

                    return (
                        <Card
                            key={type.id}
                            className={cn(
                                "border-0 shadow-xl shadow-slate-100 rounded-[2.5rem] overflow-hidden transition-all",
                                isSuccess && "ring-2 ring-emerald-200 bg-emerald-50/30",
                                isError && "ring-2 ring-red-200 bg-red-50/30"
                            )}
                        >
                            <CardContent className="p-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className={cn(
                                            "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
                                            isSuccess ? "bg-emerald-100" : "bg-slate-50"
                                        )}>
                                            <type.icon className={cn(
                                                "h-8 w-8 transition-colors",
                                                isSuccess ? "text-emerald-600" : "text-slate-400"
                                            )} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg">{type.name}</h3>
                                            <p className="text-sm text-slate-500 mt-0.5">{type.description}</p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <Badge variant="outline" className="text-[10px] font-semibold">
                                                    Fields: {type.fields}
                                                </Badge>
                                                {isSuccess && status.count && (
                                                    <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px]">
                                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                                        {status.count} Records Ready
                                                    </Badge>
                                                )}
                                                {status?.errors && status.errors.length > 0 && (
                                                    <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px]">
                                                        <AlertCircle className="h-3 w-3 mr-1" />
                                                        {status.errors.length} Warnings
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {isSuccess && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeImport(type.id)}
                                                className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}

                                        <input
                                            type="file"
                                            accept=".csv"
                                            ref={el => { fileInputRefs.current[type.id] = el; }}
                                            onChange={(e) => handleFileChange(type.id, e)}
                                            className="hidden"
                                        />

                                        <Button
                                            variant={isSuccess ? "outline" : "default"}
                                            onClick={() => handleFileSelect(type.id)}
                                            disabled={isUploading}
                                            className={cn(
                                                "rounded-2xl h-12 font-bold px-6 flex items-center gap-2",
                                                isSuccess
                                                    ? "border-slate-200 hover:border-blue-200 hover:bg-blue-50"
                                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                                            )}
                                        >
                                            {isUploading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Upload className="h-4 w-4" />
                                            )}
                                            {isSuccess ? "Replace CSV" : "Upload CSV"}
                                        </Button>
                                    </div>
                                </div>

                                {/* Preview Section */}
                                {isSuccess && status.preview && status.preview.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-slate-100">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                                            <FileText className="h-3 w-3 inline mr-1" />
                                            Preview (first 5 records)
                                        </p>
                                        <div className="bg-slate-50 rounded-xl p-4 overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="text-left text-slate-500">
                                                        {Object.keys(status.preview[0]).slice(0, 4).map(key => (
                                                            <th key={key} className="pb-2 pr-4 font-medium">{key}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {status.preview.slice(0, 3).map((row, i) => (
                                                        <tr key={i} className="text-slate-700">
                                                            {Object.values(row).slice(0, 4).map((val, j) => (
                                                                <td key={j} className="py-1 pr-4">{String(val)}</td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Error Section */}
                                {status?.errors && status.errors.length > 0 && (
                                    <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                                        <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-2">
                                            Validation Warnings
                                        </p>
                                        <ul className="text-sm text-amber-800 space-y-1">
                                            {status.errors.slice(0, 5).map((err, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <AlertCircle className="h-3 w-3 mt-1 shrink-0" />
                                                    {err}
                                                </li>
                                            ))}
                                            {status.errors.length > 5 && (
                                                <li className="text-amber-600 font-medium">
                                                    ...and {status.errors.length - 5} more
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Card className="border-0 bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100">
                <div className="flex gap-6">
                    <div className="p-4 bg-white rounded-2xl shadow-sm">
                        <AlertCircle className="h-8 w-8 text-slate-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-700">CSV Format Requirements</h4>
                        <p className="text-sm text-slate-500 leading-relaxed max-w-2xl mt-1">
                            Files must be UTF-8 encoded CSV with headers matching the required fields.
                            Records with missing required fields will be skipped. You can always add
                            more data after Go-Live.
                        </p>
                    </div>
                </div>
            </Card>

            <div className="flex justify-end pt-8">
                <Button
                    onClick={handleProceed}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] px-12 h-16 text-lg font-black shadow-2xl shadow-blue-200 flex items-center gap-3 transition-all hover:scale-105"
                >
                    {saving ? <Loader2 className="h-6 w-6 animate-spin" /> : <ArrowRight className="h-6 w-6" />}
                    {successfulImports.length > 0
                        ? `Import ${successfulImports.length} Dataset${successfulImports.length > 1 ? 's' : ''} & Proceed`
                        : 'Skip Import & Proceed'
                    }
                    <ArrowRight className="h-6 w-6" />
                </Button>
            </div>
        </div>
    );
}
