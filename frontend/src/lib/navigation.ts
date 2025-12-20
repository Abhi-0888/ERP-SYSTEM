import { Role, NavGroup } from "./types";

export type ShellType = "platform" | "university" | "module" | "portal";

export const SHELL_CONFIG: Record<ShellType, Role[]> = {
    platform: ["SUPER_ADMIN"],
    university: ["UNIVERSITY_ADMIN", "PRINCIPAL", "REGISTRAR", "HOD", "FACULTY", "ACADEMIC_COORDINATOR", "EXAM_CONTROLLER", "FINANCE"],
    module: ["LIBRARIAN", "ACCOUNTANT", "HOSTEL_WARDEN", "TRANSPORT_MANAGER", "PLACEMENT_OFFICER", "PLACEMENT_CELL"],
    portal: ["STUDENT", "PARENT"],
};

// Map roles to their primary workspace base URL
export const ROLE_WORKSPACE: Record<Role, string> = {
    SUPER_ADMIN: "/super-admin",
    STUDENT: "/portal",
    PARENT: "/portal",
    // All others use dashboard
    UNIVERSITY_ADMIN: "/dashboard",
    PRINCIPAL: "/dashboard",
    REGISTRAR: "/dashboard",
    HOD: "/dashboard",
    FACULTY: "/dashboard",
    ACADEMIC_COORDINATOR: "/dashboard",
    EXAM_CONTROLLER: "/dashboard",
    FINANCE: "/dashboard",
    LIBRARIAN: "/dashboard",
    ACCOUNTANT: "/dashboard",
    HOSTEL_WARDEN: "/dashboard",
    TRANSPORT_MANAGER: "/dashboard",
    PLACEMENT_OFFICER: "/dashboard",
    PLACEMENT_CELL: "/dashboard",
};

