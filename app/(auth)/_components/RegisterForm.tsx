"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User, Phone, MapPin } from "lucide-react";
import { register as registerApi } from "@/lib/api/auth";
import { registerSchema, RegisterFormData } from "../schema";

export default function RegisterForm() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        setLoading(true);
        try {
            const payload = { ...data }; // directly matches backend DTO

            const res = await registerApi(payload);

            if (res.success) {
                alert("Registration successful. Please login.");
                router.push("/login");
            } else {
                alert(res.message || "Registration failed");
            }
        } catch (error: any) {
            console.error("Registration error:", error);
            if (error.errors) {
                alert(error.errors.map((e: any) => `${e.path}: ${e.message}`).join("\n"));
            } else {
                alert(error?.message || "Registration failed");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Register</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <InputField label="Full Name" icon={<User size={18} />} placeholder="John Doe" {...register("fullName")} error={errors.fullName?.message} />
                <InputField label="Email" icon={<Mail size={18} />} placeholder="email@example.com" type="email" {...register("email")} error={errors.email?.message} />
                <InputField label="Password" icon={<Lock size={18} />} placeholder="••••••••" type="password" {...register("password")} error={errors.password?.message} />
                <InputField label="Confirm Password" icon={<Lock size={18} />} placeholder="••••••••" type="password" {...register("confirmPassword")} error={errors.confirmPassword?.message} />
                <InputField label="Phone Number" icon={<Phone size={18} />} placeholder="9800000000" type="tel" {...register("phoneNumber")} error={errors.phoneNumber?.message} />
                <InputField label="Address" icon={<MapPin size={18} />} placeholder="Kathmandu, Nepal" {...register("address")} error={errors.address?.message} />

                {/* Role Selection */}
                <div className="flex gap-4 mt-2">
                    <label>
                        <input type="radio" value="user" {...register("role")} /> User
                    </label>
                    <label>
                        <input type="radio" value="host" {...register("role")} /> Host
                    </label>
                    <label>
                        <input type="radio" value="admin" {...register("role")} /> Admin
                    </label>
                </div>
                {errors.role && <span className="text-red-500 text-xs">{errors.role.message}</span>}

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 bg-[#1a3a4a] text-white py-3 rounded-lg font-bold hover:bg-[#142836] transition disabled:opacity-60"
                >
                    {loading ? "Registering..." : "Register"}
                </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-4">
                Already have an account?{" "}
                <a href="/login" className="text-blue-600 font-bold">Sign In Now</a>
            </p>
        </div>
    );
}

function InputField({ label, icon, placeholder, type = "text", error, ...props }: any) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">{label}</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3">
                {icon}
                <input type={type} placeholder={placeholder} className="w-full p-3 outline-none border-none text-sm" {...props} />
            </div>
            {error && <span className="text-red-500 text-xs">{error}</span>}
        </div>
    );
}
