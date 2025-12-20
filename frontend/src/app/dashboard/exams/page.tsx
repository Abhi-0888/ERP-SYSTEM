"use client";

import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    FileText, Plus, Calendar, TrendingUp, Award, Download
} from "lucide-react";

const mockExams = [
    { id: "1", name: "Mid Semester - Data Structures", course: "CS201", type: "mid", date: "2024-12-15", time: "9:00 AM", room: "Hall A", maxMarks: 50 },
    { id: "2", name: "Internal Assessment 2 - DBMS", course: "CS301", type: "internal", date: "2024-12-10", time: "2:00 PM", room: "LH-302", maxMarks: 20 },
    { id: "3", name: "Lab Exam - Web Development", course: "CS401", type: "lab", date: "2024-12-18", time: "10:00 AM", room: "Lab-201", maxMarks: 50 },
];

const mockResults = [
    { course: "Data Structures", code: "CS201", type: "Internal 1", maxMarks: 20, obtained: 18, grade: "A" },
    { course: "Database Systems", code: "CS301", type: "Internal 1", maxMarks: 20, obtained: 16, grade: "B+" },
    { course: "Computer Networks", code: "CS401", type: "Mid Sem", maxMarks: 50, obtained: 42, grade: "A" },
    { course: "Web Development", code: "CS501", type: "Lab", maxMarks: 50, obtained: 45, grade: "A+" },
];

// Faculty/Admin View
function FacultyExamsView() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Examinations</h1>
                    <p className="text-slate-500">Schedule exams and manage marks entry</p>
                </div>
                <Button><Plus className="h-4 w-4 mr-2" />Schedule Exam</Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Upcoming</p>
                            <p className="text-xl font-bold">{mockExams.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Marks Pending</p>
                            <p className="text-xl font-bold">2</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Award className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Avg Score</p>
                            <p className="text-xl font-bold">72%</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Calendar className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">This Month</p>
                            <p className="text-xl font-bold">5</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Exams Table */}
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Upcoming Examinations</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Exam</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Date & Time</TableHead>
                                <TableHead>Room</TableHead>
                                <TableHead>Max Marks</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockExams.map((exam) => (
                                <TableRow key={exam.id}>
                                    <TableCell className="font-medium">{exam.name}</TableCell>
                                    <TableCell>{exam.course}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{exam.type}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p>{exam.date}</p>
                                            <p className="text-xs text-slate-500">{exam.time}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>{exam.room}</TableCell>
                                    <TableCell>{exam.maxMarks}</TableCell>
                                    <TableCell>
                                        <Button size="sm" variant="outline">Enter Marks</Button>
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
function StudentExamsView() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Exams & Results</h1>
                <p className="text-slate-500">View exam schedule and your results</p>
            </div>

            {/* Upcoming Exams */}
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Upcoming Exams
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {mockExams.map((exam) => (
                            <div key={exam.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                                <div>
                                    <p className="font-medium">{exam.name}</p>
                                    <p className="text-sm text-slate-500">{exam.course} • {exam.room}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">{exam.date}</p>
                                    <p className="text-sm text-slate-500">{exam.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Results */}
            <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        My Results
                    </CardTitle>
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />Download
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Course</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Max Marks</TableHead>
                                <TableHead>Obtained</TableHead>
                                <TableHead>Grade</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockResults.map((result, i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{result.course}</p>
                                            <p className="text-xs text-slate-500">{result.code}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell><Badge variant="outline">{result.type}</Badge></TableCell>
                                    <TableCell>{result.maxMarks}</TableCell>
                                    <TableCell className="font-medium">{result.obtained}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            result.grade.startsWith("A") ? "default" :
                                                result.grade.startsWith("B") ? "secondary" : "outline"
                                        }>
                                            {result.grade}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Summary */}
            <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-500 to-blue-600 text-white">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-lg font-medium">Current CGPA</p>
                            <p className="text-4xl font-bold mt-1">8.42</p>
                        </div>
                        <div className="text-right">
                            <p className="text-white/80">Semester GPA: 8.65</p>
                            <p className="text-white/80">Credits Earned: 124/160</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function ExamsPage() {
    const { activeRole } = useAuth();

    if (activeRole === "FACULTY" || activeRole === "HOD" || activeRole === "UNIVERSITY_ADMIN") {
        return <FacultyExamsView />;
    }

    return <StudentExamsView />;
}
