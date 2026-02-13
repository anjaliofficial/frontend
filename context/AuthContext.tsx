"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export type Role = "admin" | "host" | "user";

export interface User {
    _id: string;
    email: string;
    role: Role;
}

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const logout = () => setUser(null);

    return (
        <AuthContext.Provider value={{ user, setUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
