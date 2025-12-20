"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Clock, Loader2, BookMarked, History } from "lucide-react";
import { LibraryService } from "@/lib/services/library.service";
import { toast } from "sonner";

export default function LibraryPage() {
    const { user } = useAuth();
    const [books, setBooks] = useState<any[]>([]);
    const [myBooks, setMyBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const bookRes = await LibraryService.getBooks();
                setBooks(bookRes.data || []);

                if (user?.id) {
                    const myRes = await LibraryService.getIssuedBooks(user.id);
                    setMyBooks(myRes || []);
                }
            } catch (error) {
                console.error("Failed to load library data:", error);
                toast.error("Failed to load library resources");
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [user?.id]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Knowledge Hub</h1>
                    <p className="text-slate-500">Access thousands of digital and physical resources.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-0 shadow-sm rounded-2xl border border-slate-100 overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center justify-between py-4">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-indigo-500" />
                                Catalog Explorer
                            </CardTitle>
                            <div className="relative max-w-[240px] w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                <Input placeholder="Search titles, authors..." className="pl-9 h-8 text-xs rounded-lg" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            {loading ? (
                                <div className="flex justify-center p-12 text-slate-400"><Loader2 className="h-8 w-8 animate-spin" /></div>
                            ) : books.length === 0 ? (
                                <div className="text-center py-12 text-slate-400 italic">No books found in the catalog.</div>
                            ) : (
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {books.map((book) => (
                                        <div key={book._id} className="p-4 bg-white border border-slate-100 rounded-xl hover:border-indigo-200 transition-all flex gap-4">
                                            <div className="w-16 h-20 bg-slate-50 rounded shadow-sm flex-shrink-0 flex items-center justify-center">
                                                <BookOpen className="h-8 w-8 text-slate-300" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-slate-900 truncate text-sm">{book.title}</h3>
                                                <p className="text-xs text-slate-500 truncate">{book.author}</p>
                                                <div className="mt-2">
                                                    <Badge variant={book.available > 0 ? "default" : "secondary"} className="text-[10px] h-4">
                                                        {book.available > 0 ? `${book.available} Available` : "Checked Out"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-0 shadow-sm rounded-2xl border border-slate-100 overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-bold">My Bookshelf</CardTitle>
                            <History className="h-4 w-4 text-slate-400" />
                        </CardHeader>
                        <CardContent className="p-6">
                            {myBooks.length > 0 ? (
                                <div className="space-y-4">
                                    {myBooks.map((item) => (
                                        <div key={item._id} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
                                            <div className="p-2 bg-white rounded-lg shadow-sm h-fit">
                                                <BookMarked className="h-4 w-4 text-indigo-500" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-xs text-slate-900">{item.bookId?.title}</p>
                                                <div className="flex items-center gap-1 mt-1 text-[10px] text-orange-600 font-bold">
                                                    <Clock className="h-3 w-3" />
                                                    Due {new Date(item.dueDate).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <BookMarked className="h-6 w-6 text-slate-300" />
                                    </div>
                                    <p className="text-sm text-slate-500">No active borrowings.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm rounded-2xl bg-indigo-600 text-white p-6 relative overflow-hidden">
                        <div className="absolute -right-6 -bottom-6 h-32 w-32 bg-white/10 rounded-full blur-2xl" />
                        <h4 className="text-lg font-bold">Extended Access</h4>
                        <p className="text-indigo-100 text-xs mt-2 leading-relaxed">
                            Graduate students can request 24/7 access to the North Wing research labs.
                        </p>
                        <Button variant="outline" className="mt-4 border-white/20 hover:bg-white/10 text-white w-full rounded-xl">
                            Request Permit
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
