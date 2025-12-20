"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
    FileText, Download, Users, BookOpen, DollarSign, TrendingUp, BarChart3, PieChart
} from "lucide-react";

export default function ReportsPage() {
    const reportCategories = [
        {
            title: "Student Reports",
            icon: Users,
            color: "blue",
            reports: [
                { name: "Student Strength Report", description: "Department-wise student count" },
                { name: "Attendance Summary", description: "Monthly attendance statistics" },
                { name: "Academic Performance", description: "CGPA distribution analysis" },
                { name: "Enrollment Trends", description: "Year-over-year enrollment data" },
            ]
        },
        {
            title: "Academic Reports",
            icon: BookOpen,
            color: "green",
            reports: [
                { name: "Course Enrollment", description: "Students per course" },
                { name: "Exam Results Summary", description: "Pass/fail statistics" },
                { name: "Faculty Workload", description: "Courses per faculty" },
                { name: "Program Analytics", description: "Program-wise performance" },
            ]
        },
        {
            title: "Financial Reports",
            icon: DollarSign,
            color: "purple",
            reports: [
                { name: "Fee Collection Report", description: "Collection vs pending" },
                { name: "Defaulters List", description: "Overdue fee payments" },
                { name: "Revenue Analysis", description: "Monthly revenue trends" },
                { name: "Scholarship Report", description: "Scholarship distribution" },
            ]
        },
        {
            title: "Administrative Reports",
            icon: BarChart3,
            color: "orange",
            reports: [
                { name: "User Activity Log", description: "System usage statistics" },
                { name: "Department Summary", description: "Overview by department" },
                { name: "Library Usage", description: "Book circulation stats" },
                { name: "Hostel Occupancy", description: "Room allocation report" },
            ]
        },
    ];

    const colorMap: Record<string, string> = {
        blue: "bg-blue-100 text-blue-600",
        green: "bg-green-100 text-green-600",
        purple: "bg-purple-100 text-purple-600",
        orange: "bg-orange-100 text-orange-600",
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Reports</h1>
                    <p className="text-slate-500">Generate and download system reports</p>
                </div>
                <div className="flex gap-2">
                    <Select defaultValue="2024">
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2024">2024</SelectItem>
                            <SelectItem value="2023">2023</SelectItem>
                            <SelectItem value="2022">2022</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg"><FileText className="h-5 w-5 text-blue-600" /></div>
                        <div><p className="text-sm text-slate-500">Generated</p><p className="text-xl font-bold">156</p></div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg"><Download className="h-5 w-5 text-green-600" /></div>
                        <div><p className="text-sm text-slate-500">Downloads</p><p className="text-xl font-bold">892</p></div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg"><PieChart className="h-5 w-5 text-purple-600" /></div>
                        <div><p className="text-sm text-slate-500">Scheduled</p><p className="text-xl font-bold">12</p></div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg"><TrendingUp className="h-5 w-5 text-orange-600" /></div>
                        <div><p className="text-sm text-slate-500">This Month</p><p className="text-xl font-bold">28</p></div>
                    </CardContent>
                </Card>
            </div>

            {/* Report Categories */}
            <div className="grid md:grid-cols-2 gap-6">
                {reportCategories.map((category) => (
                    <Card key={category.title} className="border-0 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <div className={`p-2 rounded-lg ${colorMap[category.color]}`}>
                                    <category.icon className="h-5 w-5" />
                                </div>
                                {category.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {category.reports.map((report) => (
                                    <div key={report.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                        <div>
                                            <p className="font-medium text-sm">{report.name}</p>
                                            <p className="text-xs text-slate-500">{report.description}</p>
                                        </div>
                                        <Button size="sm" variant="outline">
                                            <Download className="h-4 w-4 mr-1" />
                                            Generate
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Reports */}
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Recently Generated</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[
                            { name: "Student Strength Report - December 2024", date: "2024-12-05", size: "245 KB" },
                            { name: "Fee Collection Report - November 2024", date: "2024-12-01", size: "189 KB" },
                            { name: "Exam Results Summary - Fall 2024", date: "2024-11-28", size: "312 KB" },
                            { name: "Faculty Workload Analysis - Q3", date: "2024-11-20", size: "156 KB" },
                        ].map((report, i) => (
                            <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 rounded-lg">
                                        <FileText className="h-4 w-4 text-slate-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{report.name}</p>
                                        <p className="text-xs text-slate-500">Generated on {report.date} • {report.size}</p>
                                    </div>
                                </div>
                                <Button size="sm" variant="ghost"><Download className="h-4 w-4" /></Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
