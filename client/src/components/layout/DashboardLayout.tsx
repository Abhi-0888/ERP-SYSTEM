import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { AIChatbot } from "@/components/features/AIChatbot";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen transition-all duration-300 ease-in-out">
        <Header />
        <div className="flex-1 p-6 overflow-x-hidden relative">
          <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 slide-in-from-bottom-4">
            {children}
          </div>
          <AIChatbot />
        </div>
      </main>
    </div>
  );
}
