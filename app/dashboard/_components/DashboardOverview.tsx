"use client";

import React from "react";
import { CheckCircle, Clock, Users } from "lucide-react";

interface Props {
    userName: string;
    role: "customer";
}

export default function DashboardOverview({ userName, role }: Props) {
    // Only customer stats
    const stats = [
        { icon: <CheckCircle />, label: "Your Bookings", value: "3" },
        { icon: <Clock />, label: "Pending Requests", value: "1" },
        { icon: <Users />, label: "Reviews Given", value: "10" },
    ];

    return (
        <div className="flex flex-col gap-8">
            <h2 className="text-2xl font-bold text-[#1a3a4a]">Welcome back, {userName}!</h2>
            <p className="text-gray-500">Here is what's happening with your bookings today.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((s, i) => (
                    <StatCard key={i} icon={s.icon} label={s.label} value={s.value} />
                ))}
            </div>
        </div>
    );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="bg-white p-5 rounded-xl shadow flex items-center gap-4">
            <div className="bg-gray-100 p-3 rounded-lg">{icon}</div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <h4 className="text-lg font-bold text-gray-800">{value}</h4>
            </div>
        </div>
    );
}
