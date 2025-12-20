"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Bus, MapPin, Clock, ShieldCheck,
    Navigation, AlertCircle, Calendar, CreditCard,
    Users, ChevronRight
} from "lucide-react";

export default function StudentTransportPage() {
    const isEnrolled = true;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Campus Transit</h1>
                    <p className="text-slate-500">Real-time tracking and commuter services.</p>
                </div>
                {isEnrolled && (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 py-1.5 px-4 rounded-full text-xs font-bold">
                        <Navigation className="h-3 w-3 mr-1.5" /> Normal Ops: All Routes
                    </Badge>
                )}
            </div>

            {isEnrolled ? (
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-0 shadow-sm rounded-2xl border border-slate-100 overflow-hidden">
                            <CardHeader className="bg-slate-900 text-white border-b py-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <Bus className="h-5 w-5 text-blue-400" />
                                        Active Route: North Express (6A)
                                    </CardTitle>
                                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Live</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="aspect-[16/9] bg-slate-100 flex items-center justify-center relative overflow-hidden group">
                                    {/* Mock Map Background */}
                                    <div className="absolute inset-0 opacity-40 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/0,0,1/400x400?access_token=mock')] bg-center bg-cover grayscale" />

                                    <div className="relative z-10 text-center">
                                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center animate-pulse shadow-2xl shadow-blue-500/50 mx-auto">
                                            <Bus className="h-8 w-8 text-white" />
                                        </div>
                                        <p className="mt-4 font-black text-slate-900 text-xl">Arriving in 4 mins</p>
                                        <p className="text-sm font-bold text-slate-500">Current Location: Anna Nagar Hub</p>
                                    </div>

                                    <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-xl border border-white shadow-xl">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-100 rounded-lg">
                                                    <Clock className="h-4 w-4 text-slate-600" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expected Arrival</p>
                                                    <p className="text-sm font-black text-slate-900">08:42 AM</p>
                                                </div>
                                            </div>
                                            <div className="h-8 w-px bg-slate-200" />
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-100 rounded-lg">
                                                    <MapPin className="h-4 w-4 text-slate-600" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Drop Point</p>
                                                    <p className="text-sm font-black text-slate-900">Main Gate</p>
                                                </div>
                                            </div>
                                            <Button size="sm" className="rounded-lg bg-slate-900 hover:bg-blue-600 text-white font-bold">Refresh</Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="border-0 shadow-sm rounded-2xl border border-slate-100 p-6">
                                <h4 className="font-bold text-slate-900 mb-4">Driver Profile</h4>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                        <Users className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900">Mr. Karthik R.</p>
                                        <p className="text-xs text-slate-500 font-medium">Verified Staff • 8 Years Exp</p>
                                    </div>
                                    <Button variant="outline" size="sm" className="ml-auto rounded-lg">Call</Button>
                                </div>
                            </Card>
                            <Card className="border-0 shadow-sm rounded-2xl border border-slate-100 p-6">
                                <h4 className="font-bold text-slate-900 mb-4">Vehicle Specs</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-medium">Reg No.</span>
                                        <span className="font-mono font-bold">TN-01-AB-1234</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-medium">Capacity</span>
                                        <span className="font-bold text-slate-900">50 Seats (CCTV)</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Card className="border-0 shadow-sm rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-6 relative overflow-hidden">
                            <CreditCard className="absolute -right-6 -bottom-6 h-32 w-32 text-white/10 rotate-12" />
                            <div className="relative z-10">
                                <Badge className="bg-white/20 text-white border-0 mb-4">Smart Pass Active</Badge>
                                <h4 className="text-xl font-black">Digital Transit ID</h4>
                                <div className="mt-8 p-4 bg-white rounded-2xl flex items-center justify-between">
                                    <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center">
                                        <Bus className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <div className="flex-1 px-4">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Validated Till</p>
                                        <p className="text-xs font-bold text-slate-900">May 30, 2025</p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-slate-300" />
                                </div>
                                <Button className="w-full mt-4 bg-white text-indigo-700 hover:bg-slate-50 rounded-xl font-bold">
                                    Show QR Code
                                </Button>
                            </div>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl border border-slate-100 overflow-hidden">
                            <CardHeader className="bg-slate-50/50 border-b">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Security Features</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-emerald-50 rounded-lg mt-0.5">
                                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">GPS Geo-Fencing</p>
                                        <p className="text-[10px] text-slate-500 leading-tight">Instant alerts to parents & university when bus deviates.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-emerald-50 rounded-lg mt-0.5">
                                        <Users className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">Panic Alarm</p>
                                        <p className="text-[10px] text-slate-500 leading-tight">Emergency button linked to local mobile police unit.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : (
                <Card className="border-0 shadow-sm rounded-3xl border border-slate-100 overflow-hidden">
                    <CardContent className="p-20 text-center">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Bus className="h-10 w-10 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900">Commute Smarter</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mt-2 font-medium">
                            Join the university transport network for safe, reliable, and subsidized campus transit.
                        </p>
                        <Button className="mt-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-12 py-7 text-lg font-black shadow-xl shadow-blue-200">
                            Apply for Smart Pass
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
