"use client";

import React from "react";
import { LogOut } from "lucide-react";

interface HeaderProps {
    userName: string;
    role: "customer" | "host" | "admin";
    onLogout: () => void;
}

export default function Header({ userName, role, onLogout }: HeaderProps) {
    return (
        <header className="bg-white shadow px-8 py-4 flex items-center justify-between">
            <div>
                <h1 className="text-xl font-bold text-[#1a3a4a]">Sajilo Baas Dashboard</h1>
                <p className="text-sm text-gray-500 capitalize">Role: {role}</p>
            </div>

            <div className="flex items-center gap-6">
                <span className="font-medium text-gray-600">Hello, {userName}</span>
                <button
                    onClick={onLogout}
                    className="flex items-center gap-2 text-red-600 font-semibold"
                >
                    <LogOut size={18} /> Logout
                </button>
            </div>
        </header>
    );
}
