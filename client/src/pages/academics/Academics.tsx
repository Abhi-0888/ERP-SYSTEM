import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { timetable, exams } from "@/lib/mock-data";
import { Calendar, Clock, FileText, Plus, Download, BookOpen } from "lucide-react";

export default function Academics() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">Academics</h1>
          <p className="text-muted-foreground mt-1">Manage timetables, examinations, and reports.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Export Schedule
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Schedule Exam
          </Button>
        </div>
      </div>

      <Tabs defaultValue="timetable" className="space-y-6">
        <TabsList>
          <TabsTrigger value="timetable">Timetable</TabsTrigger>
          <TabsTrigger value="exams">Examinations</TabsTrigger>
          <TabsTrigger value="reports">Report Cards</TabsTrigger>
        </TabsList>

        <TabsContent value="timetable">
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Class 10-A Schedule</CardTitle>
                <CardDescription>Weekly academic timetable effective from April 1st.</CardDescription>
              </div>
              <Badge variant="outline" className="gap-1">
                <Clock className="w-3 h-3" /> Updated 2 days ago
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                    <tr>
                      <th className="px-4 py-3 border-r border-border">Time</th>
                      <th className="px-4 py-3 text-center border-r border-border w-1/6">Monday</th>
                      <th className="px-4 py-3 text-center border-r border-border w-1/6">Tuesday</th>
                      <th className="px-4 py-3 text-center border-r border-border w-1/6">Wednesday</th>
                      <th className="px-4 py-3 text-center border-r border-border w-1/6">Thursday</th>
                      <th className="px-4 py-3 text-center w-1/6">Friday</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {timetable.map((slot, idx) => (
                      <tr key={idx} className="hover:bg-muted/30">
                        <td className="px-4 py-4 font-mono text-xs font-medium border-r border-border bg-secondary/10 text-muted-foreground">
                          {slot.time}
                        </td>
                        <td className="px-4 py-4 text-center border-r border-border">
                          {slot.mon === "Break" ? (
                            <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-none">Break</Badge>
                          ) : (
                            <div className="font-medium">{slot.mon}</div>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center border-r border-border">
                          {slot.tue === "Break" ? (
                             <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-none">Break</Badge>
                          ) : (
                            <div className="font-medium">{slot.tue}</div>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center border-r border-border">
                          {slot.wed === "Break" ? (
                             <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-none">Break</Badge>
                          ) : (
                            <div className="font-medium">{slot.wed}</div>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center border-r border-border">
                          {slot.thu === "Break" ? (
                             <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-none">Break</Badge>
                          ) : (
                            <div className="font-medium">{slot.thu}</div>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {slot.fri === "Break" ? (
                             <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-none">Break</Badge>
                          ) : (
                            <div className="font-medium">{slot.fri}</div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams">
          <div className="grid gap-6 md:grid-cols-2">
            {exams.map((exam) => (
              <Card key={exam.id} className="border-none shadow-sm hover:shadow-md transition-all">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{exam.name}</CardTitle>
                    <CardDescription>{exam.class}</CardDescription>
                  </div>
                  <Badge variant={
                    exam.status === 'upcoming' ? 'default' :
                    exam.status === 'ongoing' ? 'secondary' : 'outline'
                  } className="capitalize">
                    {exam.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(exam.startDate).toLocaleDateString()} - {new Date(exam.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" className="w-full">View Schedule</Button>
                    <Button size="sm" variant="outline" className="w-full">Marks Entry</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Card className="border-dashed border-2 shadow-none flex items-center justify-center p-6 bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer">
              <div className="text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="font-medium">Schedule New Exam</h3>
                <p className="text-sm text-muted-foreground">Create timetable and seating plan</p>
              </div>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="reports">
          <Card className="border-none shadow-sm">
             <CardHeader>
               <CardTitle>Generate Report Cards</CardTitle>
               <CardDescription>Select class and exam to generate consolidated reports.</CardDescription>
             </CardHeader>
             <CardContent className="flex flex-col items-center justify-center py-10 text-center space-y-4">
               <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center text-muted-foreground">
                 <FileText className="w-8 h-8" />
               </div>
               <div className="max-w-sm text-muted-foreground">
                 Select an exam from the Examination tab or configure a new report template to get started.
               </div>
               <Button>Configure Template</Button>
             </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
