"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Bus, MapPin, Navigation, Clock, Loader2, AlertCircle, Calendar, ShieldCheck
} from "lucide-react";
import { TransportService } from "@/lib/services/transport.service";
import { Button } from "@/components/ui/button";

export default function StudentTransportPage() {
    const [route, setRoute] = useState<any>(null);
    const [availableRoutes, setAvailableRoutes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState<string>("");
    const [pickupPoint, setPickupPoint] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const fetchTransportData = async () => {
        const userId = (user as any)?.id || (user as any)?._id;
        if (!userId) return;
        try {
            const [enrollment, allRoutes] = await Promise.all([
                TransportService.getStudentRoute(),
                TransportService.getRoutes()
            ]);
            
            if (enrollment && enrollment.routeId) {
                setRoute(enrollment.routeId);
            }
            setAvailableRoutes(allRoutes || []);
            setError(null);
        } catch (err: any) {
            console.error("Failed to fetch transport data", err);
            setError("Failed to load transport records. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransportData();
    }, [user]);

    const handleApply = async () => {
        if (!selectedRoute || !pickupPoint) {
            alert("Please select a route and pickup point");
            return;
        }
        setApplying(true);
        try {
            await TransportService.applyForTransport({
                routeId: selectedRoute,
                pickupPoint: pickupPoint
            });
            alert("Transport application submitted!");
            fetchTransportData();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to apply");
        } finally {
            setApplying(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <p className="text-slate-500 font-medium font-outfit">Syncing Fleet Data...</p>
        </div>
    );

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-slate-400" />
                <h3 className="text-xl font-bold">Transit System Offline</h3>
                <p className="text-slate-500 max-w-md">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black font-outfit text-slate-900 tracking-tight">Fleet & Logistics</h1>
                    <p className="text-slate-500 font-medium mt-1">Institutional transit network and route mapping</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl flex items-center gap-3 border border-slate-100">
                    <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center">
                        <Bus className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Live Status</p>
                        <p className="text-xs font-bold text-slate-900">Fleet Operations: ACTIVE</p>
                    </div>
                </div>
            </div>

            {route ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Route Info */}
                    <Card className="lg:col-span-2 border-0 shadow-2xl bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 p-10 flex flex-col md:flex-row gap-10">
                        <div className="flex-1 space-y-8">
                            <div>
                                <Badge className="bg-indigo-50 text-indigo-600 border-0 font-black tracking-widest uppercase mb-4">Current Route Map</Badge>
                                <h4 className="text-3xl font-black text-slate-900 uppercase tracking-tighter font-outfit mb-2">
                                    {route.name || "Main Campus Commuter"}
                                </h4>
                                <div className="flex items-center gap-2 text-slate-500 font-bold text-sm tracking-tight">
                                    <MapPin className="h-4 w-4 text-emerald-500" />
                                    {route.source} <span className="text-slate-300">→</span> {route.destination}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Scheduled Stop Points</p>
                                <div className="space-y-4 relative pl-8 border-l-2 border-indigo-100">
                                    {(route.stops || [
                                        { name: "Sector 4 Junction", time: "07:45 AM" },
                                        { name: "Central Metro", time: "08:10 AM" },
                                        { name: "East Gate Exit", time: "08:35 AM" }
                                    ]).map((stop: any, idx: number) => (
                                        <div key={idx} className="relative group">
                                            <div className="absolute -left-[37px] top-1 w-4 h-4 rounded-full bg-white border-4 border-indigo-500 group-hover:bg-indigo-500 transition-colors" />
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">{stop.name}</p>
                                                <p className="text-xs text-slate-500 font-medium">Estimated Arrival: {stop.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-72 space-y-6">
                            <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6">
                                    <Navigation className="h-10 w-10 text-indigo-600" />
                                </div>
                                <h5 className="font-black text-slate-900 uppercase tracking-tighter">Live Geofence</h5>
                                <p className="text-xs text-slate-500 mt-2 font-medium">Vehicle 44A is currently en route to Central Metro stop.</p>
                                <Button className="w-full mt-6 bg-indigo-600 font-bold rounded-xl h-11">Open Live Map</Button>
                            </div>

                            <Card className="bg-indigo-50 border-0 p-6 rounded-[2rem]">
                                <div className="flex items-center gap-4">
                                    <Clock className="h-6 w-6 text-indigo-600" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Driver On Record</p>
                                        <p className="text-sm font-bold text-indigo-900">Rajesh V. (+91 98XXX XXXX)</p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </Card>

                    {/* Stats & Rules */}
                    <div className="space-y-6">
                        <Card className="border-0 shadow-sm bg-slate-900 text-white rounded-[2rem] p-8 overflow-hidden relative group">
                            <ShieldCheck className="absolute -right-4 -top-4 h-32 w-32 text-white/5 group-hover:rotate-12 transition-transform" />
                            <h4 className="text-lg font-bold font-outfit uppercase tracking-tight">Security Protocol</h4>
                            <div className="mt-6 space-y-4">
                                <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                    <div>
                                        <p className="text-sm font-bold text-slate-100">Tap-In Verification</p>
                                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">RFID card logging is mandatory upon boarding/deboarding.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                    <div>
                                        <p className="text-sm font-bold text-slate-100">CCTV Coverage</p>
                                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">All vehicles are equipped with dual-lens 4K thermal sensors.</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-100">
                            <Calendar className="h-8 w-8 mb-4 text-white/50" />
                            <h5 className="text-xl font-black font-outfit">Weekend Shuttle</h5>
                            <p className="text-xs text-white/80 mt-2 font-medium leading-relaxed">Shuttle service to the city center is available every Sat-Sun between 10:00 AM and 18:00 PM.</p>
                            <Button className="w-full mt-6 bg-white text-indigo-600 hover:bg-slate-50 font-bold rounded-xl h-11 text-xs">VIEW WEEKEND SCHEDULE</Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="py-24 bg-white border border-dashed border-slate-200 rounded-[3rem] text-center space-y-6 max-w-4xl mx-auto px-8">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                        <Bus className="h-10 w-10 text-slate-300" />
                    </div>
                    <div className="max-w-md mx-auto">
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">No Active Route</h2>
                        <p className="text-slate-500 font-medium mt-2">
                            Institutional transport is currently only active for registered commuters.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">Select Route</label>
                            <select 
                                onChange={(e) => setSelectedRoute(e.target.value)}
                                className="w-full h-12 rounded-xl border border-slate-200 px-4 bg-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Select a route...</option>
                                {availableRoutes.map((r) => (
                                    <option key={r._id} value={r._id}>{r.name} ({r.startPoint} - {r.endPoint})</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">Pickup Point / Stop</label>
                            <input 
                                type="text"
                                placeholder="Enter your stop..."
                                onChange={(e) => setPickupPoint(e.target.value)}
                                className="w-full h-12 rounded-xl border border-slate-200 px-4 bg-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <Button 
                        onClick={handleApply}
                        disabled={applying}
                        className="bg-indigo-600 font-bold rounded-xl px-10 h-12 shadow-xl shadow-indigo-100"
                    >
                        {applying ? <Loader2 className="h-5 w-5 animate-spin" /> : "Apply for Commute"}
                    </Button>
                </div>
            )}
        </div>
    );
}
