"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Home, Bed, Users, Shield, Loader2, AlertCircle, Calendar, MapPin
} from "lucide-react";
import { HostelService } from "@/lib/services/hostel.service";
import { Button } from "@/components/ui/button";

export default function StudentHostelPage() {
    const [allocation, setAllocation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchHostelData = async () => {
            const userId = (user as any)?.id || (user as any)?._id;
            if (!userId) return;
            try {
                // Find a room where the student is an occupant
                const roomsRes = await HostelService.getRooms();
                const studentRoom = (roomsRes.data || roomsRes || []).find((r: any) => 
                    r.occupants?.some((occ: any) => (occ._id || occ) === userId)
                );
                setAllocation(studentRoom);
                setError(null);
            } catch (err: any) {
                console.error("Failed to fetch hostel data", err);
                setError("Failed to load hostel records. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchHostelData();
    }, [user]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <p className="text-slate-500 font-medium font-outfit">Retrieving Housing Records...</p>
        </div>
    );

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-slate-400" />
                <h3 className="text-xl font-bold">Housing Management Offline</h3>
                <p className="text-slate-500 max-w-md">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div>
                <h1 className="text-4xl font-black font-outfit text-slate-900 tracking-tight">Accommodation Hub</h1>
                <p className="text-slate-500 font-medium mt-1">Your residential details and hostel services</p>
            </div>

            {allocation ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Primary Allocation Detail */}
                    <Card className="border-0 shadow-2xl bg-indigo-600 text-white rounded-[2.5rem] overflow-hidden group">
                        <Home className="absolute -right-4 -bottom-4 h-48 w-48 text-white/5 group-hover:rotate-12 transition-transform" />
                        <CardHeader className="p-10 pb-4">
                            <Badge className="w-fit bg-white/20 text-white border-0 font-black tracking-widest uppercase mb-4">Current Residence</Badge>
                            <CardTitle className="text-3xl font-black font-outfit uppercase tracking-tighter">
                                {allocation.hostelId?.name || "Premium Student Housing"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 pt-0">
                            <div className="grid grid-cols-2 gap-8 mt-8">
                                <div>
                                    <p className="text-indigo-100 font-bold text-xs uppercase tracking-widest">Room Matrix</p>
                                    <p className="text-3xl font-black mt-1">R-{(allocation as any).roomNumber}</p>
                                </div>
                                <div>
                                    <p className="text-indigo-100 font-bold text-xs uppercase tracking-widest">Floor / Sector</p>
                                    <p className="text-3xl font-black mt-1">{(allocation as any).floor || "G"}-Floor</p>
                                </div>
                                <div>
                                    <p className="text-indigo-100 font-bold text-xs uppercase tracking-widest">Accommodation</p>
                                    <p className="text-3xl font-black mt-1">{(allocation as any).type || "Double"}</p>
                                </div>
                                <div>
                                    <p className="text-indigo-100 font-bold text-xs uppercase tracking-widest">Occupancy</p>
                                    <p className="text-3xl font-black mt-1">{(allocation as any).occupants?.length || 0} / {(allocation as any).capacity || 2}</p>
                                </div>
                            </div>
                            <div className="mt-10 flex gap-4">
                                <Button className="bg-white text-indigo-700 hover:bg-slate-50 font-bold rounded-2xl px-8 flex items-center gap-2">
                                    <Shield className="h-4 w-4" /> Management Rules
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Secondary Details Area */}
                    <div className="space-y-6">
                        <Card className="border-0 shadow-sm bg-white rounded-[2rem] border border-slate-100 p-8">
                            <div className="flex items-center gap-6">
                                <div className="p-5 bg-blue-50 text-blue-600 rounded-3xl">
                                    <Users className="h-8 w-8" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Residential Peers</h4>
                                    <p className="text-slate-500 text-sm font-medium">Co-occupants in your immediate environment</p>
                                </div>
                            </div>
                            <div className="mt-6 space-y-4">
                                {(allocation as any).occupants?.filter((o: any) => (o._id || o) !== (user as any)?._id).length > 0 ? 
                                    (allocation as any).occupants.filter((o: any) => (o._id || o) !== (user as any)?._id).map((occ: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-black text-indigo-600">
                                                    {occ.username?.substring(0, 1).toUpperCase() || "S"}
                                                </div>
                                                <span className="font-bold text-slate-900">{occ.username}</span>
                                            </div>
                                            <Badge variant="outline" className="text-[10px] font-black tracking-widest">LEVEL {(allocation as any).floor}</Badge>
                                        </div>
                                    )) : (
                                        <p className="text-center py-6 text-slate-400 font-bold text-sm italic bg-slate-50 rounded-2xl">No co-occupants recorded for this chamber.</p>
                                    )
                                }
                            </div>
                        </Card>

                        <Card className="border-0 shadow-sm bg-slate-900 rounded-[2rem] text-white p-8 overflow-hidden relative group">
                            <Calendar className="absolute -right-4 -bottom-4 h-24 w-24 text-white/5 opacity-50" />
                            <h4 className="text-lg font-bold font-outfit uppercase tracking-tight">Access Control</h4>
                            <div className="mt-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                    <p className="text-xs text-slate-400 font-medium tracking-tight">Curfew Compliance: <span className="text-white font-bold ml-1">21:30 PM IST</span></p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                    <p className="text-xs text-slate-400 font-medium tracking-tight">Latest Maintenance Audit: <span className="text-white font-bold ml-1">24 Mar 2024</span></p>
                                </div>
                            </div>
                            <Button className="w-full mt-6 bg-white/10 hover:bg-white/20 text-white border-0 font-bold rounded-xl h-12">
                                Register Leave Request
                            </Button>
                        </Card>
                    </div>
                </div>
            ) : (
                <div className="py-24 bg-white border border-dashed border-slate-200 rounded-[3rem] text-center space-y-6">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                        <Bed className="h-10 w-10 text-slate-300" />
                    </div>
                    <div className="max-w-md mx-auto">
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">No Allocation Found</h2>
                        <p className="text-slate-500 font-medium mt-2">
                            It seems your institutional identity hasn't been mapped to a residential unit yet. Visit the Warden's Desk for physical allocation.
                        </p>
                    </div>
                    <div className="flex justify-center gap-4">
                        <Button className="bg-indigo-600 font-bold rounded-xl px-8">Apply for Hostel</Button>
                        <Button variant="ghost" className="font-bold rounded-xl px-8">Hostel Fee Matrix</Button>
                    </div>
                </div>
            )}
        </div>
    );
}
