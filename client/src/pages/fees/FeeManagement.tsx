import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { recentFees } from "@/lib/mock-data";
import { Download, CreditCard, AlertCircle, CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FeeManagement() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">Fee Management</h1>
          <p className="text-muted-foreground mt-1">Track payments, invoices, and dues.</p>
        </div>
        <Button className="gap-2">
          <CreditCard className="w-4 h-4" />
          Record Payment
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="bg-primary text-primary-foreground border-none shadow-lg shadow-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium opacity-90">Total Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$124,500</div>
            <p className="text-sm opacity-80 mt-1">This Academic Year</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-muted-foreground">Pending Dues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">$12,800</div>
            <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> 15 Students Overdue
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-muted-foreground">Expected (Next Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">$45,000</div>
            <p className="text-sm text-muted-foreground mt-1">Due by May 15th</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="structure">Fee Structure</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest fee payments received.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-y border-border">
                  <tr>
                    <th className="px-6 py-4">Invoice ID</th>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Fee Type</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {recentFees.map((fee, idx) => (
                    <tr key={fee.id} className="group hover:bg-muted/30">
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                        INV-{2024000 + idx}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {fee.studentName}
                      </td>
                      <td className="px-6 py-4">
                        {fee.type}
                      </td>
                      <td className="px-6 py-4 font-bold">
                        ${fee.amount}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {fee.dueDate}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={
                          fee.status === 'paid' ? 'default' : 
                          fee.status === 'pending' ? 'secondary' : 'destructive'
                        } className="uppercase">
                          {fee.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
                          <Download className="w-3 h-3" /> PDF
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
