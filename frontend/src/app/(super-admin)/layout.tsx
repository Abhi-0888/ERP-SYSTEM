"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Breadcrumbs } from "@/components/dashboard/Breadcrumbs";
import { cn } from "@/lib/utils";

export default function SuperAdminLayout({
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
            } else if (activeRole !== "SUPER_ADMIN") {
                router.push("/dashboard");
            }
        }
    }, [isAuthenticated, isLoading, activeRole, router]);

    if (isLoading || !isAuthenticated || activeRole !== "SUPER_ADMIN") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl animate-pulse" />
                    <p className="text-slate-500 text-sm">Validating Super Admin Privileges...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Sidebar */}
            <Sidebar
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Mobile overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Main content */}
            <div
                className={cn(
                    "min-h-screen transition-all duration-300",
                    sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
                )}
            >
                <Topbar onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />

                <main className="p-4 lg:p-6">
                    <div className="mb-6">
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-100 mb-2">
                            SYSTEM OVERRIDE ACTIVE
                        </Badge>
                        <Breadcrumbs />
                    </div>
                    {children}
                </main>
            </div>
        </div>
    );
}

import { Badge } from "@/components/ui/badge";
