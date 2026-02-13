"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"
import Header from "./_components/Header";
import DashboardOverview from "./_components/DashboardOverview";

export default function DashboardPage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.replace("/login");
        }
    }, [user, router]);

    if (!user) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <DashboardOverview />
            {/* You can add more dashboard sections based on role */}
            {user.role === "admin" && (
                <div className="p-8 text-gray-700 font-semibold">
                    Admin-only panel: manage users, listings, etc.
                </div>
            )}
            {user.role === "host" && (
                <div className="p-8 text-gray-700 font-semibold">
                    Host panel: view bookings, manage listings.
                </div>
            )}
            {user.role === "user" && (
                <div className="p-8 text-gray-700 font-semibold">
                    User panel: view your bookings and reviews.
                </div>
            )}
        </div>
    );
}
