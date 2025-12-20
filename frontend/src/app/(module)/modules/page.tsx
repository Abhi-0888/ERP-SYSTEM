"use client";

import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ModulesPage() {
    const { activeRole } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (activeRole === "LIBRARIAN") router.push("/modules/library");
        else if (activeRole === "PLACEMENT_OFFICER") router.push("/modules/placement");
        else if (activeRole === "HOSTEL_WARDEN") router.push("/modules/hostel");
        else if (activeRole === "TRANSPORT_MANAGER") router.push("/modules/transport");
        else router.push("/dashboard");
    }, [activeRole, router]);

    return (
        <div className="flex items-center justify-center p-20">
            <div className="animate-spin h-8 w-8 border-4 border-orange-500 rounded-full border-t-transparent" />
        </div>
    );
}
