"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CustomerDashboard() {
    const [user, setUser] = useState<any>(null);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const data = localStorage.getItem("user_data");

        if (!data) {
            router.push("/login");
            return;
        }

        try {
            const parsedUser = JSON.parse(data);
            setUser(parsedUser);
        } catch (e) {
            localStorage.removeItem("user_data");
            router.push("/login");
        }
    }, [mounted, router]);

    if (!mounted || !user) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-4xl font-bold mb-4">Customer Dashboard</h1>
            <div className="bg-white p-6 rounded">
                <p>Name: {user.fullName}</p>
                <p>Email: {user.email}</p>
                <p>Role: {user.role}</p>
                <button
                    onClick={() => {
                        localStorage.clear();
                        router.push("/login");
                    }}
                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}