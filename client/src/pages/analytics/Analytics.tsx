import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Brain, TrendingUp, AlertTriangle, Users, DollarSign } from "lucide-react";

const predictionData = [
  { month: "Jan", actual: 95, predicted: 94 },
  { month: "Feb", actual: 92, predicted: 93 },
  { month: "Mar", actual: 96, predicted: 95 },
  { month: "Apr", actual: 91, predicted: 92 },
  { month: "May", actual: 94, predicted: 94 },
  { month: "Jun", actual: null, predicted: 96 },
  { month: "Jul", actual: null, predicted: 95 },
];

const riskData = [
  { name: "High Risk", value: 15, color: "#ef4444" },
  { name: "Medium Risk", value: 45, color: "#f59e0b" },
  { name: "Low Risk", value: 120, color: "#22c55e" },
];

export default function Analytics() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-foreground flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            AI Analytics
          </h1>
          <p className="text-muted-foreground mt-1">Predictive insights and performance forecasting.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <TrendingUp className="w-4 h-4" /> Generate Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium opacity-90">Dropout Probability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">2.4%</div>
            <p className="text-sm opacity-80 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> -0.5% from last year
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
           <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-muted-foreground">Fee Collection Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$52,000</div>
            <p className="text-sm text-muted-foreground mt-1">Expected by month end</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
           <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-muted-foreground">At-Risk Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">15</div>
            <p className="text-sm text-muted-foreground mt-1">Require immediate intervention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Attendance Trends & Prediction</CardTitle>
            <CardDescription>AI-driven forecast for student attendance.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={predictionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={[80, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="actual" stroke="hsl(var(--primary))" strokeWidth={2} name="Actual" />
                  <Line type="monotone" dataKey="predicted" stroke="#9333ea" strokeWidth={2} strokeDasharray="5 5" name="Predicted (AI)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Student Performance Risk Analysis</CardTitle>
            <CardDescription>Distribution of students based on academic risk factors.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="h-[300px] w-full max-w-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 ml-4">
              {riskData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.value} Students</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
