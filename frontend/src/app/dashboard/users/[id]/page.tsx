"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { UserService, User } from "@/lib/services/user.service";
import { AcademicService } from "@/lib/services/academic.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ArrowLeft, Loader2, User as UserIcon, Mail,
    Briefcase, Building2, Calendar, Phone, Shield
} from "lucide-react";

export default function UserProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const [userRes, courseRes] = await Promise.all([
                    UserService.getById(id as string),
                    AcademicService.getCourses({ facultyId: id }) // Assuming facultyId filter works
                ]);
                setUser(userRes);
                setCourses(courseRes.data || []);
            } catch (error) {
                console.error("Failed to fetch user profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
    if (!user) return <div className="p-8 text-center text-red-500">User not found</div>;

    const isFaculty = user.role === 'FACULTY' || user.role === 'HOD';

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />Back to Staff List
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 border-0 shadow-sm">
                    <CardHeader className="text-center pb-2">
                        <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 border-2 border-slate-200">
                            <UserIcon className="h-10 w-10 text-slate-500" />
                        </div>
                        <CardTitle className="text-xl">{user.username}</CardTitle>
                        <Badge variant="secondary" className="mt-1">{user.role}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-4 mt-4">
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                            <Mail className="h-4 w-4" />
                            <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                            <Shield className="h-4 w-4" />
                            <span>Status: <strong className={user.isActive ? 'text-green-600' : 'text-red-600'}>{user.isActive ? 'Active' : 'Inactive'}</strong></span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                            <Calendar className="h-4 w-4" />
                            <span>Last Login: {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</span>
                        </div>
                    </CardContent>
                </Card>

                <div className="lg:col-span-2 space-y-6">
                    <Tabs defaultValue="overview">
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            {isFaculty && <TabsTrigger value="teaching">Teaching Assignments</TabsTrigger>}
                            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="mt-4">
                            <Card className="border-0 shadow-sm">
                                <CardHeader><CardTitle className="text-lg">Professional Summary</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <p className="text-xs text-slate-500 font-medium uppercase">Department</p>
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-blue-600" />
                                                <span className="font-medium">Computer Science & Engineering</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-slate-500 font-medium uppercase">Designation</p>
                                            <div className="flex items-center gap-2">
                                                <Briefcase className="h-4 w-4 text-blue-600" />
                                                <span className="font-medium">{user.role === 'HOD' ? 'Head of Department' : 'Senior Faculty'}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-slate-500 font-medium uppercase">Employee ID</p>
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-blue-600" />
                                                <span className="font-medium">EMP-{(user.id || (user as any)._id || '').toString().substring(0, 8).toUpperCase()}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-slate-500 font-medium uppercase">Contact No</p>
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-blue-600" />
                                                <span className="font-medium">+91 98765 43210</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {isFaculty && (
                            <TabsContent value="teaching" className="mt-4">
                                <Card className="border-0 shadow-sm">
                                    <CardHeader><CardTitle className="text-lg">Assigned Courses</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {courses.length > 0 ? courses.map((course) => (
                                                <div key={course._id} className="p-4 border rounded-lg flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-bold">{course.name}</h4>
                                                        <p className="text-xs text-slate-500">{course.code} | {course.credits} Credits</p>
                                                    </div>
                                                    <Badge variant="outline">{course.type}</Badge>
                                                </div>
                                            )) : <p className="text-center py-12 text-slate-500">No courses assigned to this faculty.</p>}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        )}

                        <TabsContent value="activity" className="mt-4">
                            <Card className="border-0 shadow-sm">
                                <CardContent className="py-12 text-center text-slate-500">
                                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p>Activity logs will be available here.</p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
