"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
    BookOpen, Search, Plus, Filter, Download, Library, BookMarked, AlertCircle, Loader2
} from "lucide-react";
import { LibraryService } from "@/lib/services/library.service";
import { EmptyState } from "@/components/empty-state";
import { toast } from "sonner";

export default function LibrarianDashboard() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [books, setBooks] = useState<any[]>([]);
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [booksRes, reportRes] = await Promise.all([
                    LibraryService.getBooks({ search: searchQuery }),
                    LibraryService.getAvailabilityReport()
                ]);
                setBooks(booksRes.data || []);
                setReport(reportRes);
            } catch (error) {
                console.error("Failed to load library data:", error);
                toast.error("Failed to load repository data");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [searchQuery]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                <p className="text-slate-500 font-medium">Indexing repository...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Library Central</h1>
                    <p className="text-slate-500">Inventory control and circulation management.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl bg-white"><Download className="h-4 w-4 mr-2" />Ops Report</Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100">
                                <Plus className="h-4 w-4 mr-2" />Acquire Resource
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-2xl border-slate-100">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold">New Catalog Entry</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Title</label>
                                    <Input placeholder="Book title" className="rounded-xl" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Author</label>
                                        <Input placeholder="Author name" className="rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">ISBN</label>
                                        <Input placeholder="ISBN" className="rounded-xl" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Category</label>
                                        <Input placeholder="Category" className="rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Initial Stock</label>
                                        <Input type="number" placeholder="10" className="rounded-xl" />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-4">
                                    <Button variant="outline" className="rounded-xl" onClick={() => setIsDialogOpen(false)}>Discard</Button>
                                    <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsDialogOpen(false)}>Catalog Item</Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm bg-blue-50/50 border border-blue-100 relative overflow-hidden">
                    <CardContent className="p-6">
                        <Library className="h-10 w-10 text-blue-500 mb-2 opacity-10 absolute -right-2 -bottom-2 scale-150 rotate-12" />
                        <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">Repository Size</p>
                        <p className="text-3xl font-black text-slate-900 mt-1">{report?.summary?.totalCopies || 0}</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-emerald-50/50 border border-emerald-100 relative overflow-hidden">
                    <CardContent className="p-6">
                        <BookOpen className="h-10 w-10 text-emerald-500 mb-2 opacity-10 absolute -right-2 -bottom-2 scale-150 rotate-12" />
                        <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest">Ready for Issue</p>
                        <p className="text-3xl font-black text-slate-900 mt-1">{report?.summary?.availableCopies || 0}</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-orange-50/50 border border-orange-100 relative overflow-hidden">
                    <CardContent className="p-6">
                        <BookMarked className="h-10 w-10 text-orange-500 mb-2 opacity-10 absolute -right-2 -bottom-2 scale-150 rotate-12" />
                        <p className="text-sm font-bold text-orange-600 uppercase tracking-widest">Active Circulation</p>
                        <p className="text-3xl font-black text-slate-900 mt-1">{report?.summary?.issuedCopies || 0}</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-red-50/50 border border-red-100 relative overflow-hidden">
                    <CardContent className="p-6">
                        <AlertCircle className="h-10 w-10 text-red-500 mb-2 opacity-10 absolute -right-2 -bottom-2 scale-150 rotate-12" />
                        <p className="text-sm font-bold text-red-600 uppercase tracking-widest">Inventory Health</p>
                        <p className="text-3xl font-black text-slate-900 mt-1">
                            {report?.summary?.totalBooks > 0 ? "Good" : "N/A"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden border border-slate-100">
                <CardHeader className="bg-slate-50/50 border-b">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <CardTitle className="text-lg font-bold">Comprehensive Catalog</CardTitle>
                        <div className="relative max-w-sm w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Filter by metadata..."
                                className="pl-10 h-10 rounded-xl bg-white border-slate-200"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {books.length === 0 ? (
                        <div className="p-12">
                            <EmptyState
                                icon={Library}
                                title="No resources found"
                                description="Your library catalog is empty or no matches found for your search."
                                actionLabel="Acquire First Resource"
                                onAction={() => setIsDialogOpen(true)}
                            />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/30 border-0">
                                    <TableHead className="font-bold h-12">Resource Title</TableHead>
                                    <TableHead className="font-bold h-12">Contributor</TableHead>
                                    <TableHead className="font-bold h-12">Identifier</TableHead>
                                    <TableHead className="font-bold h-12">Genre</TableHead>
                                    <TableHead className="font-bold h-12">Liquidity</TableHead>
                                    <TableHead className="font-bold h-12 text-right">Ops</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {books.map((book) => (
                                    <TableRow key={book._id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                                        <TableCell className="font-bold text-slate-900">{book.title}</TableCell>
                                        <TableCell className="text-slate-600">{book.author}</TableCell>
                                        <TableCell className="font-mono text-xs text-slate-400">{book.isbn}</TableCell>
                                        <TableCell><Badge variant="outline" className="rounded-lg bg-slate-50 border-slate-200 text-slate-600">{book.category}</Badge></TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${book.availableCopies > 3 ? 'bg-emerald-500' : book.availableCopies > 0 ? 'bg-orange-500' : 'bg-red-500'}`}
                                                        style={{ width: `${(book.availableCopies / book.totalCopies) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-slate-500">{book.availableCopies}/{book.totalCopies}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" variant="ghost" className="rounded-lg hover:bg-blue-50 hover:text-blue-600 font-bold" disabled={book.availableCopies === 0}>
                                                Issue
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
