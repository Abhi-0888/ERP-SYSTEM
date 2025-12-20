"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    CreditCard, Check, Zap, Rocket, Shield,
    Users, Database, BrainCircuit, Globe
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { UniversityService } from "@/lib/services/university.service";

interface Plan {
    id: string;
    name: string;
    price: string;
    description: string;
    icon: any;
    color: string;
    limits: {
        maxUsers: string;
        storage: string;
        universities: string;
    };
    modules: string[];
}

const PLANS: Plan[] = [
    {
        id: "basic",
        name: "Foundation",
        price: "$499/mo",
        description: "Essential ERP features for small colleges.",
        icon: Zap,
        color: "blue",
        limits: {
            maxUsers: "5,000",
            storage: "100 GB",
            universities: "Single"
        },
        modules: ["Core Academics", "Attendance", "Timetable", "Basic Reports"]
    },
    {
        id: "pro",
        name: "Expansion",
        price: "$1,299/mo",
        description: "Advanced features for growing universities.",
        icon: Rocket,
        color: "purple",
        limits: {
            maxUsers: "25,000",
            storage: "1 TB",
            universities: "Up to 3"
        },
        modules: ["Core Academics", "Attendance", "Timetable", "Advanced Analytics", "Fee Management", "Library"]
    },
    {
        id: "enterprise",
        name: "Global Elite",
        price: "Custom",
        description: "Unlimited scale for multi-national institutions.",
        icon: Shield,
        color: "emerald",
        limits: {
            maxUsers: "Unlimited",
            storage: "10 TB+",
            universities: "Unlimited"
        },
        modules: ["Full Module Access", "AI Features", "Custom Integration", "White-labeling", "Priority Support"]
    }
];

export default function SubscriptionsPage() {
    const [selectedUniv, setSelectedUniv] = useState<string>("");
    const [universities, setUniversities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUniversities = async () => {
            try {
                const data = await UniversityService.getAll();
                setUniversities(data);
                if (data.length > 0) setSelectedUniv(data[0]._id);
            } catch (error) {
                toast.error("Failed to load subscription base");
            } finally {
                setLoading(false);
            }
        };
        fetchUniversities();
    }, []);

    const handleUpgrade = async (planId: string) => {
        if (!selectedUniv) {
            toast.error("Select a university first");
            return;
        }
        try {
            await UniversityService.update(selectedUniv, {
                subscriptionPlan: planId,
                'subscriptionDetails.planName': planId,
                'subscriptionDetails.status': 'active'
            });
            toast.success(`Plan updated to ${planId.toUpperCase()} for selected tenant.`);
        } catch (error) {
            toast.error("Subscription update failed");
        }
    };
    const [selectedPlan, setSelectedPlan] = useState<string>("pro");

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Subscription & Licensing</h1>
                    <p className="text-slate-500 mt-1">Manage global plan definitions and resource allocation limits.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl bg-white">View Active Contracts</Button>
                    <Button className="rounded-xl bg-slate-900 text-white">Create Custom Plan</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {PLANS.map((plan) => {
                    const Icon = plan.icon;
                    const isActive = selectedPlan === plan.id;

                    return (
                        <Card key={plan.id} className={`border-2 transition-all rounded-3xl overflow-hidden flex flex-col ${isActive ? 'border-slate-900 shadow-xl scale-[1.02]' : 'border-slate-100'
                            }`}>
                            <CardHeader className="text-center pt-8">
                                <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 ${plan.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                                    plan.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                                        'bg-emerald-100 text-emerald-600'
                                    }`}>
                                    <Icon className="h-8 w-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
                                <div className="mt-2">
                                    <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                                </div>
                                <p className="text-slate-500 text-sm mt-2 px-4">{plan.description}</p>
                            </CardHeader>

                            <CardContent className="flex-1 space-y-6 pt-4">
                                <div className="grid grid-cols-3 gap-2 py-4 border-y border-slate-50">
                                    <div className="text-center">
                                        <Users className="h-4 w-4 mx-auto text-slate-400 mb-1" />
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Users</p>
                                        <p className="text-xs font-bold text-slate-900">{plan.limits.maxUsers}</p>
                                    </div>
                                    <div className="text-center border-x border-slate-50">
                                        <Database className="h-4 w-4 mx-auto text-slate-400 mb-1" />
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Vault</p>
                                        <p className="text-xs font-bold text-slate-900">{plan.limits.storage}</p>
                                    </div>
                                    <div className="text-center">
                                        <Globe className="h-4 w-4 mx-auto text-slate-400 mb-1" />
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Nodes</p>
                                        <p className="text-xs font-bold text-slate-900">{plan.limits.universities}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 px-4">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Included Modules</p>
                                    {plan.modules.map((mod) => (
                                        <div key={mod} className="flex items-center gap-2 group">
                                            <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center">
                                                <Check className="h-3 w-3 text-emerald-600" />
                                            </div>
                                            <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{mod}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>

                            <CardFooter className="pb-8 px-8">
                                <Button
                                    className={`w-full rounded-2xl h-12 text-sm font-bold transition-all ${isActive ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                                        }`}
                                    onClick={() => setSelectedPlan(plan.id)}
                                >
                                    {isActive ? 'Active Base Plan' : 'Modify Configuration'}
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            <Card className="border-0 shadow-sm rounded-3xl overflow-hidden bg-white border border-slate-100">
                <CardHeader className="bg-slate-50/50 p-6 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl">Global Feature Flags</CardTitle>
                        <p className="text-slate-500 text-sm">Control feature availability across all plan levels.</p>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                        Propagation: Instant
                    </Badge>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid md:grid-cols-2">
                        <div className="p-8 border-b md:border-b-0 md:border-r border-slate-100 space-y-6">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <BrainCircuit className="h-5 w-5 text-purple-500" />
                                AI & Automated Insights
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-transparent hover:border-slate-100 transition-all">
                                    <div>
                                        <p className="font-semibold text-slate-800">Advanced AI Chatbot</p>
                                        <p className="text-xs text-slate-500">Enable Llama-3 based academic assistance.</p>
                                    </div>
                                    <Switch />
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-transparent hover:border-slate-100 transition-all">
                                    <div>
                                        <p className="font-semibold text-slate-800">Predictive Analytics</p>
                                        <p className="text-xs text-slate-500">Student dropout and performance prediction.</p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Shield className="h-5 w-5 text-blue-500" />
                                Security & Infrastructure
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-transparent hover:border-slate-100 transition-all">
                                    <div>
                                        <p className="font-semibold text-slate-800">Multi-Factor Authentication</p>
                                        <p className="text-xs text-slate-500">Global enforcement of 2FA for all users.</p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-transparent hover:border-slate-100 transition-all">
                                    <div>
                                        <p className="font-semibold text-slate-800">Custom Domain Support</p>
                                        <p className="text-xs text-slate-500">Allow universities to use their own URLs.</p>
                                    </div>
                                    <Switch />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
