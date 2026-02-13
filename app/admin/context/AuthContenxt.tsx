"use client";

import { createContext, ReactNode, useContext, useState } from "react";

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: "admin" | "host" | "user";
}

interface AuthContextType {
    user: AuthUser | null;
    login: (email: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);

    const login = (email: string) => {
        const users: AuthUser[] = [
            { id: 1, name: "Anjali Admin", email: "anjali@admin.com", role: "admin" },
            { id: 2, name: "Bob Host", email: "bob@host.com", role: "host" },
            { id: 3, name: "Charlie User", email: "charlie@user.com", role: "user" },
            { id: 4, name: "Diana Host", email: "diana@host.com", role: "host" },
            { id: 5, name: "Eve User", email: "eve@user.com", role: "user" },
        ];

        const found = users.find(u => u.email === email);
        if (found) setUser(found);
        else alert("User not found. Try: alice@admin.com, bob@host.com, charlie@user.com");
    };

    const logout = () => setUser(null);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
