"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    FileText, Plus, Calendar, TrendingUp, Award, Download, RefreshCw, Clock
} from "lucide-react";
import { ExamService } from "@/lib/services/exam.service";
import { toast } from "sonner";
import { Exam, MarkSheet } from "@/lib/types";

// Faculty/Admin View
function FacultyExamsView() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchExams = async () => {
        setLoading(true);
        try {
            const data = await ExamService.getExams();
            setExams(Array.isArray(data.exams) ? data.exams : []);
        } catch (error) {
            console.error("Failed to fetch exams", error);
            toast.error("Failed to load examinations");
            setExams([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();
    }, []);

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
                            <p className="text-xl font-bold">{exams.filter(e => e.status === 'scheduled').length}</p>
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
                            <p className="text-xl font-bold">{exams.filter(e => e.status === 'completed').length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Award className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total Exams</p>
                            <p className="text-xl font-bold">{exams.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Calendar className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Conducted</p>
                            <p className="text-xl font-bold">{exams.filter(e => e.status === 'published').length}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Exams Table */}
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Examination Records</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Exam</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Date & Time</TableHead>
                                <TableHead>Venue</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-20">
                                        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-slate-400" />
                                    </TableCell>
                                </TableRow>
                            ) : exams.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-20 text-slate-400">No examination records found.</TableCell>
                                </TableRow>
                            ) : exams.map((exam) => (
                                <TableRow key={exam._id || exam.id}>
                                    <TableCell className="font-medium">{exam.name}</TableCell>
                                    <TableCell>{exam.courseId?.name || 'N/A'}</TableCell>
                                    <TableCell className="capitalize">{exam.type}</TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <p className="font-medium">{new Date(exam.date).toLocaleDateString()}</p>
                                            <p className="text-slate-500 text-xs">{exam.startTime}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>{exam.room}</TableCell>
                                    <TableCell>
                                        <Badge variant={exam.status === 'scheduled' ? 'default' : exam.status === 'completed' ? 'secondary' : 'outline'}>
                                            {exam.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm">Manage</Button>
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
    const { user } = useAuth();
    const [results, setResults] = useState<MarkSheet[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            const studentId = user?._id;
            if (!studentId) return;
            try {
                const data = await ExamService.getMarksByStudent(studentId);
                setResults(data.data || []);
            } catch (error) {
                console.error("Failed to fetch results", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [user?._id]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">My Examinations</h1>
                    <p className="text-slate-500">View upcoming exams and academic performance</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Recent Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Course</TableHead>
                                        <TableHead>Exam Type</TableHead>
                                        <TableHead>Marks</TableHead>
                                        <TableHead>Grade</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-10">Loading results...</TableCell>
                                        </TableRow>
                                    ) : results.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-10 text-slate-400">No examination results available.</TableCell>
                                        </TableRow>
                                    ) : results.map((result, i) => (
                                        <TableRow key={i}>
                                            <TableCell>
                                                <div className="font-medium">{result.examId?.courseId?.name || 'Course'}</div>
                                                <div className="text-xs text-slate-500">{result.examId?.name}</div>
                                            </TableCell>
                                            <TableCell className="capitalize">{result.examId?.type}</TableCell>
                                            <TableCell>
                                                <span className="font-bold">{result.marksObtained}</span>
                                                <span className="text-slate-400"> / {result.examId?.maxMarks}</span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={result.grade.startsWith('A') ? 'bg-green-500' : 'bg-blue-500'}>
                                                    {result.grade}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-0 shadow-sm bg-indigo-600 text-white">
                        <CardContent className="p-6">
                            <Award className="h-10 w-10 mb-4 text-indigo-200" />
                            <h3 className="text-xl font-bold">Academic Status</h3>
                            <p className="text-indigo-100 text-sm mt-2">Overall CGPA: 8.42</p>
                            <div className="mt-6 pt-6 border-t border-indigo-500/50">
                                <Button className="w-full bg-white text-indigo-600 hover:bg-indigo-50">
                                    <Download className="h-4 w-4 mr-2" /> Download Grade Card
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-sm uppercase tracking-wider text-slate-400">Exam Instructions</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-4">
                            <div className="flex gap-3">
                                <Calendar className="h-4 w-4 text-slate-400 mt-1" />
                                <p>Carry physical Hall Ticket and ID card for all exams.</p>
                            </div>
                            <div className="flex gap-3">
                                <Clock className="h-4 w-4 text-slate-400 mt-1" />
                                <p>Reporting time is 30 minutes prior to exam start.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function ExamsPage() {
    const { activeRole } = useAuth();
    const isInstitutional = ["SUPER_ADMIN", "UNIVERSITY_ADMIN", "REGISTRAR", "EXAM_CONTROLLER", "HOD", "FACULTY"].includes(activeRole || "");

    if (isInstitutional) {
        return <FacultyExamsView />;
    }

    return <StudentExamsView />;
}
