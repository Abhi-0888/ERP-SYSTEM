"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, BookOpen, Loader2 } from "lucide-react";
import { TimetableService } from "@/lib/services/timetable.service";
import { toast } from "sonner";
import { Timetable } from "@/lib/types";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TimetablePage() {
    const { user, activeRole } = useAuth();
    const [timetable, setTimetable] = useState<Timetable | null>(null);
    const [loading, setLoading] = useState(true);
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

    const loadTimetable = useCallback(async () => {
        if (!user?._id) return;
        try {
            setLoading(true);
            // Fetch student-specific timetable
            const res = await TimetableService.getTimetableForStudent(user._id);
            setTimetable(res);
        } catch (error: any) {
            console.error("Failed to load timetable:", error);
            // If student view fails, try fetching general one if admin/faculty
            if (activeRole !== 'STUDENT') {
                try {
                    const res = await TimetableService.getAllTimetables();
                    if (res.data && res.data.length > 0) {
                        setTimetable(res.data[0]);
                    }
                } catch (e) {
                    toast.error("Failed to load any academic schedule");
                }
            } else {
                toast.error(error.response?.data?.message || "No timetable found for your profile");
            }
        } finally {
            setLoading(false);
        }
    }, [user?._id, activeRole]);

    useEffect(() => {
        loadTimetable();
    }, [loadTimetable]);

    const getSlotsForDay = (day: string) => {
        if (!timetable || !timetable.slots) return [];
        return timetable.slots.filter((s) => s.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Timetable</h1>
                <p className="text-slate-500">Your weekly class schedule</p>
            </div>

            {/* Today's Classes */}
            <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Calendar className="h-6 w-6" />
                        <h2 className="text-lg font-semibold">Today - {today}</h2>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {getSlotsForDay(today).length > 0 ? getSlotsForDay(today).map((slot, i) => (
                            <div key={i} className="flex-shrink-0 bg-white/20 backdrop-blur rounded-lg p-3 min-w-[200px]">
                                <p className="text-sm font-medium">{slot.startTime} - {slot.endTime}</p>
                                <p className="font-semibold mt-1">{typeof slot.courseId === 'object' ? slot.courseId.name : "Class"}</p>
                                <p className="text-sm text-white/80">{slot.room}</p>
                            </div>
                        )) : (
                            <p className="text-white/80">No classes scheduled for today.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Weekly Timetable */}
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Weekly Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {days.map((day) => {
                            const slots = getSlotsForDay(day);
                            if (slots.length === 0) return null;

                            return (
                                <div key={day}>
                                    <h3 className={`font-semibold mb-3 ${day === today ? "text-blue-600" : ""}`}>
                                        {day} {day === today && <Badge className="ml-2">Today</Badge>}
                                    </h3>
                                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                        {slots.map((slot: any, i: number) => (
                                            <div
                                                key={i}
                                                className={`p-4 rounded-lg border-l-4 bg-slate-50 border-blue-400`}
                                            >
                                                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                                                    <Clock className="h-4 w-4" />
                                                    {slot.startTime} - {slot.endTime}
                                                </div>
                                                <p className="font-semibold">{slot.subject || "Course"}</p>
                                                <p className="text-sm text-slate-600">{slot.type || "Lecture"}</p>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />{slot.room}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <BookOpen className="h-3 w-3" />{slot.facultyId?.username || "Faculty"}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
