import { 
  stats, 
  recentStudents, 
  recentFees, 
  attendanceData 
} from "@/lib/mock-data";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { ArrowRight, Download, Filter, MoreHorizontal } from "lucide-react";

export default function Home() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your institution's performance today.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
          <Button className="gap-2">
            <Filter className="w-4 h-4" />
            Filter View
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="relative overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-200 group">
              <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-display">{stat.value}</div>
                <p className={`text-xs mt-1 font-medium flex items-center ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                  <span className="text-muted-foreground ml-1 font-normal">from last month</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Attendance Chart */}
        <Card className="col-span-4 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Attendance Overview</CardTitle>
            <CardDescription>Weekly attendance patterns across all classes.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value}%`} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                      boxShadow: 'var(--shadow-md)'
                    }}
                  />
                  <Bar 
                    dataKey="present" 
                    name="Present" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]} 
                    barSize={32}
                  />
                  <Bar 
                    dataKey="absent" 
                    name="Absent" 
                    fill="hsl(var(--destructive))" 
                    radius={[4, 4, 0, 0]} 
                    barSize={32}
                    opacity={0.8}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Fees */}
        <Card className="col-span-3 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Recent Fee Collections</CardTitle>
            <CardDescription>Latest transactions and pending dues.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentFees.map((fee) => (
                <div key={fee.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      fee.status === 'paid' ? 'bg-green-500' : 
                      fee.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">{fee.studentName}</p>
                      <p className="text-xs text-muted-foreground">{fee.type} • Due {fee.dueDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">${fee.amount}</p>
                    <Badge variant={
                      fee.status === 'paid' ? 'default' : 
                      fee.status === 'pending' ? 'secondary' : 'destructive'
                    } className="text-[10px] px-1.5 py-0 h-5 mt-1 capitalize shadow-none">
                      {fee.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardHeader className="pt-2 border-t border-border/50">
             <Button variant="ghost" className="w-full justify-between text-muted-foreground hover:text-primary">
               View All Transactions <ArrowRight className="w-4 h-4" />
             </Button>
          </CardHeader>
        </Card>
      </div>

      {/* Student List Preview */}
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
             <CardTitle>Recent Admissions</CardTitle>
             <CardDescription>New students added to the system this week.</CardDescription>
          </div>
          <Button variant="outline" size="sm">View Directory</Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/30">
                <tr>
                  <th className="px-4 py-3 rounded-l-md">Student</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Guardian</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 rounded-r-md text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {recentStudents.map((student) => (
                  <tr key={student.id} className="group hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium group-hover:text-primary transition-colors">{student.name}</div>
                          <div className="text-xs text-muted-foreground">{student.admissionNo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="font-normal">
                        Class {student.class}-{student.section}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{student.guardian}</div>
                      <div className="text-xs text-muted-foreground">{student.contact}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                        student.status === 'active' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          student.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                        }`} />
                        {student.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
