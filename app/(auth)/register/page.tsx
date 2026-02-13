"use client";

import React from "react";
import RegisterForm from "@/app/(auth)/_components/RegisterForm";

export default function RegisterPage() {
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
