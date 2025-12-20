"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Bus, Search, Plus, MoreHorizontal, Pencil, Trash2, Route, Users, MapPin } from "lucide-react";

interface Vehicle {
    id: string;
    number: string;
    type: "Bus" | "Van" | "Car";
    capacity: number;
    driver: string;
    route: string;
    status: "active" | "maintenance" | "inactive";
}

interface TransportRoute {
    id: string;
    name: string;
    startPoint: string;
    endPoint: string;
    stops: number;
    students: number;
    vehicle: string;
}

const initialVehicles: Vehicle[] = [
    { id: "1", number: "TN-01-AB-1234", type: "Bus", capacity: 50, driver: "Mr. Kumar", route: "Route A", status: "active" },
    { id: "2", number: "TN-01-CD-5678", type: "Bus", capacity: 45, driver: "Mr. Rajan", route: "Route B", status: "active" },
    { id: "3", number: "TN-01-EF-9012", type: "Van", capacity: 15, driver: "Mr. Suresh", route: "Route C", status: "maintenance" },
    { id: "4", number: "TN-01-GH-3456", type: "Bus", capacity: 50, driver: "Mr. Pillai", route: "Route D", status: "active" },
];

const initialRoutes: TransportRoute[] = [
    { id: "1", name: "Route A - North", startPoint: "Campus", endPoint: "Anna Nagar", stops: 8, students: 45, vehicle: "TN-01-AB-1234" },
    { id: "2", name: "Route B - South", startPoint: "Campus", endPoint: "T. Nagar", stops: 6, students: 40, vehicle: "TN-01-CD-5678" },
    { id: "3", name: "Route C - East", startPoint: "Campus", endPoint: "Adyar", stops: 5, students: 12, vehicle: "TN-01-EF-9012" },
    { id: "4", name: "Route D - West", startPoint: "Campus", endPoint: "Porur", stops: 7, students: 48, vehicle: "TN-01-GH-3456" },
];

