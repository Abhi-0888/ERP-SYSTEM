import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { transportRoutes } from "@/lib/mock-data";
import { Bus, MapPin, Navigation, Users, Phone, AlertTriangle, Clock } from "lucide-react";

export default function Transport() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">Transport</h1>
          <p className="text-muted-foreground mt-1">Track fleet, routes, and student boarding.</p>
        </div>
        <Button className="gap-2">
          <Navigation className="w-4 h-4" />
          Live Tracking
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4 mb-6">
        <Card className="bg-primary text-white border-none shadow-lg shadow-primary/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm opacity-80">Total Fleet</p>
              <p className="text-2xl font-bold">12 Buses</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">On Time</p>
              <p className="text-2xl font-bold text-green-700">10</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Delayed</p>
              <p className="text-2xl font-bold text-yellow-700">1</p>
            </div>
          </CardContent>
        </Card>
         <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary text-muted-foreground flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Students Boarded</p>
              <p className="text-2xl font-bold">450/480</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Map Placeholder */}
        <div className="md:col-span-2">
          <Card className="h-[500px] overflow-hidden border-none shadow-sm relative group">
            <div className="absolute inset-0 bg-muted/20 flex items-center justify-center text-muted-foreground">
              {/* In a real app, integrate Google Maps/Leaflet here */}
              <div className="text-center space-y-2">
                <MapPin className="w-12 h-12 mx-auto opacity-50" />
                <p>Interactive Map View</p>
              </div>
            </div>
            {/* Mock Map Image */}
            <img 
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
              className="w-full h-full object-cover opacity-40"
              alt="Map"
            />
            
            {/* Floating Route Cards on Map */}
            <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 gap-4">
              {transportRoutes.slice(0, 2).map(route => (
                 <div key={route.id} className="bg-background/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-border flex items-center justify-between">
                   <div>
                     <div className="font-bold text-sm">{route.routeNo} - {route.vehicleNo}</div>
                     <div className="text-xs text-muted-foreground">{route.driver}</div>
                   </div>
                   <Badge variant={route.status === 'on-time' ? 'default' : 'destructive'} className="h-6">
                     {route.status}
                   </Badge>
                 </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Route List */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg px-1">Active Routes</h3>
          {transportRoutes.map((route) => (
            <Card key={route.id} className="border-none shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="font-bold">{route.routeNo}</Badge>
                  <Badge variant={
                    route.status === 'on-time' ? 'default' : 
                    route.status === 'delayed' ? 'secondary' : 'destructive'
                  } className="capitalize">
                    {route.status}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                   <div className="flex items-center gap-2 text-muted-foreground">
                     <Users className="w-4 h-4" />
                     <span>{route.students} / {route.capacity} Students</span>
                   </div>
                   <div className="flex items-center gap-2 text-muted-foreground">
                     <Phone className="w-4 h-4" />
                     <span>{route.driver}</span>
                   </div>
                </div>

                <Button variant="ghost" className="w-full text-xs h-8 border border-border">
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
