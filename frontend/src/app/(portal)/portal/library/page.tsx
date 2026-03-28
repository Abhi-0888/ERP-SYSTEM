"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Library, Book, History, AlertCircle, Loader2, BookOpen, Clock, Search
} from "lucide-react";
import { LibraryService } from "@/lib/services/library.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function StudentLibraryPage() {
    const [issuedBooks, setIssuedBooks] = useState<any[]>([]);
    const [fine, setFine] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchLibraryData = async () => {
            const userId = (user as any)?.id || (user as any)?._id;
            if (!userId) return;
            try {
                const [booksRes, fineRes] = await Promise.all([
                    LibraryService.getIssuedBooks(userId),
                    LibraryService.getUserFine(userId)
                ]);
                setIssuedBooks(booksRes.data || booksRes || []);
                setFine(fineRes.data || fineRes);
                setError(null);
            } catch (err: any) {
                console.error("Failed to fetch library data", err);
                setError("Failed to load library records. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchLibraryData();
    }, [user]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <p className="text-slate-500 font-medium font-outfit">Accessing Library Catalog...</p>
        </div>
    );

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-slate-400" />
                <h3 className="text-xl font-bold">Library System Offline</h3>
                <p className="text-slate-500 max-w-md">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black font-outfit text-slate-900 tracking-tight">The Library Shell</h1>
                    <p className="text-slate-500 font-medium mt-1">Research, borrow, and track your literary assets</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="Search catalog..." className="pl-10 rounded-xl" />
                    </div>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold">Search</Button>
                </div>
            </div>

            {/* Library Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-0 shadow-sm bg-white rounded-[2rem] border-b-4 border-b-indigo-500">
                    <CardContent className="p-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Active Borrows</p>
                                <p className="text-3xl font-black text-slate-900">{issuedBooks.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-white rounded-[2rem] border-b-4 border-b-rose-500">
                    <CardContent className="p-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                                <AlertCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Outstanding Fine</p>
                                <p className="text-3xl font-black text-rose-600">₹{fine?.totalFine || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-white rounded-[2rem] border-b-4 border-b-emerald-500">
                    <CardContent className="p-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                <History className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Books Returned</p>
                                <p className="text-3xl font-black text-slate-900">14</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Issued Books Table */}
            <Card className="border-0 shadow-sm overflow-hidden rounded-[2rem] border border-slate-100">
                <CardHeader className="bg-slate-50/50 border-b px-8 py-6">
                    <CardTitle className="text-lg font-bold flex items-center gap-3">
                        <Book className="h-5 w-5 text-indigo-500" />
                        Currently Issued Items
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/30">
                                <TableHead className="py-5 px-8 font-bold text-slate-700">Book Details</TableHead>
                                <TableHead className="py-5 px-8 font-bold text-slate-700">Issue Date</TableHead>
                                <TableHead className="py-5 px-8 font-bold text-slate-700 text-center">Due Date</TableHead>
                                <TableHead className="py-5 px-8 font-bold text-slate-700 text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {issuedBooks.length > 0 ? issuedBooks.map((item: any, i: number) => (
                                <TableRow key={i} className="hover:bg-slate-50/50 transition-colors border-b last:border-0">
                                    <TableCell className="py-6 px-8">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 text-base">{item.bookId?.title || "Academic Resource"}</span>
                                            <span className="text-xs text-slate-500 font-medium tracking-tight uppercase">ISBN: {item.bookId?.isbn || "N/A"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-6 px-8 text-slate-600 font-medium">
                                        {new Date(item.issueDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="py-6 px-8 text-center">
                                        <div className="inline-flex flex-col items-center">
                                            <span className="text-base font-bold text-slate-800">{new Date(item.dueDate).toLocaleDateString()}</span>
                                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Return By</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-6 px-8 text-right">
                                        <Badge 
                                            className={`rounded-lg px-3 py-1 font-bold text-[10px] tracking-widest uppercase border-0 ${
                                                new Date(item.dueDate) < new Date() ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                                            }`}
                                        >
                                            {new Date(item.dueDate) < new Date() ? 'OVERDUE' : 'ACTIVE'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-20 text-center">
                                        <div className="max-w-xs mx-auto space-y-4">
                                            <Library className="h-12 w-12 text-slate-200 mx-auto" />
                                            <p className="text-slate-900 font-bold">No active issues found</p>
                                            <p className="text-slate-500 text-xs">Search our digital catalog to find your next academic resource.</p>
                                            <Button variant="outline" className="rounded-xl">Browse Catalog</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pro-tip Card */}
            <div className="p-8 bg-indigo-50 rounded-[2rem] border border-indigo-100 flex items-start gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 scale-150 opacity-10 rotate-12">
                    <Clock className="h-24 w-24 text-indigo-600" />
                </div>
                <div className="p-4 bg-indigo-600 text-white rounded-2xl shrink-0">
                    <Clock className="h-6 w-6" />
                </div>
                <div>
                    <h4 className="text-lg font-black font-outfit text-indigo-900 uppercase tracking-tight">Auto-Renewal Notice</h4>
                    <p className="text-indigo-700/80 text-sm mt-1 max-w-2xl font-medium">
                        EduCore Library items are automatically renewed once if no reserve holds exist. Ensure you return overdue items within 3 days of secondary notice to avoid suspension of borrowing privileges.
                    </p>
                </div>
            </div>
        </div>
    );
}
