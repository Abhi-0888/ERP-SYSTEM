"use client";

import { useAuth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SHELL_CONFIG } from "@/lib/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, activeRole, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push("/auth/login");
                return;
            }

            // Setup Guard: Redirect to onboarding if not active
            if (user.universityStatus === 'setup' && activeRole === 'UNIVERSITY_ADMIN') {
                router.push("/onboarding");
                return;
            }

            // Workspace 1: Platform Control (SUPER_ADMIN)
            if (activeRole === "SUPER_ADMIN") {
                router.push("/super-admin");
                return;
            }

            // Workspace 4: Self-Service Portal (STUDENT, PARENT)
            if (activeRole === "STUDENT" || activeRole === "PARENT") {
                router.push("/portal");
                return;
            }

            // Workspace 2 & 3: University Command & Ops stay here
            setIsAuthorized(true);
        }
    }, [user, activeRole, isLoading, router, pathname]);

    if (isLoading || !isAuthorized) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                    <p className="text-slate-500 font-medium animate-pulse">Synchronizing Security Context...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#F8FAFC]">
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
                    <div className="max-w-7xl mx-auto pb-20">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
