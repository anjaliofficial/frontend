"use client";
import { useEffect, useState } from "react";

export default function HostDashboard() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const data = localStorage.getItem("user_data");
        if (data) {
            setUser(JSON.parse(data));
        } else {
            window.location.href = "/login";
        }
    }, []);

    if (!user) return <div className="p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-4xl font-bold mb-4">Host Dashboard</h1>
            <div className="bg-white p-6 rounded">
                <p>Name: {user.fullName}</p>
                <p>Email: {user.email}</p>
                <p>Role: {user.role}</p>
                <button
                    onClick={() => {
                        localStorage.clear();
                        window.location.href = "/login";
                    }}
                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}