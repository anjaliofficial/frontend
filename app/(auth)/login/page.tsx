"use client";

import React from "react";
import LoginForm from "@/app/(auth)/_components/LoginForm";

export default function LoginPage() {
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