// Role-based navigation configuration
export const roleNavigation: Record<Role, NavGroup[]> = {
    SUPER_ADMIN: [
        {
            title: "Governance",
            items: [
                { title: "Dashboard", href: "/super-admin", icon: "LayoutDashboard" },
                { title: "Universities", href: "/super-admin/universities", icon: "Building2" },
                { title: "Subscriptions", href: "/super-admin/subscriptions", icon: "CreditCard" },
            ],
        },
        {
            title: "Access Control",
            items: [
                { title: "Global Users", href: "/super-admin/users", icon: "Users" },
                { title: "Security Center", href: "/super-admin/security", icon: "ShieldCheck" },
                { title: "Permission Overrides", href: "/super-admin/overrides", icon: "Key" },
            ],
        },
        {
            title: "Platform",
            items: [
                { title: "Modules", href: "/super-admin/modules", icon: "Box" },
                { title: "System Settings", href: "/super-admin/settings", icon: "Settings" },
                { title: "Support Hub", href: "/super-admin/support", icon: "LifeBuoy" },
            ],
        },
    ],

    UNIVERSITY_ADMIN: [
        {
            title: "Overview",
            items: [
                { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
            ],
        },
        {
            title: "Academics",
            items: [
                { title: "Departments", href: "/dashboard/departments", icon: "Building" },
                { title: "Programs", href: "/dashboard/programs", icon: "GraduationCap" },
                { title: "Courses", href: "/dashboard/courses", icon: "BookOpen" },
                { title: "Students", href: "/dashboard/students", icon: "Users" },
                { title: "Faculty", href: "/dashboard/faculty", icon: "UserCheck" },
                { title: "Enrollments", href: "/dashboard/enrollments", icon: "ClipboardList" },
                { title: "Academic Years", href: "/dashboard/academic-years", icon: "Calendar" },
            ],
        },
        {
            title: "Operations",
            items: [
                { title: "Attendance", href: "/dashboard/attendance", icon: "ClipboardList" },
                { title: "Timetable", href: "/dashboard/timetable", icon: "Calendar" },
                { title: "Exams", href: "/dashboard/exams", icon: "FileText" },
            ],
        },
        {
            title: "Finance",
            items: [
                { title: "Fees", href: "/dashboard/fees", icon: "CreditCard" },
            ],
        },
        {
            title: "Reports",
            items: [
                { title: "Analytics", href: "/dashboard/reports", icon: "BarChart3" },
            ],
        },
    ],

    PRINCIPAL: [
        {
            title: "Overview",
            items: [
                { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
            ],
        },
        {
            title: "Academics",
            items: [
                { title: "Departments", href: "/dashboard/departments", icon: "Building" },
                { title: "Programs", href: "/dashboard/programs", icon: "GraduationCap" },
                { title: "Students", href: "/dashboard/students", icon: "Users" },
            ],
        },
        {
            title: "Reports",
            items: [
                { title: "Analytics", href: "/dashboard/reports", icon: "BarChart3" },
            ],
        },
    ],

    HOD: [
        {
            title: "Overview",
            items: [
                { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
            ],
        },
        {
            title: "Department",
            items: [
                { title: "Faculty", href: "/dashboard/faculty", icon: "UserCheck" },
                { title: "Students", href: "/dashboard/students", icon: "Users" },
                { title: "Courses", href: "/dashboard/courses", icon: "BookOpen" },
            ],
        },
        {
            title: "Academics",
            items: [
                { title: "Attendance", href: "/dashboard/attendance", icon: "ClipboardList" },
                { title: "Timetable", href: "/dashboard/timetable", icon: "Calendar" },
            ],
        },
    ],

    FACULTY: [
        {
            title: "Overview",
            items: [
                { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
            ],
        },
        {
            title: "Teaching",
            items: [
                { title: "My Students", href: "/dashboard/students", icon: "Users" },
                { title: "Attendance", href: "/dashboard/attendance", icon: "ClipboardList" },
                { title: "Timetable", href: "/dashboard/timetable", icon: "Calendar" },
                { title: "Exams", href: "/dashboard/exams", icon: "FileText" },
            ],
        },
    ],

    STUDENT: [
        {
            title: "Overview",
            items: [
                { title: "Dashboard", href: "/portal", icon: "LayoutDashboard" },
            ],
        },
        {
            title: "Academics",
            items: [
                { title: "Attendance", href: "/portal/attendance", icon: "ClipboardList" },
                { title: "Timetable", href: "/portal/timetable", icon: "Calendar" },
                { title: "Exams & Results", href: "/portal/exams", icon: "FileText" },
            ],
        },
        {
            title: "Services",
            items: [
                { title: "Fees", href: "/portal/fees", icon: "CreditCard" },
                { title: "Library", href: "/portal/library", icon: "Library" },
                { title: "Hostel", href: "/portal/hostel", icon: "Home" },
                { title: "Transport", href: "/portal/transport", icon: "Bus" },
                { title: "Placement", href: "/portal/placement", icon: "Briefcase" },
            ],
        },
    ],

    PARENT: [
        {
            title: "Overview",
            items: [
                { title: "Dashboard", href: "/portal", icon: "LayoutDashboard" },
            ],
        },
        {
            title: "Child's Progress",
            items: [
                { title: "Attendance", href: "/portal/attendance", icon: "ClipboardList" },
                { title: "Exam Results", href: "/portal/exams", icon: "FileText" },
                { title: "Fees", href: "/portal/fees", icon: "CreditCard" },
            ],
        },
    ],

    LIBRARIAN: [
        {
            title: "Operational Dash",
            items: [
                { title: "Library Dashboard", href: "/modules/library", icon: "LayoutDashboard" },
            ],
        },
        {
            title: "Resources",
            items: [
                { title: "Catalog", href: "/modules/library/catalog", icon: "Library" },
                { title: "Issues/Returns", href: "/modules/library/circulation", icon: "ClipboardList" },
            ],
        },
    ],

    ACCOUNTANT: [
        {
            title: "Overview",
            items: [
                { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
            ],
        },
        {
            title: "Finance",
            items: [
                { title: "Fees Management", href: "/dashboard/fees", icon: "CreditCard" },
                { title: "Reports", href: "/dashboard/reports", icon: "BarChart3" },
            ],
        },
    ],

    HOSTEL_WARDEN: [
        {
            title: "Operations",
            items: [
                { title: "Warden Dashboard", href: "/modules/hostel", icon: "LayoutDashboard" },
            ],
        },
        {
            title: "Hostel",
            items: [
                { title: "Room Allocation", href: "/modules/hostel/rooms", icon: "Home" },
                { title: "Attendance", href: "/modules/hostel/attendance", icon: "UserCheck" },
            ],
        },
    ],

    TRANSPORT_MANAGER: [
        {
            title: "Operations",
            items: [
                { title: "Fleet Dashboard", href: "/modules/transport", icon: "LayoutDashboard" },
            ],
        },
        {
            title: "Transport",
            items: [
                { title: "Vehicles", href: "/modules/transport/vehicles", icon: "Bus" },
                { title: "Routes", href: "/modules/transport/routes", icon: "Route" },
            ],
        },
    ],

    PLACEMENT_OFFICER: [
        {
            title: "Vertical Head",
            items: [
                { title: "Placement Dashboard", href: "/modules/placement", icon: "LayoutDashboard" },
            ],
        },
        {
            title: "Corporate Relations",
            items: [
                { title: "Company Database", href: "/modules/placement/companies", icon: "Building2" },
                { title: "Drives", href: "/modules/placement/drives", icon: "Briefcase" },
            ],
        },
    ],
    REGISTRAR: [
        {
            title: "Overview",
            items: [
                { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
            ],
        },
    ],
    ACADEMIC_COORDINATOR: [
        {
            title: "Overview",
            items: [
                { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
            ],
        },
    ],
    EXAM_CONTROLLER: [
        {
            title: "Overview",
            items: [
                { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
            ],
        },
    ],
    FINANCE: [
        {
            title: "Overview",
            items: [
                { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
            ],
        },
    ],
    PLACEMENT_CELL: [
        {
            title: "Overview",
            items: [
                { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
            ],
        },
    ],
};

// Get allowed routes for a role
export function getAllowedRoutes(role: Role): string[] {
    const navGroups = roleNavigation[role] || [];
    const routes: string[] = [];

    navGroups.forEach((group) => {
        group.items.forEach((item) => {
            routes.push(item.href);
        });
    });

    return routes;
}

// Check if a role can access a route
export function canAccessRoute(role: Role, route: string): boolean {
    const allowedRoutes = getAllowedRoutes(role);
    return allowedRoutes.some((r) => route.startsWith(r));
}

// Role display names
export const roleDisplayNames: Record<Role, string> = {
    SUPER_ADMIN: "Super Admin",
    UNIVERSITY_ADMIN: "University Admin",
    PRINCIPAL: "Principal",
    HOD: "Head of Department",
    FACULTY: "Faculty",
    STUDENT: "Student",
    PARENT: "Parent",
    LIBRARIAN: "Librarian",
    ACCOUNTANT: "Accountant",
    HOSTEL_WARDEN: "Hostel Warden",
    TRANSPORT_MANAGER: "Transport Manager",
    PLACEMENT_OFFICER: "Placement Officer",
    REGISTRAR: "Registrar",
    ACADEMIC_COORDINATOR: "Academic Coordinator",
    EXAM_CONTROLLER: "Exam Controller",
    FINANCE: "Finance Officer",
    PLACEMENT_CELL: "Placement Cell",
};
