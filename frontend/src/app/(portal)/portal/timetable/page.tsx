"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Calendar, Clock, BookOpen, User, MapPin, Loader2, AlertCircle
} from "lucide-react";
import axios from "@/lib/api";

export default function StudentTimetablePage() {
    const [timetable, setTimetable] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchTimetable = async () => {
            const userId = (user as any)?.id || (user as any)?._id;
            if (!userId) return;
            try {
                const res = await axios.get(`/timetable/student/${userId}`);
                setTimetable(res.data);
                setError(null);
            } catch (err: any) {
                if (err.response?.status === 404) {
                    console.info("No published timetable found for student yet.");
                    setError("No published timetable found for your program and semester.");
                } else {
                    console.error("Failed to fetch timetable", err);
                    setError("Failed to load timetable. Please try again later.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchTimetable();
    }, [user]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            <p className="text-slate-500 font-medium">Loading Your Schedule...</p>
        </div>
    );

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-slate-400" />
                <h3 className="text-xl font-bold">Timetable Unavailable</h3>
                <p className="text-slate-500 max-w-md">{error}</p>
            </div>
        );
    }

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl font-bold font-outfit text-slate-900">Weekly Timetable</h1>
                <p className="text-slate-500">
                    {timetable?.programId?.name} - Semester {timetable?.semester} ({timetable?.academicYearId?.year})
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {days.map((day) => {
                    const slots = timetable?.slots?.filter((s: any) => (s.day || s.dayOfWeek)?.toLowerCase() === day.toLowerCase()) || [];
                    if (slots.length === 0) return null;

                    return (
                        <Card key={day} className="border-0 shadow-sm overflow-hidden">
                            <CardHeader className="bg-slate-50 border-b py-3 px-6">
                                <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-700 uppercase tracking-wider">
                                    <Calendar className="h-4 w-4 text-blue-500" />
                                    {day}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableBody>
                                        {slots.sort((a: any, b: any) => a.startTime.localeCompare(b.startTime)).map((slot: any, idx: number) => (
                                            <TableRow key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                <TableCell className="w-48 py-4 px-6 border-r bg-slate-50/30">
                                                    <div className="flex items-center gap-2 font-bold text-slate-700">
                                                        <Clock className="h-4 w-4 text-slate-400" />
                                                        {slot.startTime} - {slot.endTime}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 px-6">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <BookOpen className="h-4 w-4 text-blue-500" />
                                                            <span className="font-bold text-slate-900">{slot.courseId?.name || 'Class Session'}</span>
                                                            <Badge variant="outline" className="ml-2">{slot.type}</Badge>
                                                        </div>
                                                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                                            <div className="flex items-center gap-1">
                                                                <User className="h-3 w-3" />
                                                                {slot.facultyId?.username || 'TBD'}
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <MapPin className="h-3 w-3" />
                                                                {slot.classroom || 'LHB-101'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {(!timetable || !timetable.slots || timetable.slots.length === 0) && (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed text-slate-400">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No slots scheduled for this timetable yet.</p>
                </div>
            )}
        </div>
    );
}
