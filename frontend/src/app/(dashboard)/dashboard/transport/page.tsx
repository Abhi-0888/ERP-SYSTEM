"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Bus, MapPin, Clock, ShieldCheck,
    Navigation, AlertCircle, Calendar, CreditCard,
    Users, ChevronRight, RefreshCw
} from "lucide-react";
import { TransportService, Vehicle, Route } from "@/lib/services/transport.service";
import { toast } from "sonner";

export default function StudentTransportPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [vRes, rRes] = await Promise.all([
                TransportService.getVehicles(),
                TransportService.getRoutes()
            ]);
            setVehicles(vRes);
            setRoutes(rRes);
        } catch (error) {
            console.error("Failed to fetch transport data", error);
            toast.error("Failed to load transit data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const isEnrolled = vehicles.length > 0 || routes.length > 0;
    const activeRoute = routes.find(r => r.isActive) || routes[0];
    const activeVehicle = vehicles.find(v => v.status === 'active') || vehicles[0];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Campus Transit</h1>
                    <p className="text-slate-500">Real-time tracking and commuter services.</p>
                </div>
                {isEnrolled && (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 py-1.5 px-4 rounded-full text-xs font-bold">
                        <Navigation className="h-3 w-3 mr-1.5" /> Normal Ops: {routes.length} Active Routes
                    </Badge>
                )}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <RefreshCw className="h-10 w-10 animate-spin text-slate-300" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Pinging Transit Network...</p>
                </div>
            ) : isEnrolled ? (
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-0 shadow-sm rounded-2xl border border-slate-100 overflow-hidden">
                            <CardHeader className="bg-slate-900 text-white border-b py-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <Bus className="h-5 w-5 text-blue-400" />
                                        Active Route: {activeRoute?.name || 'Loading...'}
                                    </CardTitle>
                                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Live</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="aspect-[16/9] bg-slate-100 flex items-center justify-center relative overflow-hidden group">
                                    {/* Map Background */}
                                    <div className="absolute inset-0 opacity-40 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/0,0,1/400x400?access_token=mock')] bg-center bg-cover grayscale" />

                                    <div className="relative z-10 text-center">
                                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center animate-pulse shadow-2xl shadow-blue-500/50 mx-auto">
                                            <Bus className="h-8 w-8 text-white" />
                                        </div>
                                        <p className="mt-4 font-black text-slate-900 text-xl">Transit In Operation</p>
                                        <p className="text-sm font-bold text-slate-500">{activeVehicle?.plateNumber} • {activeVehicle?.model}</p>
                                    </div>

                                    <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-xl border border-white shadow-xl">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-100 rounded-lg">
                                                    <Clock className="h-4 w-4 text-slate-600" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Route Schedule</p>
                                                    <p className="text-sm font-black text-slate-900">08:00 AM - 06:00 PM</p>
                                                </div>
                                            </div>
                                            <div className="h-8 w-px bg-slate-200" />
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-100 rounded-lg">
                                                    <MapPin className="h-4 w-4 text-slate-600" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Destination</p>
                                                    <p className="text-sm font-black text-slate-900">{activeRoute?.destination}</p>
                                                </div>
                                            </div>
                                            <Button size="sm" onClick={fetchData} className="rounded-lg bg-slate-900 hover:bg-blue-600 text-white font-bold">Refresh</Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="border-0 shadow-sm rounded-2xl border border-slate-100 p-6">
                                <h4 className="font-bold text-slate-900 mb-4">Transit Staff</h4>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                        <Users className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900">{activeVehicle?.driverName || 'Allocating...'}</p>
                                        <p className="text-xs text-slate-500 font-medium">{activeVehicle?.driverPhone || 'Contact Unavailable'}</p>
                                    </div>
                                    <Button variant="outline" size="sm" className="ml-auto rounded-lg">Call</Button>
                                </div>
                            </Card>
                            <Card className="border-0 shadow-sm rounded-2xl border border-slate-100 p-6">
                                <h4 className="font-bold text-slate-900 mb-4">Vehicle Details</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">Plate Number</span>
                                        <span className="font-bold text-slate-900">{activeVehicle?.plateNumber}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">Model</span>
                                        <span className="font-bold text-slate-900">{activeVehicle?.model}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">Capacity</span>
                                        <span className="font-bold text-slate-900">{activeVehicle?.capacity} Seats</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Card className="border-0 shadow-sm rounded-2xl border border-slate-100 p-6 bg-slate-50/50">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Route Network</h4>
                            <div className="space-y-4">
                                {routes.map((route, i) => (
                                    <div key={i} className="flex items-start gap-3 group cursor-pointer">
                                        <div className="mt-1 p-1 bg-white rounded border border-slate-200 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <Navigation className="h-3 w-3" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{route.name}</p>
                                            <p className="text-[10px] text-slate-500">{route.source} ➔ {route.destination}</p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 ml-auto text-slate-300" />
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-indigo-600 text-white p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <CreditCard className="h-5 w-5" />
                                <h4 className="font-bold">Transit Pass</h4>
                            </div>
                            <p className="text-xs text-indigo-100 mb-6">Your institutional transit pass is active for the current semester.</p>
                            <Button className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-bold rounded-xl">View Pass QR</Button>
                        </Card>
                    </div>
                </div>
            ) : (
                <Card className="border-0 shadow-sm rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center bg-slate-50/50">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Bus className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">No Transit Enrollment</h3>
                    <p className="text-slate-500 mt-2 max-w-sm mx-auto">You are currently not enrolled in the university transit network. Please contact the transport office to apply for a pass.</p>
                    <Button className="mt-8 bg-slate-900 text-white rounded-xl px-8 font-bold">Apply for Transit Pass</Button>
                </Card>
            )}
        </div>
    );
}
