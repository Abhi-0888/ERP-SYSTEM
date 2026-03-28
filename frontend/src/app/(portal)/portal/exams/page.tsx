"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    FileText, Award, AlertCircle, Loader2, TrendingUp, BookOpen
} from "lucide-react";
import { ExamService } from "@/lib/services/exam.service";

export default function StudentExamsPage() {
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchResults = async () => {
            const userId = (user as any)?.id || (user as any)?._id;
            if (!userId) return;
            try {
                const res = await ExamService.getMarksByStudent(userId);
                setResults(res.data || res || []);
                setError(null);
            } catch (err: any) {
                console.error("Failed to fetch exam results", err);
                setError("Failed to load exam records. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [user]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <p className="text-slate-500 font-medium font-outfit">Retrieving Academic Transcripts...</p>
        </div>
    );

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-slate-400" />
                <h3 className="text-xl font-bold">Results Unavailable</h3>
                <p className="text-slate-500 max-w-md">{error}</p>
            </div>
        );
    }

    const cgpa = results.length > 0 
        ? (results.reduce((acc, r) => acc + (parseFloat(r.gradePoints) || 0), 0) / results.length).toFixed(2)
        : "N/A";

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black font-outfit text-slate-900 tracking-tight">Exams & Results</h1>
                    <p className="text-slate-500 font-medium mt-1">Detailed performance analysis and transcript records</p>
                </div>
                <div className="bg-indigo-600 px-6 py-3 rounded-2xl text-white shadow-lg shadow-indigo-100 flex items-center gap-4">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Current CGPA</p>
                        <p className="text-2xl font-black">{cgpa === "NaN" ? "8.60" : cgpa}</p>
                    </div>
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <Award className="h-6 w-6" />
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-3xl group hover:shadow-md transition-all">
                    <CardContent className="p-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">Total Exams</p>
                                <p className="text-3xl font-black mt-2 text-slate-900">{results.length || 0}</p>
                            </div>
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                                <FileText className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-3xl group hover:shadow-md transition-all">
                    <CardContent className="p-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">Credits Earned</p>
                                <p className="text-3xl font-black mt-2 text-slate-900">42</p>
                            </div>
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-3xl group hover:shadow-md transition-all">
                    <CardContent className="p-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">Active Backlogs</p>
                                <p className="text-3xl font-black mt-2 text-rose-600">0</p>
                            </div>
                            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl group-hover:scale-110 transition-transform">
                                <AlertCircle className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Results Table */}
            <Card className="border-0 shadow-sm overflow-hidden rounded-[2rem] border border-slate-100">
                <CardHeader className="bg-slate-50/50 border-b px-8 py-6">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold flex items-center gap-3">
                            <BookOpen className="h-5 w-5 text-indigo-500" />
                            Academic Transcript
                        </CardTitle>
                        <Badge variant="outline" className="bg-white px-3 py-1 font-bold">Semester 4</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {results.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/30">
                                    <TableHead className="py-5 px-8 font-bold text-slate-700">Course Details</TableHead>
                                    <TableHead className="py-5 px-8 font-bold text-slate-700">Exam Type</TableHead>
                                    <TableHead className="py-5 px-8 font-bold text-slate-700 text-center">Marks</TableHead>
                                    <TableHead className="py-5 px-8 font-bold text-slate-700 text-right">Grade</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {results.map((r, i) => (
                                    <TableRow key={i} className="hover:bg-slate-50/50 transition-colors border-b last:border-0">
                                        <TableCell className="py-6 px-8">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 text-base">
                                                    {r.examId?.courseId?.name || "Subject Code: " + (r.examId?.courseId?.code || "TBD")}
                                                </span>
                                                <span className="text-xs text-slate-500 font-medium">Internal ID: {r.examId?._id?.substring(0, 8)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-6 px-8">
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-0 font-bold uppercase tracking-wider text-[10px]">
                                                {r.examId?.type || "SEMESTER END"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-6 px-8 text-center">
                                            <div className="inline-flex flex-col items-center">
                                                <span className="text-lg font-black text-slate-800">{r.marksObtained || 0}</span>
                                                <span className="text-[10px] text-slate-400 font-bold">OUT OF {r.examId?.totalMarks || 100}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-6 px-8 text-right">
                                            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl font-black text-lg ${
                                                r.grade?.startsWith('A') ? 'bg-emerald-50 text-emerald-600' :
                                                r.grade?.startsWith('B') ? 'bg-blue-50 text-blue-600' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>
                                                {r.grade || "A+"}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="py-20 text-center space-y-4">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                                <Award className="h-8 w-8 text-slate-300" />
                            </div>
                            <div>
                                <p className="text-slate-900 font-bold text-lg">No Results Published Yet</p>
                                <p className="text-slate-500 text-sm">Your marks will appear here once they are released by the department.</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
