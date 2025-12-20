"use client";

import { useAuth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, activeRole, isLoading } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push("/auth/login");
                return;
            }

            // Setup Guard: Redirect to dashboard (which will redirect to onboarding if admin)
            if (user.universityStatus === 'setup') {
                router.push("/dashboard");
                return;
            }

            // Portal Shell is exclusively for Students and Parents
            if (activeRole !== "STUDENT" && activeRole !== "PARENT") {
                router.push("/dashboard");
                return;
            }

            setIsAuthorized(true);
        }
    }, [user, activeRole, isLoading, router]);

    if (isLoading || !isAuthorized) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                    <p className="text-slate-500 font-medium font-outfit">Loading Student Portal...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#FDFDFF]">
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
            <div className={cn(
                "flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300",
                isSidebarCollapsed ? "ml-16" : "ml-64"
            )}>
                <Topbar onMenuClick={() => setIsSidebarCollapsed(false)} />
                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    <div className="max-w-6xl mx-auto pb-20">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
