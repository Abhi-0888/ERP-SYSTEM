import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Home, Bed, Users, AlertCircle, Plus } from "lucide-react";

const rooms = [
  { id: "r1", number: "101", block: "A", capacity: 4, occupied: 4, status: "full" },
  { id: "r2", number: "102", block: "A", capacity: 4, occupied: 3, status: "available" },
  { id: "r3", number: "103", block: "A", capacity: 4, occupied: 0, status: "maintenance" },
  { id: "r4", number: "201", block: "B", capacity: 2, occupied: 1, status: "available" },
  { id: "r5", number: "202", block: "B", capacity: 2, occupied: 2, status: "full" },
];

export default function Hostel() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">Hostel Management</h1>
          <p className="text-muted-foreground mt-1">Room allocation and occupancy tracking.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Allocate Room
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Capacity</p>
              <p className="text-2xl font-bold">250 Beds</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Occupancy</p>
              <p className="text-2xl font-bold text-green-700">85%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Maintenance</p>
              <p className="text-2xl font-bold text-red-700">3 Rooms</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Room Status</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search room no..." className="pl-9 h-9" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {rooms.map((room) => (
              <div key={room.id} className="p-4 rounded-lg border border-border bg-card hover:shadow-md transition-shadow cursor-pointer group">
                <div className="flex justify-between items-start mb-3">
                  <Badge variant="outline" className="font-mono">{room.block}-{room.number}</Badge>
                  <div className={`w-2 h-2 rounded-full ${
                    room.status === 'full' ? 'bg-red-500' :
                    room.status === 'available' ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                </div>
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Bed className="w-4 h-4" />
                  <span className="text-sm">{room.occupied}/{room.capacity}</span>
                </div>
                <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      room.status === 'full' ? 'bg-red-500' :
                      room.status === 'available' ? 'bg-green-500' : 'bg-yellow-500'
                    }`} 
                    style={{ width: `${(room.occupied / room.capacity) * 100}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
