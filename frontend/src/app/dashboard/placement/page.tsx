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
    Briefcase, Search, Building2, MapPin, Calendar, DollarSign, Eye, Plus, Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { PlacementService } from "@/lib/services/placement.service";
import { toast } from "sonner";

// Placement Officer View
function PlacementOfficerView({ jobs, loading }: { jobs: any[], loading: boolean }) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Placement Portal</h1>
                    <p className="text-slate-500">Manage job postings and student applications</p>
                </div>
                <Button><Plus className="h-4 w-4 mr-2" />Post New Job</Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total Postings</p>
                            <p className="text-xl font-bold">{jobs.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Briefcase className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Active Jobs</p>
                            <p className="text-xl font-bold">{jobs.filter(j => j.status === "Active").length}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Jobs Table */}
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Job Postings</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Package</TableHead>
                                    <TableHead>Deadline</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {jobs.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">No job postings found.</TableCell></TableRow>
                                ) : jobs.map((job) => (
                                    <TableRow key={job._id}>
                                        <TableCell className="font-medium">{job.company}</TableCell>
                                        <TableCell>{job.role}</TableCell>
                                        <TableCell className="text-green-600 font-medium">{job.packageDisplay || `₹${job.salaryRange?.min}-${job.salaryRange?.max} LPA`}</TableCell>
                                        <TableCell>{new Date(job.deadline).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={job.status === "Active" ? "default" : "secondary"}>
                                                {job.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button size="sm" variant="outline">
                                                <Eye className="h-4 w-4 mr-1" />View
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

// Student View
function StudentPlacementView({ jobs, applications, loading }: { jobs: any[], applications: any[], loading: boolean }) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Placement Opportunities</h1>
                <p className="text-slate-500">Explore jobs and track your applications</p>
            </div>

            {/* Search */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="Search companies or roles..." className="pl-10" />
                    </div>
                </CardContent>
            </Card>

            {/* Open Jobs */}
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Open Opportunities
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
                    ) : (
                        <div className="space-y-4">
                            {jobs.length === 0 ? (
                                <p className="text-center py-8 text-slate-500">No open opportunities available right now.</p>
                            ) : jobs.filter(j => j.status === "Active").map((job) => (
                                <div key={job._id} className="p-4 border rounded-lg hover:border-blue-200 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold">{job.role}</h3>
                                                <Badge>{job.company}</Badge>
                                            </div>
                                            <p className="text-sm text-green-600 font-medium mt-1">₹{job.salaryRange?.min}-{job.salaryRange?.max} LPA</p>
                                            <p className="text-sm text-slate-500 mt-2">{job.eligibilityCriteria}</p>
                                            <p className="text-xs text-slate-400 mt-2">
                                                <Calendar className="h-3 w-3 inline mr-1" />
                                                Last date: {new Date(job.deadline).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Button>Apply Now</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* My Applications */}
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">My Applications</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
                    ) : (
                        <div className="space-y-3">
                            {applications.length === 0 ? (
                                <p className="text-slate-500 py-4">You haven't applied for any jobs yet.</p>
                            ) : applications.map((app) => (
                                <div key={app._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="font-medium">{app.jobId?.role}</p>
                                        <p className="text-sm text-slate-500">{app.jobId?.company} • Applied {new Date(app.appliedDate).toLocaleDateString()}</p>
                                    </div>
                                    <Badge variant={
                                        app.status === "Placed" || app.status === "Selected" ? "default" :
                                            app.status === "Rejected" ? "destructive" : "secondary"
                                    }>
                                        {app.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

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

                if (activeRole === "STUDENT" && user?.id) {
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
    }, [activeRole, user?.id]);

    if (activeRole === "PLACEMENT_OFFICER" || activeRole === "PLACEMENT_CELL") {
        return <PlacementOfficerView jobs={jobs} loading={loading} />;
    }

    return <StudentPlacementView jobs={jobs} applications={applications} loading={loading} />;
}
