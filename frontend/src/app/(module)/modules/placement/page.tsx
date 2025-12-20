"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Briefcase, Search, Building2, MapPin, Calendar, DollarSign, Eye, Plus, Loader2, BarChart3, TrendingUp, Users
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { PlacementService } from "@/lib/services/placement.service";
import { toast } from "sonner";

export default function PlacementOfficerDashboard() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadJobs() {
            try {
                setLoading(true);
                const jobRes = await PlacementService.getAllJobs();
                setJobs(jobRes.data || []);
            } catch (error) {
                console.error("Failed to load jobs:", error);
                toast.error("Failed to load recruitment data");
            } finally {
                setLoading(false);
            }
        }
        loadJobs();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Recruitment Command</h1>
                    <p className="text-slate-500">Corporate relations and career progression tracking.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl"><BarChart3 className="h-4 w-4 mr-2" />Analytics</Button>
                    <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100">
                        <Plus className="h-4 w-4 mr-2" />Launch Drive
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm bg-indigo-50/50 border border-indigo-100">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Active Partner Pipeline</p>
                                <p className="text-3xl font-black text-slate-900 mt-1">{jobs.length}</p>
                            </div>
                            <div className="p-3 bg-white rounded-xl shadow-sm">
                                <Building2 className="h-6 w-6 text-indigo-500" />
                            </div>
                        </div>
                        <div className="flex items-center gap-1 mt-4 text-emerald-600 font-bold text-xs uppercase">
                            <TrendingUp className="h-3 w-3" />
                            +4 New this week
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-blue-50/50 border border-blue-100">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">Total Applications</p>
                                <p className="text-3xl font-black text-slate-900 mt-1">1,248</p>
                            </div>
                            <div className="p-3 bg-white rounded-xl shadow-sm">
                                <Users className="h-6 w-6 text-blue-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-emerald-50/50 border border-emerald-100">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest">Placements Secured</p>
                                <p className="text-3xl font-black text-slate-900 mt-1">422</p>
                            </div>
                            <div className="p-3 bg-white rounded-xl shadow-sm">
                                <Briefcase className="h-6 w-6 text-emerald-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden border border-slate-100">
                <CardHeader className="bg-slate-50/50 border-b">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <CardTitle className="text-lg font-bold">Drive Management</CardTitle>
                        <div className="relative max-w-sm w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input placeholder="Search drives..." className="pl-10 h-10 rounded-xl bg-white border-slate-200" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/30 border-0">
                                    <TableHead className="font-bold h-12">Recruiter</TableHead>
                                    <TableHead className="font-bold h-12">Domain</TableHead>
                                    <TableHead className="font-bold h-12">Compensation</TableHead>
                                    <TableHead className="font-bold h-12">Reporting Date</TableHead>
                                    <TableHead className="font-bold h-12">Fulfillment</TableHead>
                                    <TableHead className="font-bold h-12 text-right">Ops</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {jobs.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="text-center py-20 text-slate-500 italic">No recruitment data available.</TableCell></TableRow>
                                ) : jobs.map((job) => (
                                    <TableRow key={job._id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs">
                                                    {job.company.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className="font-bold text-slate-900">{job.company}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{job.role}</TableCell>
                                        <TableCell className="text-emerald-700 font-bold">{job.packageDisplay || `₹${job.salaryRange?.min}-${job.salaryRange?.max} LPA`}</TableCell>
                                        <TableCell className="text-slate-500 font-medium">{new Date(job.deadline).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge className={job.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-100 text-slate-500"}>
                                                {job.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" variant="ghost" className="rounded-lg hover:bg-indigo-50 hover:text-indigo-600 font-bold">
                                                <Eye className="h-4 w-4 mr-1" />Audit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
