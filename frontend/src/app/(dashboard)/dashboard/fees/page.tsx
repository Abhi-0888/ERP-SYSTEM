"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
    CreditCard, TrendingUp, AlertCircle, CheckCircle, Download,
    Plus, Search, Filter, Receipt, Loader2, RefreshCw
} from "lucide-react";
import { FeeService, FeeType, FeeStatus, FeeStructure } from "@/lib/services/fee.service";
import { AcademicService } from "@/lib/services/academic.service";

// Accountant/Admin view
function AdminFeesView() {
    const [structures, setStructures] = useState<FeeStructure[]>([]);
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [report, setReport] = useState<any>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        type: "TUITION" as FeeType,
        amount: 0,
        academicYearId: "",
        dueDate: new Date().toISOString().split('T')[0],
        description: ""
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [structsRes, yearsRes, reportRes] = await Promise.all([
                FeeService.getFeeStructures({ limit: 100 }),
                AcademicService.getAcademicYears(),
                FeeService.getFeeReport()
            ]);
            setStructures(structsRes.data.data || []);
            setAcademicYears(yearsRes.data || []);
            setReport(reportRes.data);
        } catch (error) {
            console.error("Failed to fetch fee data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = async () => {
        if (!formData.academicYearId) {
            alert("Please select academic year");
            return;
        }
        setActionLoading(true);
        try {
            await FeeService.createFeeStructure(formData);
            await fetchData();
            setIsCreateOpen(false);
            setFormData({
                name: "",
                type: "TUITION",
                amount: 0,
                academicYearId: "",
                dueDate: new Date().toISOString().split('T')[0],
                description: ""
            });
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to create fee structure");
        } finally {
            setActionLoading(false);
        }
    };

    const getStatColor = (status: string) => {
        switch (status) {
            case 'FULLY_PAID': return 'text-green-600';
            case 'PENDING': return 'text-orange-600';
            case 'OVERDUE': return 'text-red-600';
            default: return 'text-slate-600';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Fee Management</h1>
                    <p className="text-slate-500">Manage fee structures and track collections</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />Add Fee Structure
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {report?.stats?.map((stat: any) => (
                    <Card key={stat._id} className="border-0 shadow-sm">
                        <CardContent className="p-4">
                            <p className="text-sm text-slate-500 font-medium">{stat._id.replace('_', ' ')}</p>
                            <p className={`text-xl font-bold mt-1 ${getStatColor(stat._id)}`}>
                                ₹{(stat.totalPaid || 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                {stat.count} records
                            </p>
                        </CardContent>
                    </Card>
                )) || (
                        <div className="col-span-4 py-4 text-center text-slate-400">Loading collection stats...</div>
                    )}
            </div>

            <Tabs defaultValue="structures">
                <TabsList>
                    <TabsTrigger value="structures">Fee Structures</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions (Soon)</TabsTrigger>
                </TabsList>

                <TabsContent value="structures" className="mt-4">
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="pl-6">Fee Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Due Date</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={5} className="text-center py-8">Loading structures...</TableCell></TableRow>
                                    ) : structures.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-500">No fee structures defined yet.</TableCell></TableRow>
                                    ) : (
                                        structures.map((fee) => (
                                            <TableRow key={fee._id}>
                                                <TableCell className="font-medium pl-6">{fee.name}</TableCell>
                                                <TableCell><Badge variant="outline">{fee.type}</Badge></TableCell>
                                                <TableCell>₹{fee.amount.toLocaleString()}</TableCell>
                                                <TableCell>{new Date(fee.dueDate).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <Badge variant={fee.status === 'FULLY_PAID' ? 'default' : 'secondary'}>
                                                        {fee.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="transactions" className="mt-4">
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-12 text-center text-slate-500">
                            <Receipt className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>Detailed transaction history coming in next update.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Add Fee Structure</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Fee Name</label>
                            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Tuition Fee 2024" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Type</label>
                                <Select value={formData.type} onValueChange={(v: FeeType) => setFormData({ ...formData, type: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.values(FeeType).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Amount</label>
                                <Input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Academic Year</label>
                                <Select value={formData.academicYearId} onValueChange={(v) => setFormData({ ...formData, academicYearId: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
                                    <SelectContent>
                                        {academicYears.map(y => <SelectItem key={y._id} value={y._id}>{y.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Due Date</label>
                                <Input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={actionLoading}>
                            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Structure
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Student view
function StudentFeesView() {
    const { user } = useAuth();
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            if (!user?.id) return;
            try {
                const res = await FeeService.getStudentFeeStatus(user.id);
                setStatus(res.data);
            } catch (error) {
                console.error("Failed to fetch student fee status", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStatus();
    }, [user?.id]);

    if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

    const summary = status?.summary || { total: 0, paid: 0 };
    const pending = summary.total - summary.paid;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">My Fees</h1>
                    <p className="text-slate-500">View your fee status and payment history</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                    <Download className="h-4 w-4 mr-2" />Print Statement
                </Button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-sm text-slate-500 font-medium">Total Assigned</p>
                        <p className="text-2xl font-bold mt-1">₹{summary.total.toLocaleString()}</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-green-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-green-700 font-medium">Total Paid</p>
                        <p className="text-2xl font-bold text-green-800 mt-1">₹{summary.paid.toLocaleString()}</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-orange-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-orange-700 font-medium">Pending Due</p>
                        <p className="text-2xl font-bold text-orange-800 mt-1">₹{pending.toLocaleString()}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Transaction History */}
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-blue-600" />
                        Fee Statements
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fee Name</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Paid</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Due Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {status?.data?.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-500">No fee records found.</TableCell></TableRow>
                            ) : (
                                status?.data?.map((txn: any) => (
                                    <TableRow key={txn._id}>
                                        <TableCell className="font-medium">{txn.feeId?.name || 'Academic Fee'}</TableCell>
                                        <TableCell>₹{txn.amount.toLocaleString()}</TableCell>
                                        <TableCell className="text-green-600">₹{txn.amountPaid.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={txn.status === 'FULLY_PAID' ? 'default' : 'secondary'}>
                                                {txn.status.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(txn.dueDate).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

export default function FeesPage() {
    const { activeRole } = useAuth();

    if (activeRole === "ACCOUNTANT" || activeRole === "UNIVERSITY_ADMIN" || activeRole === "SUPER_ADMIN") {
        return <AdminFeesView />;
    }

    return <StudentFeesView />;
}
