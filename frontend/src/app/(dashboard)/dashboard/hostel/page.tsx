"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, User, BedDouble, Calendar, CreditCard, Loader2 } from "lucide-react";
import { HostelService } from "@/lib/services/hostel.service";
import { toast } from "sonner";

export default function HostelPage() {
    const [room, setRoom] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRoom = async () => {
            try {
                setLoading(true);
                const data = await HostelService.getMyRoom();
                setRoom(data);
            } catch (error) {
                console.error("Failed to load room details:", error);
                toast.error("Failed to load room details");
            } finally {
                setLoading(false);
            }
        };
        fetchRoom();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                <p className="text-slate-500 font-medium">Fetching allocation details...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Residential Life</h1>
                    <p className="text-slate-500">Your home on campus and related services.</p>
                </div>
            </div>

            {room ? (
                <div className="grid lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2 border-0 shadow-sm rounded-2xl border border-slate-100 overflow-hidden">
                        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
                            <Home className="absolute -right-4 -bottom-4 h-24 w-24 text-white/10 rotate-12" />
                            <div className="absolute bottom-4 left-6">
                                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md px-3 py-1">
                                    Allocated Active
                                </Badge>
                                <h2 className="text-2xl font-black text-white mt-1">
                                    {room.hostelId?.name || "Hostel Block"}
                                </h2>
                            </div>
                        </div>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Room Number</p>
                                    <p className="text-xl font-bold text-slate-900">{room.roomNumber}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Configuration</p>
                                    <p className="text-xl font-bold text-slate-900">{room.capacity} Sharing</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Floor</p>
                                    <p className="text-xl font-bold text-slate-900">{room.floor}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Room Type</p>
                                    <p className="text-xl font-bold text-slate-900">{room.roomType || "Standard"}</p>
                                </div>
                            </div>

                            <div className="mt-10 pt-8 border-t border-slate-100">
                                <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                                    <BedDouble className="h-5 w-5 text-blue-500" />
                                    Roommate Profiles
                                </h4>
                                <div className="flex flex-wrap gap-4">
                                    {room.occupants?.map((occ: any, i: number) => {
                                        const name = occ.user?.firstName ? `${occ.user.firstName} ${occ.user.lastName}` : occ.user?.username || "Unknown Student";
                                        return (
                                            <div key={i} className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <span className="text-sm font-bold text-slate-700">{name}</span>
                                            </div>
                                        );
                                    })}
                                    {(!room.occupants || room.occupants.length === 0) && (
                                        <p className="text-sm text-slate-500 italic">No occupants found</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card className="border-0 shadow-sm rounded-2xl bg-slate-900 text-white">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Billing & Deadlines</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                                        <div>
                                            <p className="text-xs text-slate-400 font-medium">Hostel Fee</p>
                                            <p className="text-lg font-bold">Generated by system</p>
                                        </div>
                                        <CreditCard className="h-5 w-5 text-white/30" />
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                        <div>
                                            <p className="text-xs text-emerald-400 font-bold uppercase tracking-tight">Status</p>
                                            <p className="text-sm font-bold text-emerald-300">Check Fees Tab</p>
                                        </div>
                                        <Calendar className="h-5 w-5 text-emerald-400/50" />
                                    </div>
                                </div>
                                <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 rounded-xl py-6 font-bold shadow-lg shadow-blue-900/20">
                                    Go to Fee Portal
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-orange-50 border border-orange-100 p-6">
                            <h4 className="font-bold text-orange-900">Maintenance Request?</h4>
                            <p className="text-xs text-orange-700 mt-1 leading-relaxed">
                                AC not working or water issues? Log a high-priority ticket for the block staff.
                            </p>
                            <Button variant="outline" className="mt-4 border-orange-200 text-orange-800 hover:bg-orange-100 w-full rounded-xl font-bold">
                                Create Ticket
                            </Button>
                        </Card>
                    </div>
                </div>
            ) : (
                <Card className="border-0 shadow-sm rounded-3xl border border-dashed border-slate-200">
                    <CardContent className="p-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Home className="h-10 w-10 text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900">Home Away From Home</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mt-2">
                            You haven&apos;t been allocated a room yet. Starting your journey? Contact the hostel warden for allocation.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
