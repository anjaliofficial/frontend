"use client";

import React, { useEffect, useState } from "react";
import RegisterForm from "../_components/RegisterForm";
import { getUserData } from "@/lib/cookie";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const user = await getUserData();
            if (user) {
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
                setLoading(false);
            }
        };
        checkAuth();
    }, [router]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6 font-sans">
            <div className="bg-white rounded-3xl shadow-2xl flex max-w-5xl w-full min-h-[650px] overflow-hidden">
                {/* Left Side Image */}
                <div className="w-1/2">
                    <img
                        src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800"
                        alt="Nepal Scenery"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Right Side Form */}
                <div className="w-1/2 p-10 flex flex-col justify-center">
                    <RegisterForm />
                </div>
            </div>
        </div>
    );
}
