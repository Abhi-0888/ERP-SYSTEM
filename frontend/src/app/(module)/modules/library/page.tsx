"use client";

import { useState } from "react";
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
    BookOpen, Search, Plus, Filter, Download, Library, BookMarked, AlertCircle
} from "lucide-react";

const mockBooks = [
    { id: "1", title: "Introduction to Algorithms", author: "Thomas H. Cormen", isbn: "978-0262033848", category: "Computer Science", total: 10, available: 6 },
    { id: "2", title: "Clean Code", author: "Robert C. Martin", isbn: "978-0132350884", category: "Software Engineering", total: 8, available: 3 },
    { id: "3", title: "Design Patterns", author: "Gang of Four", isbn: "978-0201633610", category: "Software Engineering", total: 5, available: 2 },
    { id: "4", title: "Database Systems", author: "Silberschatz", isbn: "978-0073523323", category: "Databases", total: 12, available: 8 },
    { id: "5", title: "Computer Networks", author: "Tanenbaum", isbn: "978-0132126953", category: "Networking", total: 7, available: 4 },
];

export default function LibrarianDashboard() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const filteredBooks = mockBooks.filter(
        (b) => b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.author.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                        <p className="text-3xl font-black text-slate-900 mt-1">{mockBooks.reduce((a, b) => a + b.total, 0)}</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-emerald-50/50 border border-emerald-100 relative overflow-hidden">
                    <CardContent className="p-6">
                        <BookOpen className="h-10 w-10 text-emerald-500 mb-2 opacity-10 absolute -right-2 -bottom-2 scale-150 rotate-12" />
                        <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest">Ready for Issue</p>
                        <p className="text-3xl font-black text-slate-900 mt-1">{mockBooks.reduce((a, b) => a + b.available, 0)}</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-orange-50/50 border border-orange-100 relative overflow-hidden">
                    <CardContent className="p-6">
                        <BookMarked className="h-10 w-10 text-orange-500 mb-2 opacity-10 absolute -right-2 -bottom-2 scale-150 rotate-12" />
                        <p className="text-sm font-bold text-orange-600 uppercase tracking-widest">Active Circulation</p>
                        <p className="text-3xl font-black text-slate-900 mt-1">{mockBooks.reduce((a, b) => a + (b.total - b.available), 0)}</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-red-50/50 border border-red-100 relative overflow-hidden">
                    <CardContent className="p-6">
                        <AlertCircle className="h-10 w-10 text-red-500 mb-2 opacity-10 absolute -right-2 -bottom-2 scale-150 rotate-12" />
                        <p className="text-sm font-bold text-red-600 uppercase tracking-widest">Delinquent Returns</p>
                        <p className="text-3xl font-black text-slate-900 mt-1">12</p>
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
                            {filteredBooks.map((book) => (
                                <TableRow key={book.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                                    <TableCell className="font-bold text-slate-900">{book.title}</TableCell>
                                    <TableCell className="text-slate-600">{book.author}</TableCell>
                                    <TableCell className="font-mono text-xs text-slate-400">{book.isbn}</TableCell>
                                    <TableCell><Badge variant="outline" className="rounded-lg bg-slate-50 border-slate-200 text-slate-600">{book.category}</Badge></TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${book.available > 3 ? 'bg-emerald-500' : book.available > 0 ? 'bg-orange-500' : 'bg-red-500'}`}
                                                    style={{ width: `${(book.available / book.total) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-slate-500">{book.available}/{book.total}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" variant="ghost" className="rounded-lg hover:bg-blue-50 hover:text-blue-600 font-bold" disabled={book.available === 0}>
                                            Issue
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
