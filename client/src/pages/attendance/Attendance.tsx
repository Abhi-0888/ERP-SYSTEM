import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { recentStudents } from "@/lib/mock-data";
import { Check, X, Clock, CalendarCheck, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function Attendance() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">Attendance</h1>
              <p className="text-muted-foreground mt-1">Mark and view daily attendance records.</p>
            </div>
            <Button className="gap-2">
              <Check className="w-4 h-4" />
              Save Attendance
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-6">
            <Card className="bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-900/20">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-400">Present</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-300">92%</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/20">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                  <X className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-400">Absent</p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-300">5%</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-yellow-50 border-yellow-100 dark:bg-yellow-900/10 dark:border-yellow-900/20">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">Late/Leave</p>
                  <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-300">3%</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-4">
                <Select defaultValue="10">
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">Class 10</SelectItem>
                    <SelectItem value="9">Class 9</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="A">
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Section A</SelectItem>
                    <SelectItem value="B">Section B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground">
                {date?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-y border-border">
                    <tr>
                      <th className="px-6 py-3">Roll No</th>
                      <th className="px-6 py-3">Student Name</th>
                      <th className="px-6 py-3 text-center">Status</th>
                      <th className="px-6 py-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {recentStudents.map((student, idx) => (
                      <tr key={student.id} className="group hover:bg-muted/30">
                        <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                          {String(idx + 1).padStart(2, '0')}
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {student.name}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button className="w-8 h-8 rounded-md bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center transition-colors ring-2 ring-transparent focus:ring-green-500">
                              <Check className="w-4 h-4" />
                            </button>
                            <button className="w-8 h-8 rounded-md bg-secondary text-muted-foreground hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                            <button className="w-8 h-8 rounded-md bg-secondary text-muted-foreground hover:bg-yellow-100 hover:text-yellow-600 flex items-center justify-center transition-colors">
                              <Clock className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <input type="text" placeholder="Add remark..." className="w-full bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none text-xs py-1" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-80 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border w-full"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>Class 10-A Overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Strength</span>
                <span className="font-bold">42</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-600">Present Today</span>
                <span className="font-bold text-green-600">38</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-red-600">Absent Today</span>
                <span className="font-bold text-red-600">2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-yellow-600">On Leave</span>
                <span className="font-bold text-yellow-600">2</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
