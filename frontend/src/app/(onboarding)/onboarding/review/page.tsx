"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ShieldCheck, CheckCircle2, AlertCircle,
    ArrowRight, Loader2, Rocket, Building2,
    Users, Settings2, Database, ShieldAlert
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

export default function ReviewSetup() {
    const { logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [activating, setActivating] = useState(false);
    const [status, setStatus] = useState<any>(null);
    const [validation, setValidation] = useState({
        profile: false,
        academics: false,
        staff: false,
        modules: false
    });

    useEffect(() => {
        const fetchStatus = async () => {
            setLoading(true);
            try {
                const res = await api.get("/onboarding/status");
                setStatus(res.data);

                // Perform simple validation
                setValidation({
                    profile: !!res.data.stageData?.stage1,
                    academics: (res.data.stageData?.stage2?.departmentCount || 0) > 0,
                    staff: (res.data.stageData?.stage3?.staffCount || 0) >= 2,
                    modules: !!res.data.stageData?.stage4
                });
            } catch (err) {
                console.error("Failed to fetch status", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStatus();
    }, []);

    const handleActivate = async () => {
        const allValid = Object.values(validation).every(v => v);
        if (!allValid) {
            toast.error("Please complete all mandatory setup stages.");
            return;
        }

        setActivating(true);
        try {
            await api.post("/onboarding/activate");
            toast.success("ERP Environment Activated Successfully!");

            // Redirect to dashboard - but we need to re-login to update token/claims 
            // Or the backend can just update the DB and frontend user state
            // Most reliable is a re-login or clearing state
            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 2000);
        } catch (err) {
            toast.error("Activation failed. Security protocols blocked the request.");
        } finally {
            setActivating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <p className="text-slate-500 font-medium font-outfit">Validating Security Protocols...</p>
            </div>
        );
    }

    const allValid = Object.values(validation).every(v => v);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center max-w-2xl mx-auto space-y-4">
                <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-blue-200 mb-6">
                    <Rocket className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight font-outfit">Go Live Validation</h1>
                <p className="text-slate-500 font-medium mt-2">Final review of your institutional environment before global activation.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card className={cn(
                    "border-0 shadow-lg rounded-[2.5rem] p-8",
                    validation.profile ? "bg-emerald-50/50" : "bg-white border-2 border-dashed border-slate-100"
                )}>
                    <div className="flex items-center gap-4">
                        <Building2 className={cn("h-6 w-6", validation.profile ? "text-emerald-600" : "text-slate-300")} />
                        <h4 className="font-bold">Institution Profile</h4>
                        {validation.profile ? <CheckCircle2 className="h-5 w-5 text-emerald-500 ml-auto" /> : <AlertCircle className="h-5 w-5 text-slate-300 ml-auto" />}
                    </div>
                </Card>

                <Card className={cn(
                    "border-0 shadow-lg rounded-[2.5rem] p-8",
                    validation.academics ? "bg-emerald-50/50" : "bg-white border-2 border-dashed border-slate-100"
                )}>
                    <div className="flex items-center gap-4">
                        <Users className={cn("h-6 w-6", validation.academics ? "text-emerald-600" : "text-slate-300")} />
                        <h4 className="font-bold">Academic Structure</h4>
                        {validation.academics ? <CheckCircle2 className="h-5 w-5 text-emerald-500 ml-auto" /> : <AlertCircle className="h-5 w-5 text-slate-300 ml-auto" />}
                    </div>
                </Card>

                <Card className={cn(
                    "border-0 shadow-lg rounded-[2.5rem] p-8",
                    validation.staff ? "bg-emerald-50/50" : "bg-white border-2 border-dashed border-slate-100"
                )}>
                    <div className="flex items-center gap-4">
                        <ShieldCheck className={cn("h-6 w-6", validation.staff ? "text-emerald-600" : "text-slate-300")} />
                        <h4 className="font-bold">Staff Governance</h4>
                        {validation.staff ? <CheckCircle2 className="h-5 w-5 text-emerald-500 ml-auto" /> : <AlertCircle className="h-5 w-5 text-slate-300 ml-auto" />}
                    </div>
                </Card>

                <Card className={cn(
                    "border-0 shadow-lg rounded-[2.5rem] p-8",
                    validation.modules ? "bg-emerald-50/50" : "bg-white border-2 border-dashed border-slate-100"
                )}>
                    <div className="flex items-center gap-4">
                        <Settings2 className={cn("h-6 w-6", validation.modules ? "text-emerald-600" : "text-slate-300")} />
                        <h4 className="font-bold">Module Tuning</h4>
                        {validation.modules ? <CheckCircle2 className="h-5 w-5 text-emerald-500 ml-auto" /> : <AlertCircle className="h-5 w-5 text-slate-300 ml-auto" />}
                    </div>
                </Card>
            </div>

            <Card className={cn(
                "border-0 rounded-[3rem] p-12 text-center space-y-6 overflow-hidden relative",
                allValid ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"
            )}>
                {allValid && (
                    <div className="absolute right-0 top-0 p-12 opacity-10 rotate-12">
                        <Rocket className="h-40 w-40" />
                    </div>
                )}

                <div className="relative z-10">
                    <h2 className="text-3xl font-black font-outfit">Ready for Transmission?</h2>
                    <p className={cn("mt-4 max-w-lg mx-auto font-medium leading-relaxed", allValid ? "text-slate-400" : "text-slate-400")}>
                        {allValid
                            ? "Your institutional environment has passed all security heartbeats. Activating the ERP will open the gates for all assigned faculty and staff."
                            : "Some mandatory stages are incomplete. Please navigate back to ensure all institutional parameters are defined before Go-Live."
                        }
                    </p>

                    <div className="pt-10">
                        <Button
                            onClick={handleActivate}
                            disabled={!allValid || activating}
                            className={cn(
                                "rounded-[2rem] px-16 h-20 text-xl font-black shadow-2xl transition-all hover:scale-105 gap-4",
                                allValid ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/40" : "bg-slate-200 text-slate-400"
                            )}
                        >
                            {activating ? <Loader2 className="h-6 w-6 animate-spin" /> : <Rocket className="h-6 w-6" />}
                            ACTIVATE ERP ENVIRONMENT
                        </Button>
                    </div>

                    <div className="flex items-center justify-center gap-6 mt-12 text-[10px] font-black uppercase tracking-widest opacity-40">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4" />
                            Multi-Tenant Isolation
                        </div>
                        <div className="flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            Data Encrypted
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
