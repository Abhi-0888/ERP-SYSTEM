"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Role, AuthState } from "./types";

import api from "./api"; // Ensure api.ts is created


interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    setActiveRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_RANK: Record<Role, number> = {
    SUPER_ADMIN: 0,
    UNIVERSITY_ADMIN: 1,
    PRINCIPAL: 2,
    REGISTRAR: 3,
    EXAM_CONTROLLER: 4,
    HOD: 5,
    ACADEMIC_COORDINATOR: 6,
    FACULTY: 7,
    LIBRARIAN: 8,
    ACCOUNTANT: 9,
    HOSTEL_WARDEN: 10,
    TRANSPORT_MANAGER: 11,
    PLACEMENT_OFFICER: 12,
    PLACEMENT_CELL: 13,
    FINANCE: 14,
    STUDENT: 15,
    PARENT: 16,
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [activeRole, setActiveRole] = useState<Role | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const sortRoles = (roles: Role[]) => {
        return [...roles].sort((a, b) => (ROLE_RANK[a] ?? 99) - (ROLE_RANK[b] ?? 99));
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("educore_user");
        const storedRole = localStorage.getItem("educore_role");

        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);

            // Default to stored role, or highest rank role if not set or invalid
            const defaultRole = (storedRole as Role);
            if (defaultRole && parsedUser.roles.includes(defaultRole)) {
                setActiveRole(defaultRole);
            } else {
                const sorted = sortRoles(parsedUser.roles);
                setActiveRole(sorted[0]);
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const { data } = await api.post('/auth/login', { username, password });

            // In a real scenario, the backend would return multiple roles.
            // For now, we wrap the single role in an array.
            const roles: Role[] = Array.isArray(data.user.roles) ? data.user.roles : [data.user.role];
            const sortedRoles = sortRoles(roles);

            const frontendUser: User = {
                id: data.user.id,
                name: data.user.name || data.user.username,
                email: data.user.email || (data.user.username + "@example.com"),
                universityId: data.user.universityId,
                roles: sortedRoles,
                universityStatus: data.user.universityStatus,
                onboardingStage: data.user.onboardingStage,
            };

            setUser(frontendUser);
            const defaultRole = sortedRoles[0];
            setActiveRole(defaultRole);

            localStorage.setItem("educore_token", data.access_token);
            localStorage.setItem("educore_user", JSON.stringify(frontendUser));
            localStorage.setItem("educore_role", defaultRole);

            // Initial audit log for login
            api.post('/audit/logs', {
                action: 'LOGIN',
                details: `User logged in with role ${defaultRole}`,
                metadata: { role: defaultRole }
            }).catch(err => console.error("Audit log failed:", err));

        } catch (error: any) {
            console.error("Login failed:", error);
            throw new Error(error.response?.data?.message || "Login failed");
        }
    };

    const logout = () => {
        if (user && activeRole) {
            api.post('/audit/logs', {
                action: 'LOGOUT',
                details: `User logged out from role ${activeRole}`,
            }).catch(() => { });
        }
        setUser(null);
        setActiveRole(null);
        localStorage.removeItem("educore_token");
        localStorage.removeItem("educore_user");
        localStorage.removeItem("educore_role");
        api.defaults.headers.Authorization = "";
    };

    const handleSetActiveRole = async (role: Role) => {
        if (user?.roles.includes(role)) {
            const fromRole = activeRole;
            setActiveRole(role);
            localStorage.setItem("educore_role", role);

            // Authority Switch Audit Requirement
            try {
                await api.post('/audit/logs', {
                    action: 'ROLE_SWITCH',
                    fromRole,
                    toRole: role,
                    details: `Authority switch: ${fromRole} -> ${role}`,
                    timestamp: new Date().toISOString()
                });
            } catch (err) {
                console.error("Failed to log role switch audit:", err);
            }

            // Force reload navigation/permissions by resetting relevant states if necessary
            // In Next.js, updating context will trigger re-renders.
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                activeRole,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
                setActiveRole: handleSetActiveRole,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}
