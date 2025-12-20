"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs() {
    const pathname = usePathname();
    const pathSegments = pathname.split("/").filter((segment) => segment !== "");

    return (
        <nav className="flex items-center space-x-2 text-sm text-slate-500 mb-6 font-outfit">
            <Link
                href="/dashboard"
                className="flex items-center hover:text-blue-600 transition-colors"
            >
                <Home className="h-4 w-4" />
            </Link>

            {pathSegments.map((segment, index) => {
                const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
                const isLast = index === pathSegments.length - 1;
                const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");

                if (segment === "dashboard") return null;

                return (
                    <div key={href} className="flex items-center space-x-2">
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                        {isLast ? (
                            <span className="font-semibold text-slate-900">{label}</span>
                        ) : (
                            <Link
                                href={href}
                                className="hover:text-blue-600 transition-colors capitalize"
                            >
                                {label}
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
