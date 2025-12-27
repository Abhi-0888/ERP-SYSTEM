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
    Home, Building, DoorOpen, Users, Plus, BedDouble, ShieldCheck, Zap, Loader2
} from "lucide-react";
import { HostelService } from "@/lib/services/hostel.service";
import { EmptyState } from "@/components/empty-state";
import { toast } from "sonner";

export default function WardenDashboard() {
    const [hostels, setHostels] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [hostelRes, summaryRes] = await Promise.all([
                    HostelService.getHostels(),
                    HostelService.getSummary()
                ]);
                setHostels(hostelRes.data || []);
                setSummary(summaryRes);
            } catch (error) {
                console.error("Failed to load hostel data:", error);
                toast.error("Failed to load accommodation data");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600 mb-4" />
                <p className="text-slate-500 font-medium">Synchronizing inventory...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Accommodation Hub</h1>
                    <p className="text-slate-500">Inventory, allocation, and facility oversight.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl bg-white"><Zap className="h-4 w-4 mr-2" />Maintenance</Button>
                    <Button className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-100">
                        <Plus className="h-4 w-4 mr-2" />New Block
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm border border-slate-100">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <Building className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Blocks</p>
                            <p className="text-2xl font-black text-slate-900">{summary?.totalHostels || 0}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm border border-slate-100">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 rounded-xl">
                            <DoorOpen className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Inventory</p>
                            <p className="text-2xl font-black text-slate-900">{summary?.totalRooms || 0} Rms</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm border border-slate-100">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-orange-50 rounded-xl">
                            <BedDouble className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Available</p>
                            <p className="text-2xl font-black text-slate-900">{(summary?.totalCapacity - summary?.totalOccupancy) || 0} Beds</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm border border-slate-100">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 rounded-xl">
                            <Users className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Occupancy</p>
                            <p className="text-2xl font-black text-slate-900">{Math.round(summary?.overallOccupancyPercentage || 0)}%</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-0 shadow-sm rounded-2xl overflow-hidden border border-slate-100">
                    <CardHeader className="bg-slate-50/50 border-b">
                        <CardTitle className="text-lg font-bold">Facility Audit</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {hostels.length === 0 ? (
                            <div className="p-12">
                                <EmptyState
                                    icon={Building}
                                    title="No Residence Blocks"
                                    description="You haven't added any hostel buildings yet. Register your first block to start managing accommodations."
                                    actionLabel="Add Residence Block"
                                    onAction={() => console.log("Open add hostel dialog")}
                                />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/20 border-0">
                                        <TableHead className="font-bold">Residence Block</TableHead>
                                        <TableHead className="font-bold">Demographic</TableHead>
                                        <TableHead className="font-bold">Room Count</TableHead>
                                        <TableHead className="font-bold">Utilization</TableHead>
                                        <TableHead className="font-bold">Health</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {hostels.map((hostel) => {
                                        const detail = summary?.hostelDetails?.find((d: any) => d.hostelId === hostel._id);
                                        return (
                                            <TableRow key={hostel._id} className="border-slate-50">
                                                <TableCell className="font-bold text-slate-900">{hostel.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="rounded-lg uppercase text-[10px] font-bold border-slate-200">
                                                        {hostel.type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-medium text-slate-600">{detail?.totalRooms || 0}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-blue-600" style={{ width: `${detail?.occupancyPercentage || 0}%` }} />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-500">{detail?.occupancy || 0}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100">
                                                        Operational
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm rounded-2xl border border-slate-100">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Priority Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <Users className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-blue-900">Allocation Status</p>
                                    <p className="text-xs text-blue-700 mt-0.5">
                                        {summary?.totalCapacity - summary?.totalOccupancy} seats available for new residents.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <ShieldCheck className="h-5 w-5 text-slate-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">Safety Compliance</p>
                                    <p className="text-xs text-slate-700 mt-0.5">All blocks certified healthy.</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
