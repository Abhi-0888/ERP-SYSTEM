"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);

      // Check if user's university is in setup mode - redirect to onboarding
      const storedUser = localStorage.getItem("educore_user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData.universityStatus === "setup") {
          router.push("/onboarding");
          return;
        }
      }

      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { email: "superadmin@eduncore.com", role: "Super Admin" },
    { email: "admin@git.edu", role: "Uni Admin" },
    { email: "faculty_pro@git.edu", role: "Faculty" },
    { email: "alice@git.edu", role: "Student" },
  ];

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20"></div>

      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 relative z-10">
        {/* Left: Branding */}
        <div className="hidden lg:flex flex-col justify-center text-white p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold">E</span>
            </div>
            <span className="text-2xl font-bold">EduCore ERP</span>
          </div>

          <h1 className="text-4xl font-bold mb-4">
            Complete University
            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Management System
            </span>
          </h1>

          <p className="text-slate-400 text-lg mb-8">
            Manage students, faculty, courses, attendance, exams, fees, and more from one unified platform.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {["12 User Roles", "Real-time Analytics", "Mobile Responsive", "AI-Powered"].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-slate-300">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Login Form */}
        <div>
          <Card className="bg-white/95 backdrop-blur shadow-2xl border-0">
            <CardHeader className="text-center pb-4">
              <div className="lg:hidden mx-auto mb-4 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold text-white">E</span>
              </div>
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription>Sign in to your EduCore account</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="h-11"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-11"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              {/* Demo Accounts */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-slate-500 text-center mb-3">Demo Accounts (Password: password123)</p>
                <div className="grid grid-cols-3 gap-2">
                  {demoAccounts.map((account) => (
                    <Button
                      key={account.email}
                      variant="outline"
                      size="sm"
                      className="text-xs h-auto py-2 justify-start"
                      onClick={() => handleDemoLogin(account.email)}
                    >
                      {account.role}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div >
  );
}