export default function TransportPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
    const [routes] = useState<TransportRoute[]>(initialRoutes);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<Vehicle | null>(null);
    const [formData, setFormData] = useState({ number: "", type: "Bus" as Vehicle["type"], capacity: 50, driver: "", route: "" });

    const filteredVehicles = vehicles.filter((v) =>
        v.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.driver.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreate = () => {
        const newVehicle: Vehicle = { id: Date.now().toString(), ...formData, status: "active" };
        setVehicles([...vehicles, newVehicle]);
        setFormData({ number: "", type: "Bus", capacity: 50, driver: "", route: "" });
        setIsCreateOpen(false);
    };

    const handleEdit = () => {
        if (!selected) return;
        setVehicles(vehicles.map((v) => v.id === selected.id ? { ...v, ...formData } : v));
        setIsEditOpen(false);
    };

    const handleDelete = () => {
        if (!selected) return;
        setVehicles(vehicles.filter((v) => v.id !== selected.id));
        setIsDeleteOpen(false);
    };

    const openEdit = (vehicle: Vehicle) => {
        setSelected(vehicle);
        setFormData({ number: vehicle.number, type: vehicle.type, capacity: vehicle.capacity, driver: vehicle.driver, route: vehicle.route });
        setIsEditOpen(true);
    };

    const totalStudents = routes.reduce((a, r) => a + r.students, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div><h1 className="text-2xl font-bold">Transport Management</h1><p className="text-slate-500">Manage vehicles and routes</p></div>
                <Button size="sm" onClick={() => setIsCreateOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Vehicle</Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><Bus className="h-5 w-5 text-blue-600" /></div><div><p className="text-sm text-slate-500">Total Vehicles</p><p className="text-xl font-bold">{vehicles.length}</p></div></div></CardContent></Card>
                <Card className="border-0 shadow-sm"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-green-100 rounded-lg"><Route className="h-5 w-5 text-green-600" /></div><div><p className="text-sm text-slate-500">Active Routes</p><p className="text-xl font-bold">{routes.length}</p></div></div></CardContent></Card>
                <Card className="border-0 shadow-sm"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-purple-100 rounded-lg"><Users className="h-5 w-5 text-purple-600" /></div><div><p className="text-sm text-slate-500">Students</p><p className="text-xl font-bold">{totalStudents}</p></div></div></CardContent></Card>
                <Card className="border-0 shadow-sm"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-orange-100 rounded-lg"><MapPin className="h-5 w-5 text-orange-600" /></div><div><p className="text-sm text-slate-500">Total Stops</p><p className="text-xl font-bold">{routes.reduce((a, r) => a + r.stops, 0)}</p></div></div></CardContent></Card>
            </div>

            <Card className="border-0 shadow-sm">
                <CardContent className="p-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="Search vehicles..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div></CardContent>
            </Card>

            {/* Vehicles Table */}
            <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Bus className="h-5 w-5" />Vehicles ({filteredVehicles.length})</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Vehicle No.</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Capacity</TableHead>
                                <TableHead>Driver</TableHead>
                                <TableHead>Route</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredVehicles.map((vehicle) => (
                                <TableRow key={vehicle.id}>
                                    <TableCell className="font-medium">{vehicle.number}</TableCell>
                                    <TableCell><Badge variant="outline">{vehicle.type}</Badge></TableCell>
                                    <TableCell>{vehicle.capacity} seats</TableCell>
                                    <TableCell>{vehicle.driver}</TableCell>
                                    <TableCell>{vehicle.route}</TableCell>
                                    <TableCell><Badge variant={vehicle.status === "active" ? "default" : vehicle.status === "maintenance" ? "secondary" : "destructive"}>{vehicle.status}</Badge></TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openEdit(vehicle)}><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => { setSelected(vehicle); setIsDeleteOpen(true); }} className="text-red-600"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Routes Table */}
            <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Route className="h-5 w-5" />Routes</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Route Name</TableHead>
                                <TableHead>Start Point</TableHead>
                                <TableHead>End Point</TableHead>
                                <TableHead>Stops</TableHead>
                                <TableHead>Students</TableHead>
                                <TableHead>Vehicle</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {routes.map((route) => (
                                <TableRow key={route.id}>
                                    <TableCell className="font-medium">{route.name}</TableCell>
                                    <TableCell>{route.startPoint}</TableCell>
                                    <TableCell>{route.endPoint}</TableCell>
                                    <TableCell>{route.stops}</TableCell>
                                    <TableCell>{route.students}</TableCell>
                                    <TableCell><Badge variant="outline">{route.vehicle}</Badge></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Add Vehicle</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><label className="text-sm font-medium">Vehicle Number</label><Input value={formData.number} onChange={(e) => setFormData({ ...formData, number: e.target.value })} placeholder="TN-01-XX-0000" /></div>
                            <div className="space-y-2"><label className="text-sm font-medium">Type</label><Input value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as Vehicle["type"] })} placeholder="Bus/Van/Car" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><label className="text-sm font-medium">Capacity</label><Input type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })} /></div>
                            <div className="space-y-2"><label className="text-sm font-medium">Driver</label><Input value={formData.driver} onChange={(e) => setFormData({ ...formData, driver: e.target.value })} /></div>
                        </div>
                        <div className="space-y-2"><label className="text-sm font-medium">Route</label><Input value={formData.route} onChange={(e) => setFormData({ ...formData, route: e.target.value })} placeholder="Route A" /></div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button><Button onClick={handleCreate}>Create</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Vehicle</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><label className="text-sm font-medium">Vehicle Number</label><Input value={formData.number} onChange={(e) => setFormData({ ...formData, number: e.target.value })} /></div>
                            <div className="space-y-2"><label className="text-sm font-medium">Driver</label><Input value={formData.driver} onChange={(e) => setFormData({ ...formData, driver: e.target.value })} /></div>
                        </div>
                        <div className="space-y-2"><label className="text-sm font-medium">Route</label><Input value={formData.route} onChange={(e) => setFormData({ ...formData, route: e.target.value })} /></div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button><Button onClick={handleEdit}>Save</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete Vehicle</DialogTitle></DialogHeader>
                    <p className="py-4">Delete vehicle <strong>{selected?.number}</strong>?</p>
                    <DialogFooter><Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
