"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/lib/actions/auth-action";

interface User {
    id: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    address: string;
    role: "customer" | "host" | "admin";
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Only run on client side
        if (typeof window === "undefined") return;

        // Check localStorage for user data
        const userData = localStorage.getItem("user_data");

        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
            } catch (e) {
                console.error("Failed to parse user data:", e);
                localStorage.removeItem("user_data");
                setUser(null);
            }
        } else {
            setUser(null);
        }

        setLoading(false);
    }, []);

    const logout = async () => {
        try {
            await logoutUser();
        } catch (e) {
            console.error("Logout error:", e);
        }

        if (typeof window !== "undefined") {
            localStorage.removeItem("user_data");
        }
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
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