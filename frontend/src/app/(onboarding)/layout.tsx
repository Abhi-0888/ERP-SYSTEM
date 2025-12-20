"use client";

import { useAuth } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
    CheckCircle2, Circle, Loader2, Building2,
    BookOpen, Users, Settings2, Upload, Rocket
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

const STAGES = [
    { id: 1, title: "University Profile", path: "/onboarding/profile", icon: Building2 },
    { id: 2, title: "Academic Structure", path: "/onboarding/academics", icon: BookOpen },
    { id: 3, title: "Staff & Roles", path: "/onboarding/staff", icon: Users },
    { id: 4, title: "Module Config", path: "/onboarding/modules", icon: Settings2 },
    { id: 5, title: "Data Import", path: "/onboarding/import", icon: Upload },
    { id: 6, title: "Final Review", path: "/onboarding/review", icon: Rocket },
];

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [onboardingStatus, setOnboardingStatus] = useState<any>(null);

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push("/auth/login");
                return;
            }
            fetchStatus();
        }
    }, [user, isLoading]);

    const fetchStatus = async () => {
        try {
            const res = await api.get("/onboarding/status");
            setOnboardingStatus(res.data);

            // Auto-redirect to current stage if on root /onboarding
            if (pathname === "/onboarding") {
                const stage = res.data.currentStage || 1;
                const stagePath = STAGES.find(s => s.id === stage)?.path || "/onboarding/profile";
                router.push(stagePath);
            }
        } catch (err) {
            console.error("Failed to fetch onboarding status", err);
        }
    };

    if (isLoading || !onboardingStatus) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-slate-50">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
        );
    }

    const currentStage = onboardingStatus.currentStage;

    return (
        <div className="flex h-screen bg-[#F8FAFC]">
            {/* Onboarding Sidebar */}
            <aside className="w-80 bg-white border-r border-slate-200 flex flex-col p-8">
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                        <Rocket className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h2 className="font-black text-slate-900 tracking-tight">Setup Wizard</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Institutional Onboarding</p>
                    </div>
                </div>

                <nav className="space-y-2 flex-1">
                    {STAGES.map((stage) => {
                        const isCompleted = onboardingStatus.completedStages?.includes(stage.id);
                        const isActive = pathname === stage.path;
                        const isLocked = stage.id > currentStage;

                        return (
                            <div
                                key={stage.id}
                                className={cn(
                                    "group flex items-center gap-4 p-4 rounded-2xl transition-all relative overflow-hidden",
                                    isActive ? "bg-blue-50 text-blue-700 font-bold shadow-sm" :
                                        isLocked ? "opacity-40 cursor-not-allowed grayscale" :
                                            "text-slate-500 hover:bg-slate-50"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                    isActive ? "bg-blue-600 text-white" :
                                        isCompleted ? "bg-emerald-50 text-emerald-600" :
                                            "bg-slate-100 text-slate-400"
                                )}>
                                    {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <stage.icon className="h-5 w-5" />}
                                </div>

                                <div className="flex-1">
                                    <p className="text-sm">{stage.title}</p>
                                    <p className="text-[10px] uppercase font-bold tracking-tighter opacity-60">
                                        {isCompleted ? "Completed" : isActive ? "Action Required" : isLocked ? "Locked" : "Pending"}
                                    </p>
                                </div>

                                {isActive && (
                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-full" />
                                )}
                            </div>
                        );
                    })}
                </nav>

                <div className="mt-auto pt-8 border-t border-slate-100">
                    <div className="bg-slate-50 rounded-2xl p-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Setup Progress</span>
                            <span className="text-[10px] font-black text-blue-600">{Math.round((onboardingStatus.completedStages?.length / STAGES.length) * 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 transition-all duration-1000"
                                style={{ width: `${(onboardingStatus.completedStages?.length / STAGES.length) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                <div className="max-w-4xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
