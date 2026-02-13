"use client";

import React from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation";

export default function Header() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.replace("/login");
    };

    return (
        <header className="bg-white shadow px-8 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-[#1a3a4a]">Sajilo Baas Dashboard</h1>
            <div className="flex items-center gap-6">
                <span className="font-medium text-gray-600">Hello, {user?.email}</span>
                <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 font-semibold">
                    <LogOut size={18} /> Logout
                </button>
            </div>
        </header>
    );
}
