"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { StudentService, Student } from "@/lib/services/student.service";
import { AttendanceService } from "@/lib/services/attendance.service";
import { FeeService } from "@/lib/services/fee.service";
import { ExamService } from "@/lib/services/exam.service";
import { LibraryService } from "@/lib/services/library.service";
import { HostelService } from "@/lib/services/hostel.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    GraduationCap, Calendar, Receipt, BookOpen, Home,
    ArrowLeft, Loader2, User as UserIcon, Mail, Phone,
    MapPin, Download, BrainCircuit
} from "lucide-react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

export default function StudentProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const [student, setStudent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [extraData, setExtraData] = useState<any>({
        attendance: null,
        fees: null,
        exams: null,
        library: null,
        hostel: null
    });

    useEffect(() => {
        const fetchAllData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                // Fetch primary student data first
                const studentRes = await StudentService.getById(id as string);
                setStudent(studentRes);

                // Fetch extra data as non-blocking
                const [attRes, feeRes, examRes, libRes] = await Promise.allSettled([
                    AttendanceService.getReport(id as string),
                    FeeService.getStudentFeeStatus(id as string),
                    ExamService.getStudentResults(id as string),
                    LibraryService.getIssuedBooks(id as string)
                ]);

                setExtraData({
                    attendance: attRes.status === 'fulfilled' ? attRes.value : null,
                    fees: feeRes.status === 'fulfilled' ? feeRes.value : null,
                    exams: examRes.status === 'fulfilled' ? examRes.value : null,
                    library: libRes.status === 'fulfilled' ? libRes.value : null,
                    hostel: null
                });
            } catch (error) {
                console.error("Failed to fetch primary student data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [id]);

    if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
    if (!student) return <div className="p-8 text-center text-red-500">Student not found</div>;

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />Back to List
                </Button>
            </div>

            {/* Header / Basic Info */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="lg:col-span-1 border-0 shadow-sm bg-gradient-to-b from-blue-50 to-white">
                    <CardContent className="pt-8 pb-6 text-center">
                        <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                            <UserIcon className="h-12 w-12 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold">{student.firstName} {student.lastName}</h2>
                        <p className="text-sm text-slate-500 mb-2">{student.enrollmentNo || student.registrationNumber}</p>
                        <Badge>{student.status}</Badge>

                        <div className="mt-6 space-y-3 text-left">
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Mail className="h-4 w-4 min-w-[16px]" />
                                <span className="truncate">{student.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Phone className="h-4 w-4 min-w-[16px]" />
                                <span>{student.phoneNumber || 'Not provided'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <GraduationCap className="h-4 w-4 min-w-[16px]" />
                                <span>{student.programId?.name}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <MapPin className="h-4 w-4 min-w-[16px]" />
                                <span>{student.personalInfo?.address || 'N/A'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="lg:col-span-3 space-y-6">
                    <Tabs defaultValue="overview">
                        <TabsList className="bg-slate-100 p-1">
                            <TabsTrigger value="overview">Overview & AI</TabsTrigger>
                            <TabsTrigger value="academic">Academic Results</TabsTrigger>
                            <TabsTrigger value="attendance">Attendance</TabsTrigger>
                            <TabsTrigger value="finance">Fees & Fines</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="mt-4 space-y-6">
                            {/* AI Insights Card */}
                            <Card className="border-0 shadow-sm border-l-4 border-l-purple-500 bg-purple-50/30">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-md flex items-center gap-2 text-purple-700">
                                        <BrainCircuit className="h-5 w-5" />
                                        AI Student Insights
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-700 leading-relaxed">
                                        {student.firstName} is performing <strong>Excellently</strong> in Academic results with a consistent GPA.
                                        Attendance is currently at <strong>{(extraData.attendance?.overallPercentage || 0).toFixed(1)}%</strong>, which is above average.
                                        However, there is a pending Fee of <strong>₹{(extraData.fees?.summary?.total - extraData.fees?.summary?.paid || 0).toLocaleString()}</strong>.
                                        Recommendation: Encourage participation in extra-curricular activities to maintain a balanced profile.
                                    </p>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="border-0 shadow-sm">
                                    <CardHeader><CardTitle className="text-sm font-medium">Academic Progression</CardTitle></CardHeader>
                                    <CardContent className="h-[250px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={[
                                                { sem: 'Sem 1', gpa: 8.2 },
                                                { sem: 'Sem 2', gpa: 8.5 },
                                                { sem: 'Sem 3', gpa: 8.4 },
                                                { sem: 'Sem 4', gpa: 8.9 },
                                            ]}>
                                                <XAxis dataKey="sem" />
                                                <YAxis domain={[0, 10]} />
                                                <Tooltip />
                                                <Area type="monotone" dataKey="gpa" stroke="#3b82f6" fill="#bfdbfe" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-sm">
                                    <CardHeader><CardTitle className="text-sm font-medium">Attendance Distribution</CardTitle></CardHeader>
                                    <CardContent className="h-[250px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={[
                                                        { name: 'Present', value: extraData.attendance?.summary?.PRESENT || 0 },
                                                        { name: 'Absent', value: extraData.attendance?.summary?.ABSENT || 0 },
                                                        { name: 'Late', value: extraData.attendance?.summary?.LATE || 0 },
                                                    ]}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {COLORS.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="academic" className="mt-4">
                            <Card className="border-0 shadow-sm">
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                                <GraduationCap className="h-5 w-5 text-blue-600" />
                                                Exam Performance
                                            </h3>
                                            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />E-Marksheet</Button>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="border-b bg-slate-50">
                                                    <tr>
                                                        <th className="text-left p-3 font-medium">Course</th>
                                                        <th className="text-left p-3 font-medium">Exam Type</th>
                                                        <th className="text-left p-3 font-medium">Marks</th>
                                                        <th className="text-left p-3 font-medium">Result</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {extraData.exams?.data?.length > 0 ? extraData.exams.data.map((res: any) => (
                                                        <tr key={res._id}>
                                                            <td className="p-3">{res.examId?.courseId?.name || 'Academic Course'}</td>
                                                            <td className="p-3"><Badge variant="outline">{res.examId?.type}</Badge></td>
                                                            <td className="p-3 font-semibold">{res.marksObtained} / {res.examId?.maxMarks}</td>
                                                            <td className="p-3">
                                                                <Badge variant={res.resultStatus === 'PASS' ? 'default' : 'destructive'}>
                                                                    {res.resultStatus}
                                                                </Badge>
                                                            </td>
                                                        </tr>
                                                    )) : <tr><td colSpan={4} className="p-8 text-center text-slate-500">No exam results recorded.</td></tr>}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="attendance" className="mt-4">
                            <Card className="border-0 shadow-sm">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="font-semibold text-lg flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-green-600" />
                                            Attendance Summary
                                        </h3>
                                        <div className="flex gap-4 text-sm">
                                            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500" /> Present</span>
                                            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500" /> Absent</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                        <div className="p-4 bg-blue-50 rounded-xl">
                                            <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">Overall</p>
                                            <p className="text-2xl font-bold text-blue-700">{(extraData.attendance?.overallPercentage || 0).toFixed(1)}%</p>
                                        </div>
                                        <div className="p-4 bg-green-50 rounded-xl">
                                            <p className="text-xs text-green-600 font-medium uppercase tracking-wider">Total Present</p>
                                            <p className="text-2xl font-bold text-green-700">{extraData.attendance?.summary?.PRESENT || 0}</p>
                                        </div>
                                        <div className="p-4 bg-orange-50 rounded-xl">
                                            <p className="text-xs text-orange-600 font-medium uppercase tracking-wider">Total Late</p>
                                            <p className="text-2xl font-bold text-orange-700">{extraData.attendance?.summary?.LATE || 0}</p>
                                        </div>
                                        <div className="p-4 bg-red-50 rounded-xl">
                                            <p className="text-xs text-red-600 font-medium uppercase tracking-wider">Total Absent</p>
                                            <p className="text-2xl font-bold text-red-700">{extraData.attendance?.summary?.ABSENT || 0}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-medium text-slate-700">Recent Records</h4>
                                        <div className="divide-y">
                                            {extraData.attendance?.data?.slice(0, 10).map((record: any) => (
                                                <div key={record._id} className="py-3 flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-sm">{record.courseId?.name}</p>
                                                        <p className="text-xs text-slate-500">{new Date(record.date).toLocaleDateString()}</p>
                                                    </div>
                                                    <Badge variant={record.status === 'PRESENT' ? 'default' : record.status === 'LATE' ? 'secondary' : 'destructive'}>
                                                        {record.status}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="finance" className="mt-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="border-0 shadow-sm">
                                    <CardHeader><CardTitle className="text-md flex items-center gap-2"><Receipt className="h-5 w-5 text-orange-600" /> Fees & Dues</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center py-2 border-b">
                                                <span className="text-slate-600">Total Fees Assigned</span>
                                                <span className="font-bold">₹{extraData.fees?.summary?.total.toLocaleString() || '0'}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b">
                                                <span className="text-slate-600">Total Paid</span>
                                                <span className="font-bold text-green-600">₹{extraData.fees?.summary?.paid.toLocaleString() || '0'}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 text-lg">
                                                <span className="font-semibold">Balance Due</span>
                                                <span className="font-bold text-red-600">₹{(extraData.fees?.summary?.total - extraData.fees?.summary?.paid || 0).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-sm">
                                    <CardHeader><CardTitle className="text-md flex items-center gap-2"><BookOpen className="h-5 w-5 text-blue-600" /> Library & Books</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {extraData.library?.length > 0 ? extraData.library.map((issue: any) => (
                                                <div key={issue._id} className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-sm font-medium">{issue.bookId?.title}</p>
                                                        <p className="text-xs text-slate-500">Due: {new Date(issue.dueDate).toLocaleDateString()}</p>
                                                    </div>
                                                    <Badge variant={new Date(issue.dueDate) < new Date() && issue.status === 'ISSUED' ? 'destructive' : 'outline'}>
                                                        {issue.status}
                                                    </Badge>
                                                </div>
                                            )) : <p className="text-center py-8 text-slate-500 text-sm">No books currently issued.</p>}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="border-0 shadow-sm">
                                <CardHeader><CardTitle className="text-md flex items-center gap-2"><Home className="h-5 w-5 text-indigo-600" /> Hostel Details</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div className="p-3 border rounded-lg">
                                            <p className="text-xs text-slate-500 mb-1">Hostel</p>
                                            <p className="font-semibold text-sm">Newton Hall (Block A)</p>
                                        </div>
                                        <div className="p-3 border rounded-lg">
                                            <p className="text-xs text-slate-500 mb-1">Room No</p>
                                            <p className="font-semibold text-sm">402</p>
                                        </div>
                                        <div className="p-3 border rounded-lg">
                                            <p className="text-xs text-slate-500 mb-1">Type</p>
                                            <p className="font-semibold text-sm">Double Sharing</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
