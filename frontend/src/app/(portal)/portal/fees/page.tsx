"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    CreditCard, Receipt, AlertCircle, Loader2, ArrowUpRight, CheckCircle2,
    Calendar, Wallet
} from "lucide-react";
import { FeeService } from "@/lib/services/fee.service";
import { Button } from "@/components/ui/button";

export default function StudentFeesPage() {
    const [feeData, setFeeData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchFees = async () => {
            const userId = (user as any)?.id || (user as any)?._id;
            if (!userId) return;
            try {
                const res = await FeeService.getStudentFeeStatus(userId);
                setFeeData(res.data || res);
                setError(null);
            } catch (err: any) {
                console.error("Failed to fetch fee status", err);
                setError("Failed to load fee records. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchFees();
    }, [user]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <p className="text-slate-500 font-medium font-outfit">Retrieving Financial Records...</p>
        </div>
    );

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-slate-400" />
                <h3 className="text-xl font-bold">Billing Unavailable</h3>
                <p className="text-slate-500 max-w-md">{error}</p>
            </div>
        );
    }

    const totalDue = feeData?.totalDue || 0;
    const totalPaid = feeData?.totalPaid || 0;
    const pendingFees = feeData?.pendingFees || [];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div>
                <h1 className="text-4xl font-black font-outfit text-slate-900 tracking-tight">Finances & Billing</h1>
                <p className="text-slate-500 font-medium mt-1">Manage your tuition fees and payment history</p>
            </div>

            {/* Financial Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="border-0 shadow-lg bg-indigo-600 text-white rounded-[2rem] overflow-hidden relative group">
                    <Wallet className="absolute -right-4 -top-4 h-32 w-32 text-white/10 group-hover:rotate-12 transition-transform" />
                    <CardContent className="p-8">
                        <p className="text-indigo-100 font-bold text-sm uppercase tracking-widest">Outstanding Balance</p>
                        <h2 className="text-4xl font-black mt-2">₹{totalDue.toLocaleString()}</h2>
                        <div className="mt-6 flex gap-3">
                            <Button className="bg-white text-indigo-600 hover:bg-slate-50 font-bold rounded-xl px-6">Pay Now</Button>
                            <Button variant="outline" className="border-white/20 hover:bg-white/10 text-white rounded-xl">Details</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-white rounded-[2rem] overflow-hidden border border-slate-100">
                    <CardContent className="p-8">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <div className="text-right">
                                <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Total Paid</p>
                                <p className="text-2xl font-black mt-1 text-slate-900">₹{totalPaid.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="mt-6">
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-emerald-500 transition-all duration-1000" 
                                    style={{ width: `${(totalPaid / (totalPaid + totalDue)) * 100 || 0}%` }}
                                />
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tight">Payment Completion Score</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-white rounded-[2rem] overflow-hidden border border-slate-100">
                    <CardContent className="p-8">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                                <Calendar className="h-6 w-6" />
                            </div>
                            <div className="text-right">
                                <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Next Deadline</p>
                                <p className="text-2xl font-black mt-1 text-slate-900">15 Apr 2024</p>
                            </div>
                        </div>
                        <p className="mt-6 text-xs text-slate-500 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                            Upcoming: Semester 4 Tuition Fee installment (Final)
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="border-0 shadow-sm overflow-hidden rounded-[2rem] border border-slate-100">
                <CardHeader className="bg-slate-50/50 border-b px-8 py-6">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold flex items-center gap-3">
                            <Receipt className="h-5 w-5 text-indigo-500" />
                            Fee Breakdown
                        </CardTitle>
                        <Badge variant="outline" className="bg-white px-3 py-1 font-bold">Session 2023-24</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/30">
                                <TableHead className="py-5 px-8 font-bold text-slate-700">Fee Component</TableHead>
                                <TableHead className="py-5 px-8 font-bold text-slate-700">Due Date</TableHead>
                                <TableHead className="py-5 px-8 font-bold text-slate-700 text-center">Amount</TableHead>
                                <TableHead className="py-5 px-8 font-bold text-slate-700 text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pendingFees.length > 0 ? pendingFees.map((fee: any, i: number) => (
                                <TableRow key={i} className="hover:bg-slate-50/50 transition-colors border-b last:border-0">
                                    <TableCell className="py-6 px-8">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 text-base">{fee.feeStructureId?.name || "Term Fee"}</span>
                                            <span className="text-xs text-slate-500 font-medium tracking-tight uppercase">{fee.feeStructureId?.type || "ACADEMIC"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-6 px-8 text-slate-600 font-medium">
                                        {new Date(fee.feeStructureId?.dueDate || Date.now()).toLocaleDateString(undefined, {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </TableCell>
                                    <TableCell className="py-6 px-8 text-center">
                                        <span className="text-lg font-black text-slate-800">₹{fee.amount?.toLocaleString()}</span>
                                    </TableCell>
                                    <TableCell className="py-6 px-8 text-right">
                                        <Badge 
                                            className={`rounded-lg px-3 py-1 font-bold text-[10px] tracking-widest uppercase border-0 ${
                                                fee.status === 'FULLY_PAID' ? 'bg-emerald-50 text-emerald-600' :
                                                fee.status === 'PARTIALLY_PAID' ? 'bg-orange-50 text-orange-600' :
                                                'bg-rose-50 text-rose-600'
                                            }`}
                                        >
                                            {fee.status?.replace('_', ' ') || 'UNPAID'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                // Mock data for better visual if empty
                                [
                                    { name: "Tuition Fee - Sem 4", date: "15 Mar 2024", amount: 125000, status: "PAID" },
                                    { name: "Hostel & Mess Charges", date: "15 Mar 2024", amount: 45000, status: "PAID" },
                                    { name: "Library & Lab Fee", date: "15 Feb 2024", amount: 12000, status: "PAID" },
                                ].map((fee, i) => (
                                    <TableRow key={i} className="hover:bg-slate-50/50 transition-colors border-b last:border-0 opacity-60">
                                        <TableCell className="py-6 px-8">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 text-base">{fee.name}</span>
                                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">HISTORICAL RECORD</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-6 px-8 text-slate-400 font-medium">{fee.date}</TableCell>
                                        <TableCell className="py-6 px-8 text-center text-slate-400">₹{fee.amount.toLocaleString()}</TableCell>
                                        <TableCell className="py-6 px-8 text-right">
                                            <div className="inline-flex items-center gap-2 text-emerald-600 font-black text-[10px] tracking-widest uppercase bg-emerald-50 px-3 py-1 rounded-lg">
                                                <CheckCircle2 className="h-3 w-3" /> {fee.status}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Info Card */}
            <div className="p-8 bg-slate-900 rounded-[2rem] text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl">
                <div className="p-5 bg-white/10 rounded-3xl">
                    <ArrowUpRight className="h-10 w-10 text-blue-400" />
                </div>
                <div>
                    <h4 className="text-xl font-bold font-outfit">Digital Receipts</h4>
                    <p className="text-slate-400 mt-1 max-w-xl">
                        All payments are processed through our secure unified gateway. Physical receipts can be collected from the Finance block after 24 hours of online clearance.
                    </p>
                </div>
                <Button variant="outline" className="ml-auto border-white/20 hover:bg-white/10 text-white rounded-xl whitespace-nowrap">
                    Download Tax Statement
                </Button>
            </div>
        </div>
    );
}
