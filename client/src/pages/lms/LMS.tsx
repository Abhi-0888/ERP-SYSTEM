import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Video, FileText, CheckCircle, Clock, Upload, PlayCircle } from "lucide-react";

const courses = [
  {
    id: "c1",
    title: "Mathematics - Class 10",
    progress: 75,
    nextLesson: "Quadratic Equations",
    assignments: 2
  },
  {
    id: "c2",
    title: "Physics - Class 10",
    progress: 45,
    nextLesson: "Light: Reflection and Refraction",
    assignments: 1
  },
  {
    id: "c3",
    title: "Computer Science",
    progress: 90,
    nextLesson: "Database Management Systems",
    assignments: 0
  }
];

const materials = [
  { title: "Chapter 5 Notes", type: "pdf", size: "2.4 MB", date: "2 days ago" },
  { title: "Lab Experiment Demo", type: "video", duration: "15:30", date: "1 week ago" },
  { title: "Previous Year Q&A", type: "doc", size: "1.1 MB", date: "2 weeks ago" }
];

export default function LMS() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">Learning Management</h1>
          <p className="text-muted-foreground mt-1">Course content, assignments, and progress tracking.</p>
        </div>
        <Button className="gap-2">
          <Upload className="w-4 h-4" />
          Upload Material
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {courses.map((course) => (
          <Card key={course.id} className="flex flex-col border-none shadow-sm hover:shadow-md transition-all">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                  Active
                </Badge>
                {course.assignments > 0 && (
                  <Badge variant="destructive" className="text-[10px]">
                    {course.assignments} Assignments
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg">{course.title}</CardTitle>
              <CardDescription>Next: {course.nextLesson}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-2" />
              </div>
            </CardContent>
            <CardFooter className="pt-2 pb-4">
              <Button variant="outline" className="w-full">Continue Learning</Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Recent Course Materials</CardTitle>
              <CardDescription>Download notes and watch recorded lectures.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {materials.map((item, i) => (
                  <div key={i} className="flex items-center p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors group">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${
                      item.type === 'video' ? 'bg-red-100 text-red-600' : 
                      item.type === 'pdf' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {item.type === 'video' ? <Video className="w-5 h-5" /> : 
                       item.type === 'pdf' ? <FileText className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm group-hover:text-primary transition-colors">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {item.type === 'video' ? item.duration : item.size} • {item.date}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.type === 'video' ? 'Watch' : 'Download'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-none shadow-sm h-full">
            <CardHeader>
              <CardTitle>Assignments</CardTitle>
              <CardDescription>Pending submissions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-yellow-50/50 border border-yellow-100 dark:bg-yellow-900/10 dark:border-yellow-900/20">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-yellow-700 dark:text-yellow-500">Due Tomorrow</span>
                  <Clock className="w-3 h-3 text-yellow-700 dark:text-yellow-500" />
                </div>
                <h4 className="font-medium text-sm mb-1">Quadratic Equations Worksheet</h4>
                <p className="text-xs text-muted-foreground">Math • 10 Points</p>
                <Button size="sm" className="w-full mt-3 bg-yellow-600 hover:bg-yellow-700 text-white border-none">Submit Now</Button>
              </div>
              
              <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-medium text-muted-foreground">Due next week</span>
                </div>
                <h4 className="font-medium text-sm mb-1">Physics Lab Report</h4>
                <p className="text-xs text-muted-foreground">Physics • 20 Points</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
