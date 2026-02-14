"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/admin/context/AuthContext";
import { getDashboardPath } from "@/lib/auth/roles";

export default function CustomerDashboard() {
    const { user, loading } = useAuth();
    const [ready, setReady] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.replace("/login");
            return;
        }

        if (user.role !== "customer") {
            router.replace(getDashboardPath(user.role));
            return;
        }

        setReady(true);
    }, [loading, user, router]);

    if (!ready || !user) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div>
            <h1 className="text-4xl font-bold mb-6">Customer Dashboard</h1>
            <div className="bg-white p-6 rounded shadow">
                <div className="space-y-2">
                    <p><strong>Name:</strong> {user.fullName}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Role:</strong> {user.role}</p>
                </div>
                <div className="mt-6 flex gap-4">
                    <Link
                        href="/listings"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                        Browse Listings
                    </Link>
                    <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
                        My Bookings
                    </button>
                </div>
            </div>
        </div>
    );
}