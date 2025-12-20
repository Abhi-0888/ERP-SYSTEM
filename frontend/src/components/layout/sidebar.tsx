"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { roleNavigation } from "@/lib/navigation";
import {
    LayoutDashboard, Building2, Users, Settings, Building, GraduationCap,
    BookOpen, UserCheck, ClipboardList, Calendar, FileText, CreditCard,
    BarChart3, Library, Home, Briefcase, BookMarked, AlertCircle,
    FileSpreadsheet, Receipt, DoorOpen, Bus, Route, ChevronLeft,
    ShieldCheck, Key, Box, LifeBuoy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    LayoutDashboard, Building2, Users, Settings, Building, GraduationCap,
    BookOpen, UserCheck, ClipboardList, Calendar, FileText, CreditCard,
    BarChart3, Library, Home, Briefcase, BookMarked, AlertCircle,
    FileSpreadsheet, Receipt, DoorOpen, Bus, Route, ShieldCheck, Key, Box, LifeBuoy
};

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
    const pathname = usePathname();
    const { activeRole } = useAuth();

    const navGroups = activeRole ? roleNavigation[activeRole] : [];

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 h-screen bg-slate-900 text-white transition-all duration-300",
                isCollapsed ? "w-16" : "w-64"
            )}
        >
            <div className="flex h-full flex-col">
                {/* Logo */}
                <div className="flex h-16 items-center justify-between px-4 border-b border-slate-700">
                    {!isCollapsed && (
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-sm font-bold">E</span>
                            </div>
                            <span className="font-bold text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                EduCore
                            </span>
                        </Link>
                    )}
                    {isCollapsed && (
                        <div className="w-8 h-8 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold">E</span>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <ScrollArea className="flex-1 py-4">
                    <nav className="space-y-4 px-2">
                        {navGroups.map((group, idx) => (
                            <div key={idx}>
                                {!isCollapsed && (
                                    <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                        {group.title}
                                    </h3>
                                )}
                                <ul className="space-y-1">
                                    {group.items.map((item) => {
                                        const Icon = iconMap[item.icon] || LayoutDashboard;
                                        const isActive = pathname === item.href;

                                        return (
                                            <li key={item.href}>
                                                <Link
                                                    href={item.href}
                                                    className={cn(
                                                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                                                        isActive
                                                            ? "bg-blue-600 text-white"
                                                            : "text-slate-400 hover:bg-slate-800 hover:text-white",
                                                        isCollapsed && "justify-center px-2"
                                                    )}
                                                >
                                                    <Icon className="h-5 w-5 shrink-0" />
                                                    {!isCollapsed && <span>{item.title}</span>}
                                                    {item.badge && !isCollapsed && (
                                                        <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                                {idx < navGroups.length - 1 && (
                                    <Separator className="my-4 bg-slate-700" />
                                )}
                            </div>
                        ))}
                    </nav>
                </ScrollArea>

                {/* Collapse Toggle */}
                <div className="border-t border-slate-700 p-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToggle}
                        className="w-full text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                        <ChevronLeft className={cn("h-5 w-5 transition-transform", isCollapsed && "rotate-180")} />
                        {!isCollapsed && <span className="ml-2">Collapse</span>}
                    </Button>
                </div>
            </div>
        </aside>
    );
}
