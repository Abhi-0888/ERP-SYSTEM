"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, activeRole } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && activeRole) {
        // Use the workspace mapping to redirect correctly
        const { ROLE_WORKSPACE } = require("@/lib/navigation");
        const target = ROLE_WORKSPACE[activeRole] || "/dashboard";
        router.push(target);
      } else {
        router.push("/auth/login");
      }
    }
  }, [isAuthenticated, isLoading, activeRole, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl animate-pulse" />
        <p className="text-slate-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}
