"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserData, clearAuthCookies, UserData } from "@/lib/cookie";
import Header from "@/app/dashboard/_components/Header";
import DashboardOverview from "@/app/dashboard/_components/DashboardOverview";

export default function CustomerDashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const userData = await getUserData();
            if (!userData || userData.role !== "customer") {
                router.replace("/login");
                return;
            }
            setUser(userData);
            setLoading(false);
        };

        fetchUser();
    }, [router]);

    const handleLogout = () => {
        clearAuthCookies();
        router.push("/login");
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-100">
            <Header userName={user.fullName || user.username || user.email} onLogout={handleLogout} />
            <main className="p-8">
                <DashboardOverview userName={user.fullName || user.username || user.email} role="customer" />
            </main>
        </div>
    );
}
