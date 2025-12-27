"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";

const STAGE_ROUTES: Record<number, string> = {
    1: "/onboarding/profile",
    2: "/onboarding/academics",
    3: "/onboarding/staff",
    4: "/onboarding/modules",
    5: "/onboarding/import",
    6: "/onboarding/review",
};

export default function OnboardingRedirectPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const redirectToCurrentStage = async () => {
            try {
                const { data } = await api.get("/onboarding/status");
                const currentStage = data.currentStage || 1;
                const redirectPath = STAGE_ROUTES[currentStage] || "/onboarding/profile";
                router.replace(redirectPath);
            } catch (err: any) {
                console.error("Failed to fetch onboarding status:", err);
                // Default to profile stage if we can't determine current stage
                router.replace("/onboarding/profile");
            }
        };

        redirectToCurrentStage();
    }, [router]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                        onClick={() => router.replace("/onboarding/profile")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Go to Profile Setup
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-slate-400 text-lg">Loading onboarding...</p>
        </div>
    );
}
