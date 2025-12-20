"use client";

import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Home, Building, DoorOpen, Users, Plus, BedDouble, ShieldCheck, Zap
} from "lucide-react";

const mockHostels = [
    { id: "1", name: "Alpha Residence (Boys)", type: "boys", rooms: 100, occupied: 85, warden: "Mr. Ramesh Gupta", health: "Good" },
    { id: "2", name: "Beta Residence (Boys)", type: "boys", rooms: 80, occupied: 72, warden: "Mr. Sunil Kumar", health: "Maintenance" },
    { id: "3", name: "Gamma Residence (Girls)", type: "girls", rooms: 120, occupied: 110, warden: "Mrs. Lakshmi Iyer", health: "Excel" },
];

const mockRooms = [
    { id: "1", number: "101", floor: 1, capacity: 3, occupied: 3, type: "triple", rent: 5000 },
    { id: "2", number: "102", floor: 1, capacity: 3, occupied: 2, type: "triple", rent: 5000 },
    { id: "3", number: "103", floor: 1, capacity: 2, occupied: 2, type: "double", rent: 6000 },
    { id: "4", number: "104", floor: 1, capacity: 1, occupied: 0, type: "single", rent: 8000 },
];

export default function WardenDashboard() {
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
                            <p className="text-2xl font-black text-slate-900">{mockHostels.length}</p>
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
                            <p className="text-2xl font-black text-slate-900">300 Rms</p>
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
                            <p className="text-2xl font-black text-slate-900">33 Beds</p>
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
                            <p className="text-2xl font-black text-slate-900">89%</p>
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
                                {mockHostels.map((hostel) => (
                                    <TableRow key={hostel.id} className="border-slate-50">
                                        <TableCell className="font-bold text-slate-900">{hostel.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="rounded-lg uppercase text-[10px] font-bold border-slate-200">
                                                {hostel.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium text-slate-600">{hostel.rooms}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-600" style={{ width: `${(hostel.occupied / hostel.rooms) * 100}%` }} />
                                                </div>
                                                <span className="text-xs font-bold text-slate-500">{hostel.occupied}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={hostel.health === 'Good' || hostel.health === 'Excel' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-orange-50 text-orange-700 border-orange-100'}>
                                                {hostel.health}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm rounded-2xl border border-slate-100">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Priority Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex gap-4 p-4 bg-red-50 rounded-xl border border-red-100">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <ShieldCheck className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-red-900">Fire Safety Audit</p>
                                    <p className="text-xs text-red-700 mt-0.5">Block B inspection overdue by 2 days.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <Users className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-blue-900">Pending Allocations</p>
                                    <p className="text-xs text-blue-700 mt-0.5">14 Freshman waitlisted for Block A.</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
