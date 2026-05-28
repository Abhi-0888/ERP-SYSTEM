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
import api from "@/lib/api";
import Script from "next/script";

// Accountant/Admin view
function AdminFeesView() {
    const [structures, setStructures] = useState<FeeStructure[]>([]);
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [report, setReport] = useState<any>(null);

    const [transactions, setTransactions] = useState<any[]>([]);
    const [studentDues, setStudentDues] = useState<any[]>([]);
    const [duesLoading, setDuesLoading] = useState(false);
    const [txnLoading, setTxnLoading] = useState(false);

    // Filter state
    const [filters, setFilters] = useState({
        departmentId: "ALL",
        semester: "ALL",
        status: "ALL"
    });

    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [studentDetails, setStudentDetails] = useState<any>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [isBulkFineOpen, setIsBulkFineOpen] = useState(false);
    const [bulkFineData, setBulkFineData] = useState({ amount: 0, reason: "" });

    const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
    const [paymentData, setPaymentData] = useState({
        feeId: "",
        amountPaid: 0,
        paymentMethod: "CASH",
        transactionId: "",
        remarks: ""
    });

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        type: "TUITION" as FeeType,
        amount: 0,
        academicYearId: "",
        dueDate: new Date().toISOString().split('T')[0],
        description: ""
    });

    const fetchTransactions = async () => {
        setTxnLoading(true);
        try {
            const res = await FeeService.getTransactions();
            setTransactions((res as any).data || res || []);
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        } finally {
            setTxnLoading(false);
        }
    };

    const fetchStudentDues = async () => {
        setDuesLoading(true);
        try {
            const params: any = {};
            if (filters.departmentId !== "ALL") params.departmentId = filters.departmentId;
            if (filters.semester !== "ALL") params.semester = filters.semester;
            if (filters.status !== "ALL") params.status = filters.status;

            const res = await FeeService.getStudentsDashboard(params);
            setStudentDues((res as any).data || res || []);
        } catch (error) {
            console.error("Failed to fetch student dues", error);
        } finally {
            setDuesLoading(false);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [structsRes, yearsRes, reportRes] = await Promise.all([
                FeeService.getFeeStructures({ limit: 100 }),
                AcademicService.getAcademicYears(),
                FeeService.getFeeStats()
            ]);
            setStructures((structsRes as any).data?.data || (structsRes as any).data || structsRes || []);
            setAcademicYears((yearsRes as any).data || yearsRes || []);
            setReport((reportRes as any).data || reportRes);
            
            // Initial fetch for other tabs
            fetchTransactions();
            fetchStudentDues();
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
                type: "TUITION" as any,
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

    const handleViewDetails = async (studentId: string) => {
        setSelectedStudentId(studentId);
        setIsDetailOpen(true);
        setDetailsLoading(true);
        try {
            const res = await FeeService.getStudentDetailedFees(studentId);
            setStudentDetails(res);
        } catch (error) {
            console.error("Failed to fetch details", error);
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleBulkAssignToAll = async (feeId: string) => {
        if (!confirm("Are you sure you want to assign this fee to ALL students?")) return;
        setActionLoading(true);
        try {
            const res = await FeeService.bulkAssignFees({
                studentIds: ["ALL"],
                feeId
            });
            alert(`Assigned to ${res.assigned} students. ${res.skipped} skipped (already assigned).`);
            await fetchStudentDues();
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to bulk assign");
        } finally {
            setActionLoading(false);
        }
    };

    const handleBulkFine = async () => {
        if (selectedStudents.length === 0) return;
        setActionLoading(true);
        try {
            await FeeService.bulkAddFine({
                studentIds: selectedStudents,
                amount: bulkFineData.amount,
                reason: bulkFineData.reason
            });
            await fetchStudentDues();
            setIsBulkFineOpen(false);
            setSelectedStudents([]);
            setBulkFineData({ amount: 0, reason: "" });
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to add fines");
        } finally {
            setActionLoading(false);
        }
    };

    const toggleStudentSelection = (id: string) => {
        setSelectedStudents(prev => 
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const handleRecordPayment = async () => {
        if (!paymentData.feeId || !paymentData.amountPaid) return;
        setActionLoading(true);
        try {
            await FeeService.recordPayment(paymentData.feeId, {
                amountPaid: paymentData.amountPaid,
                paymentMethod: paymentData.paymentMethod as any,
                transactionId: paymentData.transactionId,
                remarks: paymentData.remarks
            });
            await handleViewDetails(selectedStudentId!);
            await fetchStudentDues();
            setIsRecordPaymentOpen(false);
            setPaymentData({ feeId: "", amountPaid: 0, paymentMethod: "CASH", transactionId: "", remarks: "" });
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to record payment");
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

    const handleExport = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.departmentId !== "ALL") params.append("departmentId", filters.departmentId);
            if (filters.semester !== "ALL") params.append("semester", filters.semester);
            if (filters.status !== "ALL") params.append("status", filters.status);
            
            const response = await api.get(`/fees/dashboard/students/export?${params.toString()}`, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'student_fees.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Failed to export", error);
            alert("Export failed");
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
                    <Button variant="outline" size="sm" onClick={handleExport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
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

            <Tabs defaultValue="structures" onValueChange={(val) => {
                if (val === 'transactions' || val === 'fines') fetchTransactions();
                if (val === 'dues') fetchStudentDues();
            }}>
                <TabsList>
                    <TabsTrigger value="structures">Fee Structures</TabsTrigger>
                    <TabsTrigger value="dues">Student Dues</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="fines">Fines</TabsTrigger>
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
                                        <TableHead className="text-right pr-6">Action</TableHead>
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
                                                        {fee.status.replace('_', ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right pr-6 space-x-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleBulkAssignToAll(fee._id)} disabled={actionLoading}>
                                                        Assign to All
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => {
                                                        if (confirm('Are you sure you want to delete this structure?')) {
                                                            FeeService.deleteFeeStructure(fee._id).then(() => fetchData());
                                                        }
                                                    }}>
                                                        Delete
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="dues" className="mt-4">
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Student Payment Status</CardTitle>
                            <div className="flex gap-2">
                                <Select value={filters.status} onValueChange={(v) => setFilters({...filters, status: v})}>
                                    <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">All Status</SelectItem>
                                        <SelectItem value="FULLY_PAID">Paid</SelectItem>
                                        <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
                                        <SelectItem value="PENDING">Not Paid</SelectItem>
                                    </SelectContent>
                                </Select>
                                {selectedStudents.length > 0 && (
                                    <Button size="sm" className="bg-rose-600 hover:bg-rose-700" onClick={() => setIsBulkFineOpen(true)}>
                                        Apply Fine ({selectedStudents.length})
                                    </Button>
                                )}
                                <Button size="sm" variant="outline" onClick={fetchStudentDues}>Apply</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px] pl-6"></TableHead>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Total Fee</TableHead>
                                        <TableHead>Paid</TableHead>
                                        <TableHead>Pending</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right pr-6">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {duesLoading ? (
                                        <TableRow><TableCell colSpan={8} className="text-center py-8">Loading dues...</TableCell></TableRow>
                                    ) : studentDues.length === 0 ? (
                                        <TableRow><TableCell colSpan={8} className="text-center py-8">No records found.</TableCell></TableRow>
                                    ) : (
                                        studentDues.map((due) => (
                                            <TableRow key={due.studentId} className="hover:bg-slate-50 cursor-pointer group">
                                                <TableCell className="pl-6" onClick={(e) => e.stopPropagation()}>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedStudents.includes(due.studentId)}
                                                        onChange={() => toggleStudentSelection(due.studentId)}
                                                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                                                    />
                                                </TableCell>
                                                <TableCell onClick={() => handleViewDetails(due.studentId)}>
                                                    <div className="font-medium">{due.name}</div>
                                                    <div className="text-xs text-slate-500">{due.enrollmentNo}</div>
                                                </TableCell>
                                                <TableCell onClick={() => handleViewDetails(due.studentId)}>{due.department} (Sem {due.semester})</TableCell>
                                                <TableCell onClick={() => handleViewDetails(due.studentId)}>₹{due.totalAmount.toLocaleString()}</TableCell>
                                                <TableCell onClick={() => handleViewDetails(due.studentId)} className="text-green-600 font-medium">₹{due.totalPaid.toLocaleString()}</TableCell>
                                                <TableCell onClick={() => handleViewDetails(due.studentId)} className="text-red-600 font-medium">₹{due.pendingAmount.toLocaleString()}</TableCell>
                                                <TableCell onClick={() => handleViewDetails(due.studentId)}>
                                                    <Badge variant={due.status === 'FULLY_PAID' ? 'default' : 'secondary'}>
                                                        {due.status.replace('_', ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <Button variant="ghost" size="sm" onClick={() => handleViewDetails(due.studentId)}>
                                                        View History
                                                    </Button>
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
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="pl-6">Transaction ID</TableHead>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Fee Type</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {txnLoading ? (
                                        <TableRow><TableCell colSpan={6} className="text-center py-8">Loading transactions...</TableCell></TableRow>
                                    ) : transactions.length === 0 ? (
                                        <TableRow><TableCell colSpan={6} className="text-center py-8">No transactions found.</TableCell></TableRow>
                                    ) : (
                                        transactions.map((txn) => (
                                            <TableRow key={txn._id}>
                                                <TableCell className="pl-6 font-mono text-xs">{txn.transactionId || txn.razorpayPaymentId || 'N/A'}</TableCell>
                                                <TableCell>{txn.studentId?.userId?.name || 'Unknown'}</TableCell>
                                                <TableCell>{txn.feeId?.name || 'Academic'}</TableCell>
                                                <TableCell className="font-bold text-green-600">₹{txn.amountPaid.toLocaleString()}</TableCell>
                                                <TableCell><Badge variant="outline">{txn.paymentMethod}</Badge></TableCell>
                                                <TableCell>{new Date(txn.paymentDate || txn.createdAt).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="fines" className="mt-4">
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Fine Management</CardTitle>
                            <p className="text-xs text-slate-500">Record of all applied manual fines and late fees.</p>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="pl-6">Student</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {txnLoading ? (
                                        <TableRow><TableCell colSpan={5} className="text-center py-8">Loading fines...</TableCell></TableRow>
                                    ) : transactions.filter(t => t.remarks?.toLowerCase().includes('fine') || t.remarks?.toLowerCase().includes('late') || !t.feeId).length === 0 ? (
                                        <TableRow><TableCell colSpan={5} className="text-center py-8">No fine records found.</TableCell></TableRow>
                                    ) : (
                                        transactions.filter(t => t.remarks?.toLowerCase().includes('fine') || t.remarks?.toLowerCase().includes('late') || !t.feeId).map((txn) => (
                                            <TableRow key={txn._id}>
                                                <TableCell className="pl-6 font-medium">
                                                    {txn.studentId?.userId?.name || 'Unknown'}
                                                    <div className="text-[10px] text-slate-400">{txn.studentId?.enrollmentNo}</div>
                                                </TableCell>
                                                <TableCell>{txn.remarks || 'Manual Fine'}</TableCell>
                                                <TableCell className="font-bold text-rose-600">₹{txn.amount.toLocaleString()}</TableCell>
                                                <TableCell><Badge variant="outline">{txn.status}</Badge></TableCell>
                                                <TableCell>{new Date(txn.createdAt).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
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
                                        {academicYears.map(y => <SelectItem key={y._id} value={y._id}>{y.year}</SelectItem>)}
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

            {/* Student Details Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Fee History: {studentDetails?.student?.name}</DialogTitle>
                    </DialogHeader>
                    {detailsLoading ? (
                        <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg">
                                <div><span className="text-slate-500">Enrollment:</span> {studentDetails?.student?.enrollmentNo}</div>
                                <div><span className="text-slate-500">Program:</span> {studentDetails?.student?.department}</div>
                                <div><span className="text-slate-500">Semester:</span> {studentDetails?.student?.semester}</div>
                                <div><span className="text-slate-500">Email:</span> {studentDetails?.student?.email}</div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-bold flex items-center gap-2"><Receipt className="h-4 w-4" /> Transactions & Dues</h4>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Fee Component</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Paid</TableHead>
                                            <TableHead>Fine</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {studentDetails?.transactions?.map((txn: any) => (
                                            <TableRow key={txn.id}>
                                                <TableCell>
                                                    <div className="font-medium">{txn.feeName}</div>
                                                    <div className="text-[10px] text-slate-400 uppercase">{txn.type}</div>
                                                    {txn.transactionId && <div className="text-[10px] font-mono text-indigo-500">ID: {txn.transactionId}</div>}
                                                </TableCell>
                                                <TableCell>₹{txn.amount?.toLocaleString()}</TableCell>
                                                <TableCell className="text-green-600">₹{txn.paid?.toLocaleString()}</TableCell>
                                                <TableCell className="text-red-500">₹{txn.lateFees?.toLocaleString() || 0}</TableCell>
                                                <TableCell><Badge variant="outline" className="text-[10px]">{txn.status}</Badge></TableCell>
                                                <TableCell className="text-right">
                                                    {txn.status !== 'FULLY_PAID' && (
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline" 
                                                            className="h-7 text-[10px]"
                                                            onClick={() => {
                                                                setPaymentData({ ...paymentData, feeId: txn.feeId?._id || txn.feeId });
                                                                setIsRecordPaymentOpen(true);
                                                            }}
                                                        >
                                                            Pay
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Record Payment Dialog */}
            <Dialog open={isRecordPaymentOpen} onOpenChange={setIsRecordPaymentOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Record Manual Payment</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Amount Paid (₹)</label>
                                <Input 
                                    type="number" 
                                    value={paymentData.amountPaid} 
                                    onChange={(e) => setPaymentData({ ...paymentData, amountPaid: parseInt(e.target.value) || 0 })} 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Method</label>
                                <Select value={paymentData.paymentMethod} onValueChange={(v) => setPaymentData({ ...paymentData, paymentMethod: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CASH">Cash</SelectItem>
                                        <SelectItem value="CHEQUE">Cheque</SelectItem>
                                        <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Reference / Transaction ID</label>
                            <Input 
                                value={paymentData.transactionId} 
                                onChange={(e) => setPaymentData({ ...paymentData, transactionId: e.target.value })} 
                                placeholder="e.g. CHQ-123456"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Remarks</label>
                            <Input 
                                value={paymentData.remarks} 
                                onChange={(e) => setPaymentData({ ...paymentData, remarks: e.target.value })} 
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRecordPaymentOpen(false)}>Cancel</Button>
                        <Button onClick={handleRecordPayment} disabled={actionLoading || !paymentData.amountPaid}>
                            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Record Payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Fine Dialog */}
            <Dialog open={isBulkFineOpen} onOpenChange={setIsBulkFineOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Apply Fine to {selectedStudents.length} Students</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Fine Amount (₹)</label>
                            <Input 
                                type="number" 
                                value={bulkFineData.amount} 
                                onChange={(e) => setBulkFineData({ ...bulkFineData, amount: parseInt(e.target.value) || 0 })} 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Reason for Fine</label>
                            <Input 
                                value={bulkFineData.reason} 
                                onChange={(e) => setBulkFineData({ ...bulkFineData, reason: e.target.value })} 
                                placeholder="e.g. Late fee for Sem 2"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBulkFineOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleBulkFine} disabled={actionLoading || !bulkFineData.amount || !bulkFineData.reason}>
                            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Apply Fine
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
    const [paying, setPaying] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const res = await FeeService.getStudentFeeStatus(user.id);
            const data = res.data || res;
            setStatus(data);
        } catch (error) {
            console.error("Failed to fetch student fee status", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user?.id]);

    const handlePayment = async (feeId: string, amount: number) => {
        setPaying(feeId);
        try {
            const { orderId, currency, key } = await FeeService.initiateOnlinePayment({ feeId, amount });
            const options = {
                key,
                amount: amount * 100,
                currency,
                name: "EduCore ERP",
                description: "Student Fee Payment",
                order_id: orderId,
                handler: async (response: any) => {
                    try {
                        await FeeService.verifyPayment({
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            feeId
                        });
                        alert("Payment successful!");
                        fetchData();
                    } catch (err) {
                        alert("Payment verification failed");
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                },
                theme: { color: "#4f46e5" },
            };
            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to initiate payment");
        } finally {
            setPaying(null);
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

    const totalAssigned = status?.totalAmount || 0;
    const totalPaid = status?.totalPaid || 0;
    const totalPending = status?.pendingAmount || 0;
    const fees = status?.pendingFees || [];

    return (
        <div className="space-y-6">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
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
                        <p className="text-2xl font-bold mt-1">₹{totalAssigned.toLocaleString()}</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-green-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-green-700 font-medium">Total Paid</p>
                        <p className="text-2xl font-bold text-green-800 mt-1">₹{totalPaid.toLocaleString()}</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-orange-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-orange-700 font-medium">Pending Due</p>
                        <p className="text-2xl font-bold text-orange-800 mt-1">₹{totalPending.toLocaleString()}</p>
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
                                <TableHead className="text-right pr-6">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fees.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">No fee records found.</TableCell></TableRow>
                            ) : (
                                fees.map((txn: any) => (
                                    <TableRow key={txn._id}>
                                        <TableCell className="font-medium">{txn.feeId?.name || txn.remarks || 'Academic Fee'}</TableCell>
                                        <TableCell>₹{txn.amount.toLocaleString()}</TableCell>
                                        <TableCell className="text-green-600">₹{txn.amountPaid.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={txn.status === 'FULLY_PAID' ? 'default' : 'secondary'}>
                                                {txn.status?.replace('_', ' ') || 'PENDING'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(txn.dueDate).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right pr-6">
                                            {txn.status !== 'FULLY_PAID' && (
                                                <Button 
                                                    size="sm" 
                                                    onClick={() => handlePayment(txn.feeId?._id || txn.feeId, txn.amount - txn.amountPaid)}
                                                    disabled={paying === (txn.feeId?._id || txn.feeId)}
                                                >
                                                    {paying === (txn.feeId?._id || txn.feeId) ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Pay Now'}
                                                </Button>
                                            )}
                                        </TableCell>
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

    if (activeRole === "ACCOUNTANT" || activeRole === "UNIVERSITY_ADMIN" || activeRole === "SUPER_ADMIN" || activeRole === "FINANCE" || activeRole === "REGISTRAR") {
        return <AdminFeesView />;
    }

    return <StudentFeesView />;
}
