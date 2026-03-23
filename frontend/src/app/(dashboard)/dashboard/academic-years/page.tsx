"use client";

import { useState, useEffect } from "react";
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
import { Calendar, Plus, MoreHorizontal, Pencil, Trash2, CheckCircle, Loader2 } from "lucide-react";
import { AcademicService } from "@/lib/services/academic.service";
import { toast } from "sonner";

interface AcademicYear {
    _id: string;
    year: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    status: string;
}

export default function AcademicYearsPage() {
    const [years, setYears] = useState<AcademicYear[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<AcademicYear | null>(null);
    const [formData, setFormData] = useState({ year: "", startDate: "", endDate: "" });

    const fetchYears = async () => {
        setLoading(true);
        try {
            const res = await AcademicService.getAcademicYears();
            setYears(res.data || []);
        } catch (error) {
            console.error("Failed to fetch academic years", error);
            toast.error("Failed to load academic years");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchYears();
    }, []);

    const handleCreate = async () => {
        try {
            await AcademicService.createAcademicYear(formData);
            toast.success("Academic year created");
            setIsCreateOpen(false);
            setFormData({ year: "", startDate: "", endDate: "" });
            fetchYears();
        } catch (error) {
            toast.error("Failed to create academic year");
        }
    };

    const handleEdit = async () => {
        if (!selected) return;
        try {
            await AcademicService.updateAcademicYear(selected._id, formData);
            toast.success("Academic year updated");
            setIsEditOpen(false);
            fetchYears();
        } catch (error) {
            toast.error("Failed to update academic year");
        }
    };

    const handleDelete = async () => {
        if (!selected) return;
        try {
            await AcademicService.deleteAcademicYear(selected._id);
            toast.success("Academic year deleted");
            setIsDeleteOpen(false);
            fetchYears();
        } catch (error) {
            toast.error("Failed to delete academic year");
        }
    };

    const setAsCurrent = async (year: AcademicYear) => {
        try {
            await AcademicService.updateAcademicYear(year._id, { isActive: true });
            toast.success(`${year.year} set as active year`);
            fetchYears();
        } catch (error) {
            toast.error("Failed to set active year");
        }
    };

    const openEdit = (year: AcademicYear) => {
        setSelected(year);
        setFormData({ year: year.year, startDate: year.startDate.split('T')[0], endDate: year.endDate.split('T')[0] });
        setIsEditOpen(true);
    };

    if (loading) return <div className="flex items-center justify-center h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div><h1 className="text-2xl font-bold">Academic Years</h1><p className="text-slate-500">Manage academic year periods</p></div>
                <Button size="sm" onClick={() => setIsCreateOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Year</Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-sm text-slate-500">Total Years</p><p className="text-2xl font-bold">{years.length}</p></CardContent></Card>
                <Card className="border-0 shadow-sm bg-green-50"><CardContent className="p-4"><p className="text-sm text-green-700">Current Year</p><p className="text-2xl font-bold text-green-800">{years.find(y => y.isActive)?.year || "-"}</p></CardContent></Card>
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
                                <TableHead>Status</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {years.map((year) => (
                                <TableRow key={year._id} className={year.isActive ? "bg-green-50" : ""}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{year.year}</span>
                                            {year.isActive && <Badge variant="default">Current</Badge>}
                                        </div>
                                    </TableCell>
                                    <TableCell>{new Date(year.startDate).toLocaleDateString()}</TableCell>
                                    <TableCell>{new Date(year.endDate).toLocaleDateString()}</TableCell>
                                    <TableCell><Badge variant={year.isActive ? "default" : "outline"}>{year.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {!year.isActive && <DropdownMenuItem onClick={() => setAsCurrent(year)}><CheckCircle className="h-4 w-4 mr-2" />Set as Current</DropdownMenuItem>}
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
                        <div className="space-y-2"><label className="text-sm font-medium">Year Name</label><Input value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} placeholder="2025-26" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><label className="text-sm font-medium">Start Date</label><Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} /></div>
                            <div className="space-y-2"><label className="text-sm font-medium">End Date</label><Input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} /></div>
                        </div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button><Button onClick={handleCreate}>Create</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Academic Year</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2"><label className="text-sm font-medium">Year Name</label><Input value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} /></div>
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
                    <p className="py-4">Delete academic year <strong>{selected?.year}</strong>?</p>
                    <DialogFooter><Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
