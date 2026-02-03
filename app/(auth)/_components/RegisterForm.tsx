"use client";
import React, { useState } from "react";
import { Mail, Lock, User, Phone, MapPin } from "lucide-react";

export default function RegisterForm() {
    // Only allow "customer" or "host"
    const [role, setRole] = useState<"customer" | "host">("customer");

    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-gray-800">Register to Sajilo Baas</h2>

            {/* Role Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
                {["customer", "host"].map((r) => (
                    <button
                        key={r}
                        onClick={() => setRole(r as "customer" | "host")}
                        className={`px-4 py-2 rounded-md font-semibold cursor-pointer ${role === r ? "bg-white shadow" : "bg-transparent"
                            }`}
                    >
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                ))}
            </div>

            <form className="flex flex-col gap-4">
                <InputField label="Full Name" icon={<User size={18} className="text-gray-400" />} placeholder="John Doe" />
                <InputField label="Email" icon={<Mail size={18} className="text-gray-400" />} placeholder="email@example.com" />
                <InputField label="Password" icon={<Lock size={18} className="text-gray-400" />} placeholder="••••••••" type="password" />
                <InputField label="Phone Number" icon={<Phone size={18} className="text-gray-400" />} placeholder="+977-98000000" />
                <InputField label="Address" icon={<MapPin size={18} className="text-gray-400" />} placeholder="Kathmandu, Nepal" />

                <button
                    type="submit"
                    className="mt-4 bg-[#1a3a4a] text-white py-3 rounded-lg font-bold hover:bg-[#142836] transition"
                >
                    Register as {role}
                </button>
            </form>

            <p className="text-center text-sm text-gray-500">
                Already have an account?{" "}
                <a href="/auth/login" className="text-blue-600 font-bold">
                    Sign In Now
                </a>
            </p>
        </div>
    );
}

function InputField({ label, icon, placeholder, type = "text" }: any) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">{label}</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3">
                {icon}
                <input
                    type={type}
                    placeholder={placeholder}
                    className="w-full p-3 outline-none border-none text-sm"
                />
            </div>
        </div>
    );
}
