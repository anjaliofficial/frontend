"use client";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.replace("/login"); // redirect if not logged in
        }
    }, [loading, isAuthenticated, router]);

    if (loading || !isAuthenticated) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-100">
            <h1 className="text-2xl font-bold p-8">Dashboard</h1>
            <p>Welcome to your dashboard!</p>
        </div>
    );
}
