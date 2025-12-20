"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Save, ArrowRight, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

export default function ProfileSetup() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        address: "",
        contactEmail: "",
        contactPhone: "",
        academicSystem: "semester",
        academicYear: new Date().getFullYear().toString() + "-" + (new Date().getFullYear() + 1).toString().slice(-2)
    });

    useEffect(() => {
        const fetchExisting = async () => {
            setLoading(true);
            try {
                // Get general university data
                const res = await api.get("/onboarding/status");
                if (res.data.stageData?.stage1) {
                    setFormData(prev => ({ ...prev, ...res.data.stageData.stage1 }));
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchExisting();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post("/onboarding/profile", formData);
            toast.success("Profile saved successfully!");
            router.push("/onboarding/academics");
        } catch (err) {
            toast.error("Failed to save profile. Please check all fields.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <p className="text-slate-500 font-medium">Loading Institutional Profile...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight font-outfit">University Profile</h1>
                <p className="text-slate-500 font-medium mt-2">Establish your institution's digital identity and academic parameters.</p>
            </div>

            <Card className="border-0 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b p-8">
                    <CardTitle className="text-xl font-bold flex items-center gap-3 font-outfit">
                        <Building2 className="h-6 w-6 text-blue-600" />
                        Core Identity
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-10">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <Label className="font-bold text-slate-700">Institution Name</Label>
                            <Input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Stanford University"
                                className="rounded-xl border-slate-200 h-12"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="font-bold text-slate-700">Institution Code</Label>
                            <Input
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value })}
                                placeholder="e.g. STAN-01"
                                className="rounded-xl border-slate-200 h-12 uppercase"
                                required
                            />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <Label className="font-bold text-slate-700">Campus Address</Label>
                            <Input
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Plot 12, Academic Block, South Campus..."
                                className="rounded-xl border-slate-200 h-12"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="font-bold text-slate-700">Contact Email</Label>
                            <Input
                                type="email"
                                value={formData.contactEmail}
                                onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                                placeholder="admin@university.edu"
                                className="rounded-xl border-slate-200 h-12"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="font-bold text-slate-700">Contact Phone</Label>
                            <Input
                                value={formData.contactPhone}
                                onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                                placeholder="+1 (555) 000-0000"
                                className="rounded-xl border-slate-200 h-12"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="font-bold text-slate-700">Academic System</Label>
                            <Select
                                value={formData.academicSystem}
                                onValueChange={v => setFormData({ ...formData, academicSystem: v })}
                            >
                                <SelectTrigger className="rounded-xl border-slate-200 h-12">
                                    <SelectValue placeholder="Select system" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="semester">Semester System</SelectItem>
                                    <SelectItem value="trimester">Trimester System</SelectItem>
                                    <SelectItem value="quarter">Quarter System</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="font-bold text-slate-700">Current Academic Year</Label>
                            <Input
                                value={formData.academicYear}
                                onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                                placeholder="2024-25"
                                className="rounded-xl border-slate-200 h-12"
                                required
                            />
                        </div>

                        <div className="md:col-span-2 flex justify-end pt-6">
                            <Button
                                type="submit"
                                disabled={saving}
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-8 h-12 font-bold shadow-xl shadow-blue-100 flex items-center gap-2"
                            >
                                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                Save & Proceed
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
