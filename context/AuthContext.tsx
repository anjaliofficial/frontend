"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Role = "admin" | "host" | "user";

interface User {
    id: number;
    name: string;
    email: string;
    role: Role;
}

interface AuthContextType {
    user: User | null;
    loginAsAdmin: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return ctx;
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>({
        id: 1,
        name: "Alice Admin",
        email: "alice@admin.com",
        role: "admin",
    });

    const loginAsAdmin = () => setUser({
        id: 1,
        name: "Alice Admin",
        email: "alice@admin.com",
        role: "admin",
    });

    const logout = () => setUser(null);

    return (
        <AuthContext.Provider value={{ user, loginAsAdmin, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
