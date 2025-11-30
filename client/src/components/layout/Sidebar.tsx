import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  CreditCard, 
  BookOpen, 
  MessageSquare, 
  Settings, 
  GraduationCap,
  LogOut,
  Bus,
  Library,
  Brain,
  Home
} from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Users, label: "Students", href: "/students" },
    { icon: CalendarCheck, label: "Attendance", href: "/attendance" },
    { icon: CreditCard, label: "Fees", href: "/fees" },
    { icon: BookOpen, label: "Academics", href: "/academics" },
    { icon: MessageSquare, label: "Communication", href: "/notices" },
    { icon: Brain, label: "Analytics", href: "/analytics" },
    { icon: Home, label: "Hostel", href: "/hostel" },
    { icon: Bus, label: "Transport", href: "/transport" },
    { icon: Library, label: "Library", href: "/library" },
  ];

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col h-screen fixed left-0 top-0 z-30 hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2 font-display font-bold text-xl text-sidebar-primary">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary text-white flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          EduCore
        </div>
      </div>

      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
          Main Menu
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <a className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group",
                isActive 
                  ? "bg-sidebar-primary text-white shadow-md" 
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white"
              )}>
                <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-sidebar-foreground/50 group-hover:text-white")} />
                {item.label}
              </a>
            </Link>
          );
        })}

        <div className="mt-8 px-3 mb-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
          System
        </div>
        <Link href="/settings">
          <a className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group",
            location === "/settings"
              ? "bg-sidebar-primary text-white shadow-md" 
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white"
          )}>
            <Settings className="w-5 h-5 text-sidebar-foreground/50 group-hover:text-white" />
            Settings
          </a>
        </Link>
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <Link href="/">
          <button className="flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors w-full px-2 py-2 hover:bg-sidebar-accent rounded-md">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </Link>
      </div>
    </aside>
  );
}
