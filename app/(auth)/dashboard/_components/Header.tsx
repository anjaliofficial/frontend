"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
    id: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    address: string;
    role: string;
}

export default function Header() {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== "undefined") {
            const userData = localStorage.getItem("user_data");
            if (userData) {
                try {
                    setUser(JSON.parse(userData));
                } catch (e) {
                    setUser(null);
                }
            }
        }
    }, []);

    const handleLogout = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("user_data");
        }
        router.push("/login");
    };

    return (
        <header className="bg-white border-b p-4 flex justify-between items-center shadow-sm">
            <h1 className="font-bold text-lg text-blue-900">SajiloBaas</h1>
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                    {user?.fullName} ({user?.role})
                </span>
                <button
                    onClick={handleLogout}
                    className="text-red-500 text-sm border border-red-500 px-3 py-1 rounded hover:bg-red-50 transition"
                >
                    Logout
                </button>
            </div>
        </header>
    );
}