"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { logoutUser } from "@/lib/actions/auth-action";
import { clearToken, clearUserData, getUserData } from "@/lib/auth/storage";

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
    const pathname = usePathname();

    const syncUserFromStorage = () => {
        const storedUser = getUserData<User>();
        setUser(storedUser || null);
    };

    useEffect(() => {
        // Only run on client side
        if (typeof window === "undefined") return;

        syncUserFromStorage();
        setLoading(false);
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        syncUserFromStorage();
    }, [pathname]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const handleStorage = (event: StorageEvent) => {
            if (event.key === "user_data") {
                syncUserFromStorage();
            }
        };

        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, []);

    const logout = async () => {
        try {
            await logoutUser();
        } catch (e) {
            console.error("Logout error:", e);
        }

        clearUserData();
        clearToken();
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