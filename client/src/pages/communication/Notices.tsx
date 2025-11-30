import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notices } from "@/lib/mock-data";
import { MessageSquare, Bell, Send, Pin, Paperclip } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Notices() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">Communication</h1>
          <p className="text-muted-foreground mt-1">Announcements, messages, and notifications.</p>
        </div>
        <Button className="gap-2">
          <Send className="w-4 h-4" />
          Compose Message
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Notice Board */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Pin className="w-5 h-5 text-primary" />
                <CardTitle>Notice Board</CardTitle>
              </div>
              <Button variant="ghost" size="sm">View All</Button>
            </CardHeader>
            <CardContent className="grid gap-4">
              {notices.map((notice) => (
                <div key={notice.id} className="p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors group relative">
                  <div className="flex justify-between items-start mb-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold group-hover:text-primary transition-colors">{notice.title}</h3>
                        {notice.priority === 'high' && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 h-5">Urgent</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        {notice.date} • {notice.category}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {notice.content}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
             <CardHeader>
               <CardTitle>Recent Messages</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 {[1, 2, 3].map((i) => (
                   <div key={i} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                     <Avatar>
                       <AvatarImage src={`https://i.pravatar.cc/150?img=${i + 20}`} />
                       <AvatarFallback>U</AvatarFallback>
                     </Avatar>
                     <div className="flex-1 space-y-1">
                       <div className="flex items-center justify-between">
                         <p className="text-sm font-medium">Sarah Johnson (Parent)</p>
                         <span className="text-xs text-muted-foreground">2h ago</span>
                       </div>
                       <p className="text-sm text-muted-foreground line-clamp-1">
                         Regarding the upcoming field trip, I wanted to ask if...
                       </p>
                     </div>
                   </div>
                 ))}
               </div>
             </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Send */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm sticky top-24">
            <CardHeader>
              <CardTitle>Quick Announcement</CardTitle>
              <CardDescription>Send a notification to specific groups.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">To</label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                  <option>All Students</option>
                  <option>Class 10 Parents</option>
                  <option>Teaching Staff</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input placeholder="Enter title..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea placeholder="Type your message here..." className="min-h-[120px]" />
              </div>
              <div className="flex items-center justify-between pt-2">
                <Button variant="outline" size="icon">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button className="w-full ml-2">
                  Send Notification
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
