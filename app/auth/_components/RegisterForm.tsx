"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterValues } from "../register/schema";
import { Mail, Lock, User, Phone, Globe } from "lucide-react";

export default function RegisterForm() {
    const [role, setRole] = useState<"User" | "Hosts">("User");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: { role: "User" },
    });

    const onSubmit = async (data: RegisterValues) => {
        console.log("Form Data:", data);
        // Add your API call here
    };

    return (
        <div className="w-full max-w-md mx-auto space-y-6">
            <div className="text-left space-y-2">
                <h2 className="text-2xl font-bold text-gray-800">Register to Sajilo Baas</h2>

                {/* Role Toggle */}
                <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
                    <button
                        onClick={() => setRole("User")}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${role === "User" ? "bg-white shadow-sm text-gray-800" : "text-gray-500"
                            }`}
                    >
                        User
                    </button>
                    <button
                        onClick={() => setRole("Hosts")}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${role === "Hosts" ? "bg-white shadow-sm text-gray-800" : "text-gray-500"
                            }`}
                    >
                        Hosts
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Name Field */}
                <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Name</label>
                    <input
                        {...register("name")}
                        className={`w-full p-3 border rounded-lg outline-none focus:ring-2 transition ${errors.name ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:ring-[#1a3a4a]/20"
                            }`}
                    />
                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>

                {/* Email Field */}
                <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Email</label>
                    <input
                        {...register("email")}
                        placeholder="E-mail@example.com"
                        className={`w-full p-3 border rounded-lg outline-none focus:ring-2 transition ${errors.email ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:ring-[#1a3a4a]/20"
                            }`}
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Password</label>
                    <input
                        {...register("password")}
                        type="password"
                        placeholder="E-mail@example.com"
                        className={`w-full p-3 border rounded-lg outline-none focus:ring-2 transition ${errors.password ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:ring-[#1a3a4a]/20"
                            }`}
                    />
                    {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                </div>

                {/* Phone Field */}
                <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                    <input
                        {...register("phoneNumber")}
                        placeholder="Password"
                        className={`w-full p-3 border rounded-lg outline-none focus:ring-2 transition ${errors.phoneNumber ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:ring-[#1a3a4a]/20"
                            }`}
                    />
                    {errors.phoneNumber && <p className="text-xs text-red-500">{errors.phoneNumber.message}</p>}
                </div>

                {/* Hidden Role Input */}
                <input type="hidden" {...register("role")} value={role} />

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#1a3a4a] text-white py-3 rounded-lg font-bold hover:bg-[#142d3a] transition disabled:opacity-70 mt-4"
                >
                    {isSubmitting ? "Registering..." : "Register"}
                </button>
            </form>

            <div className="text-center space-y-4">
                <p className="text-xs text-gray-500">
                    Already have an account?{" "}
                    <a href="/auth/login" className="text-blue-600 font-bold">
                        Sign In Now
                    </a>
                </p>

                {/* Social Icons */}
                <div className="flex justify-center gap-4">
                    <button className="p-2 border rounded-full hover:bg-gray-50">
                        <img src="/images/google-icon.png" alt="Google" className="w-5 h-5" />
                    </button>
                    <button className="p-2 border rounded-full hover:bg-gray-50">
                        <img src="/images/facebook-icon.png" alt="Facebook" className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}