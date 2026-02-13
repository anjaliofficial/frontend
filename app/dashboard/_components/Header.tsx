"use client";

import React from "react";
import { LogOut } from "lucide-react";

interface Props {
    userName: string;
    onLogout: () => void;
}

export default function Header({ userName, onLogout }: Props) {
    return (
        <header className="bg-white shadow px-8 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-[#1a3a4a]">Customer Dashboard</h1>
            <div className="flex items-center gap-6">
                <span className="font-medium text-gray-600">Hello, {userName}</span>
                <button
                    onClick={onLogout}
                    className="flex items-center gap-2 text-red-600 font-semibold hover:text-red-800"
                >
                    <LogOut size={18} /> Logout
                </button>
            </div>
        </header>
    );
}
