"use client";

import React from "react";
import { Home, Users, CheckCircle, Clock } from "lucide-react";

export default function DashboardOverview({ userName }: { userName: string }) {
    return (
        <div className="flex flex-col gap-8">
            <h2 className="text-2xl font-bold text-[#1a3a4a]">Welcome back, {userName}!</h2>
            <p className="text-gray-500">Here is what's happening with your bookings today.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<Home />} label="Total Listings" value="12" />
                <StatCard icon={<CheckCircle />} label="Active Bookings" value="5" />
                <StatCard icon={<Clock />} label="Pending Requests" value="3" />
                <StatCard icon={<Users />} label="Total Reviews" value="48" />
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
