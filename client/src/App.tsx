import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Login from "@/pages/auth/Login";
import Home from "@/pages/dashboard/Home";
import StudentList from "@/pages/students/StudentList";
import Attendance from "@/pages/attendance/Attendance";
import FeeManagement from "@/pages/fees/FeeManagement";
import Academics from "@/pages/academics/Academics";
import Notices from "@/pages/communication/Notices";
import Transport from "@/pages/transport/Transport";
import Library from "@/pages/library/Library";
import Analytics from "@/pages/analytics/Analytics";
import Hostel from "@/pages/hostel/Hostel";
import Settings from "@/pages/settings/Settings";
import LMS from "@/pages/lms/LMS"; // Added LMS import

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/dashboard" component={Home} />
      <Route path="/students" component={StudentList} />
      <Route path="/attendance" component={Attendance} />
      <Route path="/fees" component={FeeManagement} />
      <Route path="/academics" component={Academics} />
      <Route path="/notices" component={Notices} />
      <Route path="/transport" component={Transport} />
      <Route path="/library" component={Library} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/hostel" component={Hostel} />
      <Route path="/settings" component={Settings} />
      <Route path="/lms" component={LMS} /> {/* Added LMS Route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
