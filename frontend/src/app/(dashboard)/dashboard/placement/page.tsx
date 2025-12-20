"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Briefcase, Search, Building2, Calendar, Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { PlacementService } from "@/lib/services/placement.service";
import { toast } from "sonner";

export default function PlacementPage() {
    const { activeRole, user } = useAuth();
    const [jobs, setJobs] = useState<any[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const jobRes = await PlacementService.getAllJobs();
                setJobs(jobRes.data || []);

                if (user?.id) {
                    const appRes = await PlacementService.getStudentApplications(user.id);
                    setApplications(appRes || []);
                }
            } catch (error) {
                console.error("Failed to load placement data:", error);
                toast.error("Failed to load placement data");
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [user?.id]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Career Portal</h1>
                    <p className="text-slate-500">Track placement drives and manage applications.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-0 shadow-sm rounded-2xl border border-slate-100 overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center justify-between py-4">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Briefcase className="h-5 w-5 text-indigo-500" />
                                Live Opportunities
                            </CardTitle>
                            <div className="relative max-w-[240px] w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                <Input placeholder="Quick search..." className="pl-9 h-8 text-xs rounded-lg" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            {loading ? (
                                <div className="flex justify-center p-12 text-slate-400"><Loader2 className="h-8 w-8 animate-spin" /></div>
                            ) : jobs.length === 0 ? (
                                <div className="text-center py-12 text-slate-400 italic">No active recruitment drives at the moment.</div>
                            ) : (
                                <div className="grid gap-4">
                                    {jobs.filter(j => j.status === "Active").map((job) => (
                                        <div key={job._id} className="p-5 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50/50 transition-all group">
                                            <div className="flex items-start justify-between">
                                                <div className="flex gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs uppercase group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                        {job.company.substring(0, 2)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-slate-900">{job.role}</h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-sm font-medium text-slate-600">{job.company}</span>
                                                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                            <span className="text-sm font-bold text-emerald-600">₹{job.salaryRange?.min}-{job.salaryRange?.max} LPA</span>
                                                        </div>
                                                        <div className="flex items-center gap-4 mt-3">
                                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                                <Calendar className="h-3 w-3" />
                                                                Apply by {new Date(job.deadline).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button className="rounded-xl px-6 bg-slate-900 hover:bg-indigo-600 text-white transition-colors">Apply</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-0 shadow-sm rounded-2xl border border-slate-100 overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b">
                            <CardTitle className="text-lg font-bold">My Applications</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {applications.length > 0 ? (
                                <div className="space-y-4">
                                    {applications.map((app) => (
                                        <div key={app._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 transition-colors">
                                            <div>
                                                <p className="font-bold text-sm text-slate-900">{app.jobId?.role || "Position"}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{app.jobId?.company || "Company"}</p>
                                            </div>
                                            <Badge variant={app.status === "Selected" || app.status === "Placed" ? "default" : "secondary"} className={app.status === "Selected" ? "bg-emerald-50 text-emerald-700" : ""}>
                                                {app.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Briefcase className="h-6 w-6 text-slate-300" />
                                    </div>
                                    <p className="text-sm text-slate-500">No applications yet.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm rounded-2xl bg-indigo-600 text-white p-6 relative overflow-hidden">
                        <Building2 className="absolute -right-6 -bottom-6 h-32 w-32 text-white/10 rotate-12" />
                        <h4 className="text-lg font-bold relative z-10">Resume Service</h4>
                        <p className="text-indigo-100 text-xs mt-2 leading-relaxed relative z-10">
                            Our corporate team is reviewing profiles. Keep your portfolio updated for priority matching.
                        </p>
                        <Button variant="outline" className="mt-4 border-white/20 hover:bg-white/10 text-white w-full rounded-xl relative z-10">
                            Update Profile
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
