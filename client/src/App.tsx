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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/dashboard" component={Home} />
      <Route path="/students" component={StudentList} />
      <Route path="/attendance" component={Attendance} />
      <Route path="/fees" component={FeeManagement} />
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
