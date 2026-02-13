"use client";

import React, { useEffect, useState } from "react";
import LoginForm from "../_components/LoginForm";
import { getUserData } from "@/lib/cookie";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const user = await getUserData();
            if (user) {
                // Redirect based on role
                switch (user.role) {
                    case "customer":
                        router.replace("/dashboard");
                        break;
                    case "host":
                    case "admin":
                        alert(`Role "${user.role}" detected. Dashboard not implemented yet.`);
                        break;
                }
            } else {
                setLoading(false); // show login form
            }
        };
        checkAuth();
    }, [router]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6 font-sans">
            <div className="bg-white rounded-3xl shadow-xl flex max-w-4xl w-full h-[600px] overflow-hidden">
                {/* Left Side Image */}
                <div className="w-1/2">
                    <img
                        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"
                        alt="Interior"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Right Side Form */}
                <div className="w-1/2 p-12 flex flex-col justify-center">
                    <LoginForm />
                </div>
            </div>
        </div>
    );
}
