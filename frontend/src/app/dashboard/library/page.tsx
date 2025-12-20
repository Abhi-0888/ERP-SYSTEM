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

const mockMyBooks = [
    { id: "1", title: "Clean Code", author: "Robert C. Martin", issueDate: "2024-11-15", dueDate: "2024-12-15", status: "issued", fine: 0 },
    { id: "2", title: "Design Patterns", author: "Gang of Four", issueDate: "2024-11-01", dueDate: "2024-12-01", status: "overdue", fine: 100 },
];

// Librarian View
function LibrarianView() {
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
                    <h1 className="text-2xl font-bold">Library Management</h1>
                    <p className="text-slate-500">Manage books, issues, and returns</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm"><Plus className="h-4 w-4 mr-2" />Add Book</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Book</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Title</label>
                                    <Input placeholder="Book title" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Author</label>
                                        <Input placeholder="Author name" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">ISBN</label>
                                        <Input placeholder="ISBN" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Category</label>
                                        <Input placeholder="Category" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Copies</label>
                                        <Input type="number" placeholder="10" />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-4">
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                    <Button onClick={() => setIsDialogOpen(false)}>Add Book</Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Library className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total Books</p>
                            <p className="text-xl font-bold">{mockBooks.reduce((a, b) => a + b.total, 0)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <BookOpen className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Available</p>
                            <p className="text-xl font-bold">{mockBooks.reduce((a, b) => a + b.available, 0)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <BookMarked className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Issued</p>
                            <p className="text-xl font-bold">{mockBooks.reduce((a, b) => a + (b.total - b.available), 0)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Overdue</p>
                            <p className="text-xl font-bold">12</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search books by title, author, ISBN..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline"><Filter className="h-4 w-4 mr-2" />Filter</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Books Table */}
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Books Catalog</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Author</TableHead>
                                <TableHead>ISBN</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Available</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBooks.map((book) => (
                                <TableRow key={book.id}>
                                    <TableCell className="font-medium">{book.title}</TableCell>
                                    <TableCell>{book.author}</TableCell>
                                    <TableCell className="font-mono text-sm">{book.isbn}</TableCell>
                                    <TableCell><Badge variant="outline">{book.category}</Badge></TableCell>
                                    <TableCell>
                                        <span className={book.available > 0 ? "text-green-600" : "text-red-600"}>
                                            {book.available}/{book.total}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Button size="sm" variant="outline" disabled={book.available === 0}>
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

// Student View
function StudentView() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">My Library</h1>
                <p className="text-slate-500">View your borrowed books and fines</p>
            </div>

            {/* My Books */}
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BookMarked className="h-5 w-5" />
                        My Borrowed Books ({mockMyBooks.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {mockMyBooks.length > 0 ? (
                        <div className="space-y-3">
                            {mockMyBooks.map((book) => (
                                <div key={book.id} className={`p-4 rounded-lg ${book.status === "overdue" ? "bg-red-50" : "bg-slate-50"}`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{book.title}</p>
                                            <p className="text-sm text-slate-500">{book.author}</p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                Issued: {book.issueDate} • Due: {book.dueDate}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant={book.status === "overdue" ? "destructive" : "default"}>
                                                {book.status}
                                            </Badge>
                                            {book.fine > 0 && (
                                                <p className="text-sm text-red-600 mt-1">Fine: ₹{book.fine}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-slate-500 py-8">No books currently borrowed</p>
                    )}
                </CardContent>
            </Card>

            {/* Search Books */}
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Browse Library</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="Search for books..." className="pl-10" />
                    </div>
                    <div className="space-y-2">
                        {mockBooks.slice(0, 3).map((book) => (
                            <div key={book.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div>
                                    <p className="font-medium">{book.title}</p>
                                    <p className="text-sm text-slate-500">{book.author}</p>
                                </div>
                                <Badge variant={book.available > 0 ? "default" : "secondary"}>
                                    {book.available > 0 ? `${book.available} available` : "Unavailable"}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function LibraryPage() {
    const { activeRole } = useAuth();

    if (activeRole === "LIBRARIAN") {
        return <LibrarianView />;
    }

    return <StudentView />;
}
