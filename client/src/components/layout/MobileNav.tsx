import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Menu, GraduationCap, LayoutDashboard, Users, CalendarCheck, CreditCard, BookOpen, MessageSquare, Bus, Library, Settings, LogOut, Brain, Home } from "lucide-react";
import { useState } from "react";

export function MobileNav() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

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
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 bg-sidebar border-r border-sidebar-border text-sidebar-foreground">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2 font-display font-bold text-xl text-sidebar-primary">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary text-white flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            EduCore
          </div>
        </div>

        <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <a 
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group",
                    isActive 
                      ? "bg-sidebar-primary text-white shadow-md" 
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-sidebar-foreground/50 group-hover:text-white")} />
                  {item.label}
                </a>
              </Link>
            );
          })}
          
          <div className="pt-4 mt-4 border-t border-sidebar-border">
            <Link href="/">
              <a className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-red-400 hover:bg-sidebar-accent hover:text-red-300 transition-colors">
                <LogOut className="w-5 h-5" />
                Sign Out
              </a>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
