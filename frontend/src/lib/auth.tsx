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

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [activeRole, setActiveRole] = useState<Role | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing session
        const storedUser = localStorage.getItem("educore_user");
        const storedRole = localStorage.getItem("educore_role");

        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setActiveRole((storedRole as Role) || parsedUser.roles[0]);
        }
        setIsLoading(false);
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const { data } = await api.post('/auth/login', { username, password });

            // Map backend user to frontend user structure
            const frontendUser: User = {
                id: data.user.id,
                name: data.user.username, // Backend sends username as name for now
                email: data.user.username + "@example.com", // Backend might not send email
                universityId: data.user.universityId,
                roles: [data.user.role],
            };

            setUser(frontendUser);
            setActiveRole(frontendUser.roles[0]);

            localStorage.setItem("educore_token", data.access_token);
            localStorage.setItem("educore_user", JSON.stringify(frontendUser));
            localStorage.setItem("educore_role", frontendUser.roles[0]);
        } catch (error: any) {
            console.error("Login failed:", error);
            throw new Error(error.response?.data?.message || "Login failed");
        }
    };

    const logout = () => {
        setUser(null);
        setActiveRole(null);
        localStorage.removeItem("educore_token");
        localStorage.removeItem("educore_user");
        localStorage.removeItem("educore_role");
        api.defaults.headers.Authorization = "";
    };

    const handleSetActiveRole = (role: Role) => {
        if (user?.roles.includes(role)) {
            setActiveRole(role);
            localStorage.setItem("educore_role", role);
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
