"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Breadcrumbs } from "@/components/dashboard/Breadcrumbs";
import { cn } from "@/lib/utils";
import { SHELL_CONFIG } from "@/lib/navigation";
import { toast } from "sonner";

export default function ModuleLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { isAuthenticated, isLoading, activeRole } = useAuth();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push("/login");
            } else if (activeRole && !SHELL_CONFIG.module.includes(activeRole) && !SHELL_CONFIG.platform.includes(activeRole) && activeRole !== "STUDENT") {
                // Students can access module services, but vertical heads are the primary owners
                // We'll allow STUDENTS for now but eventually enforce role-based deep links
            }
        }
    }, [isAuthenticated, isLoading, router, activeRole]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl animate-pulse" />
                    <p className="text-slate-500 text-sm font-medium">Loading Module Shell...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 z-[100]" />

            <Sidebar
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            <div
                className={cn(
                    "min-h-screen transition-all duration-300",
                    sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
                )}
            >
                <Topbar onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />

                <main className="p-4 lg:p-8 max-w-[1600px] mx-auto">
                    <div className="mb-6 flex items-center gap-2">
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 px-3 py-1 text-[10px] font-bold tracking-widest uppercase">
                            Vertical Module Shell
                        </Badge>
                    </div>
                    <Breadcrumbs />
                    {children}
                </main>
            </div>
        </div>
    );
}

import { Badge } from "@/components/ui/badge";
