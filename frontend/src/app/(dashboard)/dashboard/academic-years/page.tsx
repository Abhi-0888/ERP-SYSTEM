"use client";

import { useState } from "react";
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
import { Calendar, Plus, MoreHorizontal, Pencil, Trash2, CheckCircle } from "lucide-react";

interface AcademicYear {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    semesters: number;
    isCurrent: boolean;
    status: "active" | "completed" | "upcoming";
}

const initialYears: AcademicYear[] = [
    { id: "1", name: "2024-25", startDate: "2024-07-01", endDate: "2025-06-30", semesters: 2, isCurrent: true, status: "active" },
    { id: "2", name: "2023-24", startDate: "2023-07-01", endDate: "2024-06-30", semesters: 2, isCurrent: false, status: "completed" },
    { id: "3", name: "2025-26", startDate: "2025-07-01", endDate: "2026-06-30", semesters: 2, isCurrent: false, status: "upcoming" },
    { id: "4", name: "2022-23", startDate: "2022-07-01", endDate: "2023-06-30", semesters: 2, isCurrent: false, status: "completed" },
];

export default function AcademicYearsPage() {
    const [years, setYears] = useState<AcademicYear[]>(initialYears);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<AcademicYear | null>(null);
    const [formData, setFormData] = useState({ name: "", startDate: "", endDate: "", semesters: 2 });

    const handleCreate = () => {
        const newYear: AcademicYear = {
            id: Date.now().toString(),
            name: formData.name,
            startDate: formData.startDate,
            endDate: formData.endDate,
            semesters: formData.semesters,
            isCurrent: false,
            status: "upcoming",
        };
        setYears([...years, newYear]);
        setFormData({ name: "", startDate: "", endDate: "", semesters: 2 });
        setIsCreateOpen(false);
    };

    const handleEdit = () => {
        if (!selected) return;
        setYears(years.map((y) => y.id === selected.id ? { ...y, ...formData } : y));
        setIsEditOpen(false);
    };

    const handleDelete = () => {
        if (!selected) return;
        setYears(years.filter((y) => y.id !== selected.id));
        setIsDeleteOpen(false);
    };

    const setAsCurrent = (year: AcademicYear) => {
        setYears(years.map((y) => ({ ...y, isCurrent: y.id === year.id, status: y.id === year.id ? "active" : y.status === "active" ? "completed" : y.status })));
    };

    const openEdit = (year: AcademicYear) => {
        setSelected(year);
        setFormData({ name: year.name, startDate: year.startDate, endDate: year.endDate, semesters: year.semesters });
        setIsEditOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div><h1 className="text-2xl font-bold">Academic Years</h1><p className="text-slate-500">Manage academic year periods</p></div>
                <Button size="sm" onClick={() => setIsCreateOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Year</Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-sm text-slate-500">Total Years</p><p className="text-2xl font-bold">{years.length}</p></CardContent></Card>
                <Card className="border-0 shadow-sm bg-green-50"><CardContent className="p-4"><p className="text-sm text-green-700">Current Year</p><p className="text-2xl font-bold text-green-800">{years.find(y => y.isCurrent)?.name || "-"}</p></CardContent></Card>
                <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-sm text-slate-500">Completed</p><p className="text-2xl font-bold">{years.filter(y => y.status === "completed").length}</p></CardContent></Card>
                <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-sm text-slate-500">Upcoming</p><p className="text-2xl font-bold">{years.filter(y => y.status === "upcoming").length}</p></CardContent></Card>
            </div>

            <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Calendar className="h-5 w-5" />All Academic Years</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Academic Year</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Semesters</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {years.sort((a, b) => b.startDate.localeCompare(a.startDate)).map((year) => (
                                <TableRow key={year.id} className={year.isCurrent ? "bg-green-50" : ""}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{year.name}</span>
                                            {year.isCurrent && <Badge variant="default">Current</Badge>}
                                        </div>
                                    </TableCell>
                                    <TableCell>{year.startDate}</TableCell>
                                    <TableCell>{year.endDate}</TableCell>
                                    <TableCell>{year.semesters}</TableCell>
                                    <TableCell><Badge variant={year.status === "active" ? "default" : year.status === "completed" ? "secondary" : "outline"}>{year.status}</Badge></TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {!year.isCurrent && <DropdownMenuItem onClick={() => setAsCurrent(year)}><CheckCircle className="h-4 w-4 mr-2" />Set as Current</DropdownMenuItem>}
                                                <DropdownMenuItem onClick={() => openEdit(year)}><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => { setSelected(year); setIsDeleteOpen(true); }} className="text-red-600"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Add Academic Year</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2"><label className="text-sm font-medium">Year Name</label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="2025-26" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><label className="text-sm font-medium">Start Date</label><Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} /></div>
                            <div className="space-y-2"><label className="text-sm font-medium">End Date</label><Input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} /></div>
                        </div>
                        <div className="space-y-2"><label className="text-sm font-medium">Semesters</label><Input type="number" min={1} max={4} value={formData.semesters} onChange={(e) => setFormData({ ...formData, semesters: parseInt(e.target.value) })} /></div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button><Button onClick={handleCreate}>Create</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Academic Year</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2"><label className="text-sm font-medium">Year Name</label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><label className="text-sm font-medium">Start Date</label><Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} /></div>
                            <div className="space-y-2"><label className="text-sm font-medium">End Date</label><Input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} /></div>
                        </div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button><Button onClick={handleEdit}>Save</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete Academic Year</DialogTitle></DialogHeader>
                    <p className="py-4">Delete academic year <strong>{selected?.name}</strong>?</p>
                    <DialogFooter><Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
