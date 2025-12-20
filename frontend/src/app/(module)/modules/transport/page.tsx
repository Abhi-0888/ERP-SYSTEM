"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Bus, Search, Plus, MoreHorizontal, Route, Users, MapPin, Gauge, ShieldAlert
} from "lucide-react";
import { useState } from "react";

const initialVehicles = [
    { id: "1", number: "TN-01-AB-1234", type: "Bus", capacity: 50, driver: "Mr. Kumar", route: "Route A", status: "active", health: "95%" },
    { id: "2", number: "TN-01-CD-5678", type: "Bus", capacity: 45, driver: "Mr. Rajan", route: "Route B", status: "active", health: "88%" },
    { id: "3", number: "TN-01-EF-9012", type: "Van", capacity: 15, driver: "Mr. Suresh", route: "Route C", status: "maintenance", health: "42%" },
    { id: "4", number: "TN-01-GH-3456", type: "Bus", capacity: 50, driver: "Mr. Pillai", route: "Route D", status: "active", health: "91%" },
];

const initialRoutes = [
    { id: "1", name: "Route A - North", startPoint: "Campus", endPoint: "Anna Nagar", stops: 8, students: 45, vehicle: "TN-01-AB-1234" },
    { id: "2", name: "Route B - South", startPoint: "Campus", endPoint: "T. Nagar", stops: 6, students: 40, vehicle: "TN-01-CD-5678" },
    { id: "3", name: "Route C - East", startPoint: "Campus", endPoint: "Adyar", stops: 5, students: 12, vehicle: "TN-01-EF-9012" },
    { id: "4", name: "Route D - West", startPoint: "Campus", endPoint: "Porur", stops: 7, students: 48, vehicle: "TN-01-GH-3456" },
];

export default function TransportManagerDashboard() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Fleet Operations</h1>
                    <p className="text-slate-500">Logistics, route optimization, and vehicle tracking.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl"><Gauge className="h-4 w-4 mr-2" />Live Tracking</Button>
                    <Button className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-100">
                        <Plus className="h-4 w-4 mr-2" />Add Vehicle
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm bg-slate-50/50 border border-slate-100">
                    <CardContent className="p-6">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Fleet</p>
                        <div className="flex items-end justify-between mt-2">
                            <p className="text-3xl font-black text-slate-900">12/14</p>
                            <Bus className="h-8 w-8 text-blue-500 opacity-20" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-slate-50/50 border border-slate-100">
                    <CardContent className="p-6">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Staff Drivers</p>
                        <div className="flex items-end justify-between mt-2">
                            <p className="text-3xl font-black text-slate-900">18</p>
                            <Users className="h-8 w-8 text-emerald-500 opacity-20" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-slate-50/50 border border-slate-100">
                    <CardContent className="p-6">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Route Coverage</p>
                        <div className="flex items-end justify-between mt-2">
                            <p className="text-3xl font-black text-slate-900">24 Kms</p>
                            <Route className="h-8 w-8 text-indigo-500 opacity-20" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-red-50/50 border border-red-100">
                    <CardContent className="p-6">
                        <p className="text-xs font-bold text-red-600 uppercase tracking-widest">Maintenance Alerts</p>
                        <div className="flex items-end justify-between mt-2">
                            <p className="text-3xl font-black text-red-900">2</p>
                            <ShieldAlert className="h-8 w-8 text-red-500 opacity-20" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden border border-slate-100">
                <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center justify-between py-4">
                    <CardTitle className="text-lg font-bold">Vehicle Audit</CardTitle>
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Find vehicle or driver..."
                            className="pl-10 h-10 rounded-xl bg-white border-slate-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/30 border-0">
                                <TableHead className="font-bold h-12">Registration</TableHead>
                                <TableHead className="font-bold h-12">Model</TableHead>
                                <TableHead className="font-bold h-12">Driver</TableHead>
                                <TableHead className="font-bold h-12">Deployment</TableHead>
                                <TableHead className="font-bold h-12">Status</TableHead>
                                <TableHead className="font-bold h-12">Flt Health</TableHead>
                                <TableHead className="font-bold h-12 text-right">Ops</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialVehicles.map((vehicle) => (
                                <TableRow key={vehicle.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                                    <TableCell className="font-mono font-bold text-slate-700">{vehicle.number}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="rounded-lg text-[10px] font-bold uppercase">{vehicle.type}</Badge>
                                    </TableCell>
                                    <TableCell className="font-medium text-slate-900">{vehicle.driver}</TableCell>
                                    <TableCell className="text-slate-500">{vehicle.route}</TableCell>
                                    <TableCell>
                                        <Badge className={vehicle.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-orange-50 text-orange-700 border-orange-100'}>
                                            {vehicle.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${parseInt(vehicle.health) > 80 ? 'bg-emerald-500' : 'bg-orange-500'}`}
                                                    style={{ width: vehicle.health }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-500">{vehicle.health}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" variant="ghost" className="rounded-lg hover:bg-slate-100">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm rounded-2xl border border-slate-100 overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-bold">Route Efficiency</CardTitle>
                    <Button variant="link" className="text-indigo-600 font-bold p-0 h-auto">View Optimization Map</Button>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/30 border-0">
                                <TableHead className="font-bold">System Route</TableHead>
                                <TableHead className="font-bold">Terminals</TableHead>
                                <TableHead className="font-bold">Stops</TableHead>
                                <TableHead className="font-bold">Load</TableHead>
                                <TableHead className="font-bold">Primary Vehicle</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialRoutes.map((route) => (
                                <TableRow key={route.id} className="border-slate-50">
                                    <TableCell className="font-bold">{route.name}</TableCell>
                                    <TableCell className="text-xs text-slate-500">{route.startPoint} ⇄ {route.endPoint}</TableCell>
                                    <TableCell className="font-medium text-slate-600">{route.stops}</TableCell>
                                    <TableCell className="font-bold text-indigo-600">{route.students} Users</TableCell>
                                    <TableCell><Badge variant="secondary" className="font-mono text-[10px]">{route.vehicle}</Badge></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
