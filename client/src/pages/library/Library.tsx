import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { books } from "@/lib/mock-data";
import { BookOpen, Search, Filter, Plus, QrCode } from "lucide-react";

export default function Library() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">Library</h1>
          <p className="text-muted-foreground mt-1">Manage catalog, issues, and returns.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <QrCode className="w-4 h-4" /> Scan Book
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Add Book
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm mb-6">
        <div className="p-4 border-b border-border flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by title, author, or ISBN..." className="pl-9 bg-secondary/30" />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" /> Filter
          </Button>
        </div>
        <CardContent className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b border-border">
              <tr>
                <th className="px-6 py-4">Book Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">ISBN</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {books.map((book) => (
                <tr key={book.id} className="group hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-14 bg-secondary rounded border border-border flex items-center justify-center text-muted-foreground">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium group-hover:text-primary transition-colors">{book.title}</div>
                        <div className="text-xs text-muted-foreground">{book.author}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="font-normal">{book.category}</Badge>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                    {book.isbn}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={
                      book.status === 'available' ? 'default' : 
                      book.status === 'issued' ? 'secondary' : 'outline'
                    } className="capitalize">
                      {book.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/10">
                      {book.status === 'available' ? 'Issue' : 'Return'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
