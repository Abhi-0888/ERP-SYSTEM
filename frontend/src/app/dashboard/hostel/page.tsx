"use client";

import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Home, Building, DoorOpen, Users, Plus, BedDouble
} from "lucide-react";

const mockHostels = [
    { id: "1", name: "Boys Hostel Block A", type: "boys", rooms: 100, occupied: 85, warden: "Mr. Ramesh Gupta" },
    { id: "2", name: "Boys Hostel Block B", type: "boys", rooms: 80, occupied: 72, warden: "Mr. Sunil Kumar" },
    { id: "3", name: "Girls Hostel Block A", type: "girls", rooms: 120, occupied: 110, warden: "Mrs. Lakshmi Iyer" },
];

const mockRooms = [
    { id: "1", number: "A-101", floor: 1, capacity: 3, occupied: 3, type: "triple", rent: 5000 },
    { id: "2", number: "A-102", floor: 1, capacity: 3, occupied: 2, type: "triple", rent: 5000 },
    { id: "3", number: "A-103", floor: 1, capacity: 2, occupied: 2, type: "double", rent: 6000 },
    { id: "4", number: "A-104", floor: 1, capacity: 1, occupied: 0, type: "single", rent: 8000 },
];

// Warden View
function WardenView() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Hostel Management</h1>
                    <p className="text-slate-500">Manage hostels, rooms, and allocations</p>
                </div>
                <Button><Plus className="h-4 w-4 mr-2" />Add Room</Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Building className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Hostels</p>
                            <p className="text-xl font-bold">{mockHostels.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <DoorOpen className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total Rooms</p>
                            <p className="text-xl font-bold">{mockHostels.reduce((a, h) => a + h.rooms, 0)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Users className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Occupancy</p>
                            <p className="text-xl font-bold">89%</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <BedDouble className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Available Beds</p>
                            <p className="text-xl font-bold">33</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Hostels */}
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Hostels</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Hostel</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Rooms</TableHead>
                                <TableHead>Occupied</TableHead>
                                <TableHead>Warden</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockHostels.map((hostel) => (
                                <TableRow key={hostel.id}>
                                    <TableCell className="font-medium">{hostel.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={hostel.type === "boys" ? "default" : "secondary"}>
                                            {hostel.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{hostel.rooms}</TableCell>
                                    <TableCell>{hostel.occupied}</TableCell>
                                    <TableCell>{hostel.warden}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Rooms */}
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Rooms - Block A</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Room No</TableHead>
                                <TableHead>Floor</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Capacity</TableHead>
                                <TableHead>Occupied</TableHead>
                                <TableHead>Rent/Month</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockRooms.map((room) => (
                                <TableRow key={room.id}>
                                    <TableCell className="font-mono">{room.number}</TableCell>
                                    <TableCell>{room.floor}</TableCell>
                                    <TableCell><Badge variant="outline">{room.type}</Badge></TableCell>
                                    <TableCell>{room.capacity}</TableCell>
                                    <TableCell>
                                        <span className={room.occupied < room.capacity ? "text-green-600" : "text-slate-500"}>
                                            {room.occupied}/{room.capacity}
                                        </span>
                                    </TableCell>
                                    <TableCell>₹{room.rent.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Button size="sm" variant="outline" disabled={room.occupied >= room.capacity}>
                                            Allocate
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

// Student View
function StudentView() {
    const hasRoom = true;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">My Hostel</h1>
                <p className="text-slate-500">View your room details and hostel information</p>
            </div>

            {hasRoom ? (
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Home className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="flex-1 space-y-4">
                                <div>
                                    <h2 className="text-xl font-semibold">Boys Hostel Block A</h2>
                                    <p className="text-slate-500">Room A-102, Floor 1</p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <p className="text-sm text-slate-500">Room Type</p>
                                        <p className="font-medium">Triple Sharing</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <p className="text-sm text-slate-500">Bed Number</p>
                                        <p className="font-medium">2</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <p className="text-sm text-slate-500">Rent/Month</p>
                                        <p className="font-medium">₹5,000</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <p className="text-sm text-slate-500">Allocated Since</p>
                                        <p className="font-medium">Aug 2024</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <h3 className="font-medium mb-2">Roommates</h3>
                                    <div className="flex gap-3">
                                        <Badge variant="secondary">Amit Kumar</Badge>
                                        <Badge variant="secondary">Vikram Singh</Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-8 text-center">
                        <Home className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No Room Allocated</h3>
                        <p className="text-slate-500">You don&apos;t have a hostel room allocated yet.</p>
                        <Button className="mt-4">Apply for Hostel</Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default function HostelPage() {
    const { activeRole } = useAuth();

    if (activeRole === "HOSTEL_WARDEN" || activeRole === "UNIVERSITY_ADMIN") {
        return <WardenView />;
    }

    return <StudentView />;
}
