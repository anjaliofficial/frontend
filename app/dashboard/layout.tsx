"use client"; // Required for interactivity and icons
import "../globals.css"; // Check this path! It must point to your CSS file
import { LayoutDashboard, Calendar, User, Settings, LogOut } from "lucide-react";
import React from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: "Overview", active: true },
        { icon: <Calendar size={20} />, label: "My Bookings", active: false },
        { icon: <User size={20} />, label: "Profile", active: false },
        { icon: <Settings size={20} />, label: "Settings", active: false },
    ];

    return (
        <div className="flex h-screen bg-[#f8fafc]">
            {/* Sidebar */}
            <aside className="w-72 bg-[#1a3a4a] text-white p-8 flex flex-col h-full">
                <div className="text-2xl font-bold mb-12 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg"></div>
                    <span>Sajilo Baas</span>
                </div>

                <nav className="flex-1 space-y-4">
                    {menuItems.map((item, i) => (
                        <div
                            key={i}
                            className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 ${item.active
                                    ? 'bg-white/10 text-white shadow-inner'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                        </div>
                    ))}
                </nav>

                <button className="flex items-center gap-4 p-4 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors mt-auto">
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-12 bg-[#f8fafc]">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}