import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
            <div className="p-4 bg-white rounded-2xl shadow-sm mb-4">
                <Icon className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="text-slate-500 max-w-[250px] mt-1">{description}</p>
            {actionLabel && onAction && (
                <Button onClick={onAction} className="mt-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100">
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
