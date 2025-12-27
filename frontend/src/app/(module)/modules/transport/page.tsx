"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Bus, Search, Plus, MoreHorizontal, Route as RouteIcon, Users, MapPin, Gauge, ShieldAlert, Loader2
} from "lucide-react";
import { TransportService } from "@/lib/services/transport.service";
import { EmptyState } from "@/components/empty-state";
import { toast } from "sonner";

export default function TransportManagerDashboard() {
    const [searchQuery, setSearchQuery] = useState("");
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [routes, setRoutes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const [vehRes, routeRes] = await Promise.all([
                    TransportService.getAllVehicles(),
                    TransportService.getAllRoutes()
                ]);
                setVehicles(vehRes.data || vehRes || []);
                setRoutes(routeRes.data || routeRes || []);
            } catch (error) {
                console.error("Failed to load transport data:", error);
                toast.error("Failed to load fleet data");
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600 mb-4" />
                <p className="text-slate-500 font-medium">Calibrating fleet telemetry...</p>
            </div>
        );
    }

    const activeVehicles = vehicles.filter(v => v.status === 'active').length;

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
                            <p className="text-3xl font-black text-slate-900">{activeVehicles}/{vehicles.length}</p>
                            <Bus className="h-8 w-8 text-blue-500 opacity-20" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-slate-50/50 border border-slate-100">
                    <CardContent className="p-6">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Route Coverage</p>
                        <div className="flex items-end justify-between mt-2">
                            <p className="text-3xl font-black text-slate-900">{routes.length}</p>
                            <RouteIcon className="h-8 w-8 text-indigo-500 opacity-20" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-slate-50/50 border border-slate-100">
                    <CardContent className="p-6">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Capacity</p>
                        <div className="flex items-end justify-between mt-2">
                            <p className="text-3xl font-black text-slate-900">{vehicles.reduce((acc, v) => acc + v.capacity, 0)}</p>
                            <Users className="h-8 w-8 text-emerald-500 opacity-20" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-red-50/50 border border-red-100">
                    <CardContent className="p-6">
                        <p className="text-xs font-bold text-red-600 uppercase tracking-widest">Maintenance Alerts</p>
                        <div className="flex items-end justify-between mt-2">
                            <p className="text-3xl font-black text-red-900">{vehicles.filter(v => v.status === 'maintenance').length}</p>
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
                    {vehicles.length === 0 ? (
                        <div className="p-12">
                            <EmptyState
                                icon={Bus}
                                title="No Vehicles Registered"
                                description="Your fleet repository is empty. Add your first vehicle to start tracking routes."
                                actionLabel="Add Vehicle"
                                onAction={() => console.log("Open add vehicle dialog")}
                            />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/30 border-0">
                                    <TableHead className="font-bold h-12">Registration</TableHead>
                                    <TableHead className="font-bold h-12">Type</TableHead>
                                    <TableHead className="font-bold h-12">Capacity</TableHead>
                                    <TableHead className="font-bold h-12">Status</TableHead>
                                    <TableHead className="font-bold h-12">Health</TableHead>
                                    <TableHead className="font-bold h-12 text-right">Ops</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {vehicles.map((vehicle) => (
                                    <TableRow key={vehicle._id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                                        <TableCell className="font-mono font-bold text-slate-700">{vehicle.registrationNumber}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="rounded-lg text-[10px] font-bold uppercase">{vehicle.type}</Badge>
                                        </TableCell>
                                        <TableCell className="font-medium text-slate-900">{vehicle.capacity} Seats</TableCell>
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
                    )}
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm rounded-2xl border border-slate-100 overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-bold">Route Efficiency</CardTitle>
                    <Button variant="link" className="text-indigo-600 font-bold p-0 h-auto">View Optimization Map</Button>
                </CardHeader>
                <CardContent className="p-0">
                    {routes.length === 0 ? (
                        <div className="p-12">
                            <EmptyState
                                icon={RouteIcon}
                                title="No Routes Defined"
                                description="Configure your transit lines to optimize student commute."
                                actionLabel="Create Route"
                                onAction={() => console.log("Open create route dialog")}
                            />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/30 border-0">
                                    <TableHead className="font-bold">System Route</TableHead>
                                    <TableHead className="font-bold">Terminals</TableHead>
                                    <TableHead className="font-bold">Stops</TableHead>
                                    <TableHead className="font-bold">Primary Vehicle</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {routes.map((route) => (
                                    <TableRow key={route._id} className="border-slate-50">
                                        <TableCell className="font-bold">{route.name}</TableCell>
                                        <TableCell className="text-xs text-slate-500">{route.startPoint} ⇄ {route.endPoint}</TableCell>
                                        <TableCell className="font-medium text-slate-600">{route.stops.length}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-mono text-[10px]">
                                                {route.vehicleId?.registrationNumber || 'Unassigned'}
                                            </Badge>
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
