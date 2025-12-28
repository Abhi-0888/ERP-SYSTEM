"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { roleDisplayNames } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Search, Bell, Menu, ChevronDown, User, Settings, LogOut, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TopbarProps {
    onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
    const router = useRouter();
    const { user, activeRole, setActiveRole, logout } = useAuth();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6">
            {/* Left: Menu button (mobile) + Search */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={onMenuClick}
                >
                    <Menu className="h-5 w-5" />
                </Button>

                <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 w-80">
                    <Search className="h-4 w-4 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="Search students, courses..."
                        className="border-0 bg-transparent focus-visible:ring-0 h-auto p-0 text-sm"
                    />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                {/* AI Assistant */}
                <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    <span className="hidden lg:inline">AI Assistant</span>
                </Button>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                        3
                    </span>
                </Button>

                {/* Role Switcher (if multiple roles) */}
                {user && user.roles.length > 1 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="hidden sm:flex gap-2 border-slate-200 hover:bg-slate-50 rounded-xl">
                                <span className="text-xs font-semibold text-slate-700">
                                    {activeRole ? roleDisplayNames[activeRole] : "Select Role"}
                                    {activeRole === 'HOD' && user.departmentName && ` - ${user.departmentName}`}
                                </span>
                                <ChevronDown className="h-4 w-4 text-slate-400" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-xl border-slate-100">
                            <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">Switch Context</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-50" />
                            {user.roles.map((role) => (
                                <DropdownMenuItem
                                    key={role}
                                    onClick={() => setActiveRole(role)}
                                    className={cn(
                                        "flex flex-col items-start gap-0.5 rounded-xl px-3 py-2 cursor-pointer transition-colors",
                                        activeRole === role ? "bg-indigo-50 text-indigo-700" : "hover:bg-slate-50"
                                    )}
                                >
                                    <span className="font-bold text-sm">{roleDisplayNames[role]}</span>
                                    {role === 'HOD' && user.departmentName && (
                                        <span className="text-[10px] opacity-70 uppercase font-medium">{user.departmentName}</span>
                                    )}
                                    {role === 'STUDENT' && user.universityName && (
                                        <span className="text-[10px] opacity-70 uppercase font-medium">{user.universityName}</span>
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 px-2">
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-medium">{user?.name}</p>
                                <p className="text-xs text-slate-500">
                                    {activeRole ? roleDisplayNames[activeRole] : ""}
                                </p>
                            </div>
                            <Avatar className="h-9 w-9 bg-gradient-to-br from-blue-500 to-purple-600">
                                <AvatarFallback className="bg-transparent text-white text-sm font-semibold">
                                    {user?.name ? getInitials(user.name) : "U"}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            <div>
                                <p className="font-medium">{user?.name}</p>
                                <p className="text-xs text-slate-500">{user?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {
                            if (activeRole === "SUPER_ADMIN") {
                                router.push("/super-admin/settings?tab=profile");
                            } else {
                                router.push("/dashboard/settings");
                            }
                        }}>
                            <User className="mr-2 h-4 w-4" />
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                            if (activeRole === "SUPER_ADMIN") {
                                router.push("/super-admin/settings?tab=system");
                            } else {
                                router.push("/dashboard/settings");
                            }
                        }}>
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
