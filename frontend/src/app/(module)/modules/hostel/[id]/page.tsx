"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { HostelService } from "@/lib/services/hostel.service";
import { StudentService } from "@/lib/services/student.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BedDouble, Users, ArrowLeft, Plus, ShieldCheck, Loader2 } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { toast } from "sonner";

export default function HostelDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    
    const [hostel, setHostel] = useState<any>(null);
    const [rooms, setRooms] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isRoomOpen, setIsRoomOpen] = useState(false);
    const [isAllocateOpen, setIsAllocateOpen] = useState(false);
    
    const [selectedRoom, setSelectedRoom] = useState<any>(null);
    const [selectedStudent, setSelectedStudent] = useState<string>("");

    const [roomData, setRoomData] = useState({
        roomNumber: "",
        capacity: "3",
        floor: "1",
        roomType: "Non-AC"
    });

    const loadData = async () => {
        try {
            setLoading(true);
            const [hostelRes, roomsRes, studentsRes] = await Promise.all([
                HostelService.getHostel(params.id as string),
                HostelService.getRooms({ hostelId: params.id }),
                StudentService.getAll()
            ]);
            setHostel(hostelRes);
            setRooms(roomsRes.data || []);
            setStudents(studentsRes.data || []);
        } catch (error) {
            console.error("Failed to load hostel details:", error);
            toast.error("Failed to load hostel details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [params.id]);

    const handleCreateRoom = async () => {
        try {
            if (!roomData.roomNumber || !roomData.capacity) {
                return toast.error("Please fill required fields");
            }
            await HostelService.createRoom({
                ...roomData,
                capacity: parseInt(roomData.capacity),
                floor: parseInt(roomData.floor),
                hostelId: params.id
            });
            toast.success("Room created successfully");
            setIsRoomOpen(false);
            setRoomData({ roomNumber: "", capacity: "3", floor: "1", roomType: "Non-AC" });
            loadData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create room");
        }
    };

    const handleAllocate = async () => {
        try {
            if (!selectedRoom || !selectedStudent) {
                return toast.error("Please select a student");
            }
            await HostelService.allocateRoom({
                roomId: selectedRoom._id,
                studentId: selectedStudent
            });
            toast.success("Student allocated successfully");
            setIsAllocateOpen(false);
            setSelectedRoom(null);
            setSelectedStudent("");
            loadData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to allocate student");
        }
    };

    const handleDeallocate = async (roomId: string, studentId: string) => {
        try {
            await HostelService.deallocateRoom(roomId, studentId);
            toast.success("Student deallocated successfully");
            loadData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to deallocate student");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600 mb-4" />
                <p className="text-slate-500 font-medium">Loading details...</p>
            </div>
        );
    }

    if (!hostel) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" className="rounded-full p-2" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{hostel.name}</h1>
                    <p className="text-slate-500">Manage rooms and residents for this block.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-0 shadow-sm rounded-2xl overflow-hidden border border-slate-100">
                    <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-bold">Rooms Inventory</CardTitle>
                        <Dialog open={isRoomOpen} onOpenChange={setIsRoomOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl">
                                    <Plus className="h-4 w-4 mr-2" /> Add Room
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Add New Room</DialogTitle>
                                    <DialogDescription>
                                        Create a new room in this residence block.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="roomNumber" className="text-right font-bold">Number</Label>
                                        <Input
                                            id="roomNumber"
                                            value={roomData.roomNumber}
                                            onChange={(e) => setRoomData({ ...roomData, roomNumber: e.target.value })}
                                            className="col-span-3 rounded-xl"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="floor" className="text-right font-bold">Floor</Label>
                                        <Input
                                            id="floor"
                                            type="number"
                                            value={roomData.floor}
                                            onChange={(e) => setRoomData({ ...roomData, floor: e.target.value })}
                                            className="col-span-3 rounded-xl"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="capacity" className="text-right font-bold">Capacity</Label>
                                        <Input
                                            id="capacity"
                                            type="number"
                                            value={roomData.capacity}
                                            onChange={(e) => setRoomData({ ...roomData, capacity: e.target.value })}
                                            className="col-span-3 rounded-xl"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleCreateRoom} className="bg-orange-600 hover:bg-orange-700 rounded-xl">Save</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent className="p-0">
                        {rooms.length === 0 ? (
                            <div className="p-12">
                                <EmptyState
                                    icon={BedDouble}
                                    title="No Rooms Found"
                                    description="This block currently has no rooms. Add rooms to start allocating students."
                                    actionLabel="Add Room"
                                    onAction={() => setIsRoomOpen(true)}
                                />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/20 border-0">
                                        <TableHead className="font-bold">Room</TableHead>
                                        <TableHead className="font-bold">Floor</TableHead>
                                        <TableHead className="font-bold">Capacity</TableHead>
                                        <TableHead className="font-bold">Occupants</TableHead>
                                        <TableHead className="font-bold text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rooms.map((room) => {
                                        const isFull = room.occupants.length >= room.capacity;
                                        return (
                                            <TableRow key={room._id}>
                                                <TableCell className="font-bold text-slate-900">{room.roomNumber}</TableCell>
                                                <TableCell>{room.floor}</TableCell>
                                                <TableCell>{room.capacity}</TableCell>
                                                <TableCell>
                                                    <div className="flex -space-x-2">
                                                        {room.occupants.map((occ: any, i: number) => (
                                                            <div key={i} className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-xs font-bold text-blue-700 group relative">
                                                                {occ.user?.firstName?.charAt(0) || "U"}
                                                                <div className="absolute top-10 hidden group-hover:block bg-slate-900 text-white text-xs p-2 rounded z-10 w-max">
                                                                    {occ.user?.firstName} {occ.user?.lastName}
                                                                    <div className="mt-2 flex gap-2">
                                                                        <Button size="sm" variant="destructive" className="h-6 text-[10px]" onClick={() => handleDeallocate(room._id, occ._id)}>
                                                                            Remove
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {[...Array(room.capacity - room.occupants.length)].map((_, i) => (
                                                            <div key={`empty-${i}`} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white border-dashed" />
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {!isFull ? (
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline" 
                                                            className="rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50"
                                                            onClick={() => {
                                                                setSelectedRoom(room);
                                                                setIsAllocateOpen(true);
                                                            }}
                                                        >
                                                            Allocate
                                                        </Button>
                                                    ) : (
                                                        <Badge variant="secondary" className="rounded-xl bg-slate-100 text-slate-500">Full</Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm rounded-2xl border border-slate-100 h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Block Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">Type</p>
                                <p className="font-medium">{hostel.type}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">Status</p>
                                <Badge className="mt-1 bg-emerald-50 text-emerald-700 border-emerald-100">Active</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isAllocateOpen} onOpenChange={setIsAllocateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Allocate Student to {selectedRoom?.roomNumber}</DialogTitle>
                        <DialogDescription>
                            Select a student to allocate to this room. Only unallocated students should be chosen.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label className="mb-2 block font-bold">Select Student</Label>
                        <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                            <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder="Select student..." />
                            </SelectTrigger>
                            <SelectContent>
                                {students.map(student => (
                                    <SelectItem key={student._id} value={student._id}>
                                        {student.enrollmentNumber} - {student.user?.firstName} {student.user?.lastName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAllocateOpen(false)} className="rounded-xl">Cancel</Button>
                        <Button onClick={handleAllocate} className="bg-blue-600 hover:bg-blue-700 rounded-xl text-white">Allocate</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
