import { QrCode, X, Share2, Download, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { currentUser } from "@/lib/mock-data";

export function DigitalIDCard() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <QrCode className="w-4 h-4" />
          Digital ID
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[380px] p-0 overflow-hidden bg-transparent border-none shadow-none">
        <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-border/50 relative">
          {/* Header/Background Design */}
          <div className="h-32 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="absolute top-4 left-4 text-white font-display font-bold text-lg flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              EduCore High
            </div>
          </div>

          {/* Profile Section */}
          <div className="px-6 pb-6 relative">
            <div className="flex justify-center -mt-16 mb-4">
              <div className="p-1.5 bg-white dark:bg-slate-900 rounded-full">
                <Avatar className="w-32 h-32 border-4 border-blue-50 dark:border-slate-800">
                  <AvatarImage src={currentUser.avatar} className="object-cover" />
                  <AvatarFallback className="text-2xl">AM</AvatarFallback>
                </Avatar>
              </div>
            </div>

            <div className="text-center space-y-1 mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{currentUser.name}</h2>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">{currentUser.role}</p>
              <Badge className="mt-2 bg-green-100 text-green-700 hover:bg-green-200 border-none">Active</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase">ID Number</p>
                <p className="font-mono font-medium">EDU-2024-882</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-xs text-muted-foreground uppercase">Valid Thru</p>
                <p className="font-medium">May 2026</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase">Blood Group</p>
                <p className="font-medium">O+</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-xs text-muted-foreground uppercase">DOB</p>
                <p className="font-medium">12 Aug 2008</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
              <div className="bg-white p-2 rounded-md shadow-sm">
                <QrCode className="w-32 h-32 text-slate-900" strokeWidth={1.5} />
              </div>
              <p className="text-xs text-muted-foreground">Scan to verify identity</p>
            </div>

            <div className="flex gap-3 mt-6">
              <Button className="flex-1 gap-2" variant="outline">
                <Share2 className="w-4 h-4" /> Share
              </Button>
              <Button className="flex-1 gap-2">
                <Download className="w-4 h-4" /> Save
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
