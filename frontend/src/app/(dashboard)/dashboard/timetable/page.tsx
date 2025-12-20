"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, BookOpen, Loader2 } from "lucide-react";
import { TimetableService } from "@/lib/services/timetable.service";
import { toast } from "sonner";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TimetablePage() {
    const { user } = useAuth();
    const [timetable, setTimetable] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

    useEffect(() => {
        async function loadTimetable() {
            try {
                setLoading(true);
                // For now, fetch all timetables and take the first one
                // In real scenario, filter by student's section/program
                const res = await TimetableService.getAllTimetables();
                if (res.data && res.data.length > 0) {
                    setTimetable(res.data[0]);
                }
            } catch (error) {
                console.error("Failed to load timetable:", error);
                toast.error("Failed to load timetable");
            } finally {
                setLoading(false);
            }
        }
        loadTimetable();
    }, []);

    const getSlotsForDay = (day: string) => {
        if (!timetable || !timetable.slots) return [];
        return timetable.slots.filter((s: any) => s.day === day).sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Timetable</h1>
                <p className="text-slate-500">Your weekly class schedule - {timetable?.name || "Academic Schedule"}</p>
            </div>

            {/* Today's Classes */}
            <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Calendar className="h-6 w-6" />
                        <h2 className="text-lg font-semibold">Today - {today}</h2>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {getSlotsForDay(today).length > 0 ? getSlotsForDay(today).map((slot: any, i: number) => (
                            <div key={i} className="flex-shrink-0 bg-white/20 backdrop-blur rounded-lg p-3 min-w-[200px]">
                                <p className="text-sm font-medium">{slot.startTime} - {slot.endTime}</p>
                                <p className="font-semibold mt-1">{slot.subject || "Class"}</p>
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
