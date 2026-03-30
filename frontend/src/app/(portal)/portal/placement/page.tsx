"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Briefcase, Building2, TrendingUp, CheckCircle2, Loader2, AlertCircle,
    Globe, Send, Filter, MapPin, Search
} from "lucide-react";
import { PlacementService } from "@/lib/services/placement.service";
import { Button } from "@/components/ui/button";

export default function StudentPlacementPage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const fetchPlacementData = async () => {
        const userId = (user as any)?.id || (user as any)?._id;
        if (!userId) return;
        try {
            const [jobsRes, appsRes, statsRes] = await Promise.all([
                PlacementService.getAllJobs(),
                PlacementService.getStudentApplications(userId),
                PlacementService.getStats()
            ]);
            setJobs(jobsRes.data || jobsRes || []);
            setApplications(appsRes || []);
            setStats(statsRes);
            setError(null);
        } catch (err: any) {
            console.error("Failed to fetch placement data", err);
            setError("Failed to load placement records. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlacementData();
    }, [user]);

    const handleApply = async (jobId: string) => {
        const userId = (user as any)?.id || (user as any)?._id;
        if (!userId) return;
        
        setApplying(jobId);
        try {
            await PlacementService.applyForJob({ jobId, studentId: userId });
            alert("Application submitted successfully!");
            // Refresh applications
            const appsRes = await PlacementService.getStudentApplications(userId);
            setApplications(appsRes || []);
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to apply for job");
        } finally {
            setApplying(null);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <p className="text-slate-500 font-medium font-outfit">Scanning Carrier Opportunities...</p>
        </div>
    );

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-slate-400" />
                <h3 className="text-xl font-bold">Placement Cell Offline</h3>
                <p className="text-slate-500 max-w-md">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black font-outfit text-slate-900 tracking-tight">Career & Placements</h1>
                    <p className="text-slate-500 font-medium mt-1">Unlock global opportunities and track your corporate journey</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-xl font-bold flex items-center gap-2">
                        <Filter className="h-4 w-4" /> Filter Jobs
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold flex items-center gap-2">
                        <Send className="h-4 w-4" /> Professional Profile
                    </Button>
                </div>
            </div>

            {/* Placement Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-0 shadow-sm bg-white rounded-[2rem] p-8 border-l-4 border-l-blue-500">
                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-2">Live Drives</p>
                    <p className="text-3xl font-black text-slate-900">{stats?.activeJobPostings || jobs.length}</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                        <Badge className="bg-blue-50 text-blue-600 border-0 font-bold text-[9px]">ACTIVE</Badge>
                    </div>
                </Card>
                <Card className="border-0 shadow-sm bg-white rounded-[2rem] p-8 border-l-4 border-l-emerald-500">
                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-2">My Applications</p>
                    <p className="text-3xl font-black text-slate-900">{applications.length}</p>
                    <div className="mt-4 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                        <span className="text-xs font-bold text-slate-500">{applications.filter(a => a.status === 'Shortlisted').length} Shortlisted</span>
                    </div>
                </Card>
                <Card className="border-0 shadow-sm bg-white rounded-[2rem] p-8 border-l-4 border-l-indigo-500">
                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-2">Placement Rate</p>
                    <p className="text-3xl font-black text-slate-900">{stats?.placementRate || "0.00"}%</p>
                    <p className="text-xs font-medium text-slate-500 mt-2">Overall Success</p>
                </Card>
                <Card className="border-0 shadow-sm bg-indigo-600 text-white rounded-[2rem] p-8">
                    <p className="text-white/60 font-black text-[10px] uppercase tracking-widest mb-2">Total Job Posts</p>
                    <p className="text-3xl font-black">{stats?.totalJobPostings || 0}</p>
                    <div className="h-1 bg-white/20 rounded-full mt-4 overflow-hidden">
                        <div className="h-full bg-white w-full" />
                    </div>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Available Jobs list */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-xl font-black font-outfit uppercase tracking-tighter flex items-center gap-2">
                        <Globe className="h-5 w-5 text-indigo-500" /> Active Recruitment
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        {jobs.length > 0 ? jobs.map((job: any, i: number) => (
                            <Card key={i} className="border-0 shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2.5rem] bg-white border border-slate-100 p-8 flex flex-col md:flex-row gap-8 group">
                                <div className="p-6 bg-slate-50 rounded-3xl shrink-0 group-hover:bg-indigo-50 transition-colors">
                                    <Building2 className="h-10 w-10 text-slate-400 group-hover:text-indigo-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{job.title || "Elite Software Engineer"}</h4>
                                            <p className="text-indigo-600 font-bold tracking-tight">{job.company || job.companyName || "Global Tech Solutions"}</p>
                                        </div>
                                        <Badge className="bg-emerald-50 text-emerald-600 border-0 font-black tracking-widest uppercase text-[9px] py-1 px-3">
                                            ₹{job.salary || "18.5 L"} Package
                                        </Badge>
                                    </div>
                                    <div className="flex flex-wrap gap-4 mt-8">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                            <MapPin className="h-4 w-4" /> {job.location || "Bengaluru / Hybrid"}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                            <Briefcase className="h-4 w-4" /> Regular / Full-time
                                        </div>
                                    </div>
                                </div>
                                <div className="flex md:flex-col justify-end gap-3 pt-4 md:pt-0">
                                    <Button variant="ghost" className="rounded-xl font-bold border border-slate-100">Details</Button>
                                    <Button 
                                        onClick={() => handleApply(job._id)}
                                        disabled={applying === job._id || applications.some(a => a.jobId?._id === job._id)}
                                        className="bg-indigo-600 hover:bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-indigo-100"
                                    >
                                        {applying === job._id ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                                         applications.some(a => a.jobId?._id === job._id) ? "Applied" : "Apply Now"}
                                    </Button>
                                </div>
                            </Card>
                        )) : (
                            <div className="py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-center space-y-4">
                                <Search className="h-12 w-12 text-slate-300 mx-auto" />
                                <p className="text-slate-900 font-bold text-lg">Scanning for new opportunities...</p>
                                <p className="text-slate-500 text-sm">Check back later for updated recruitment drives.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* My Applications side panel */}
                <div className="space-y-6">
                    <h3 className="text-xl font-black font-outfit uppercase tracking-tighter flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Application Orbit
                    </h3>
                    <Card className="border-0 shadow-lg bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 pb-4">
                        <CardHeader className="bg-slate-50/50 border-b px-8 py-6">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">Recent Applications</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            {applications.length > 0 ? applications.map((app: any, i: number) => (
                                <div key={i} className="p-6 bg-white rounded-3xl border border-slate-100 hover:border-indigo-100 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="font-black text-slate-900 leading-tight uppercase tracking-tight">{app.jobId?.title || "SDE Intern"}</p>
                                            <p className="text-xs font-bold text-indigo-600 mt-1">{app.jobId?.company || "Tech Giant"}</p>
                                        </div>
                                        <div className="w-1.5 h-10 bg-indigo-100 rounded-full group-hover:bg-indigo-500 transition-colors" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="text-[9px] font-black tracking-widest bg-slate-50 border-0 uppercase">
                                            {app.status || "UNDER REVIEW"}
                                        </Badge>
                                        <span className="text-[10px] font-medium text-slate-400">Apply Date: 20 Mar</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-12 text-center">
                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No Active Applications</p>
                                </div>
                            )}
                            <Button variant="ghost" className="w-full mt-4 text-indigo-600 font-black text-xs tracking-widest uppercase hover:bg-indigo-50 rounded-2xl">
                                VIEW ALL APPLICATIONS (12)
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Resources */}
                    <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white">
                        <h4 className="text-xl font-black font-outfit tracking-tighter uppercase mb-6">Preparation Shell</h4>
                        <div className="space-y-4">
                            <div className="p-5 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer border border-white/5 group">
                                <div className="font-bold text-sm flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" /> Resume Builder
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2 font-medium">Generate AI-optimized portfolios.</p>
                            </div>
                            <div className="p-5 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer border border-white/5 group">
                                <div className="font-bold text-sm flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> Mock Interviews
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2 font-medium">Practice with departmental experts.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
