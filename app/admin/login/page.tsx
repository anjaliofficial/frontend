"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (email === "admin@example.com" && password === "password") {
            localStorage.setItem("adminToken", "fake-jwt-token");
            router.push("/admin/dashboard");
        } else {
            alert("Invalid credentials");
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-200">
            <form onSubmit={handleLogin} className="bg-white p-6 shadow rounded w-96">
                <h2 className="text-2xl mb-4">Admin Login</h2>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="border p-2 w-full mb-3"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="border p-2 w-full mb-3"
                    required
                />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 w-full">Login</button>
            </form>
        </div>
    );
}
