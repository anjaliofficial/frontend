"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User, Phone, MapPin } from "lucide-react";
import { registerSchema, RegisterFormData } from "../schema";
import { register as registerApi } from "@/lib/api/auth";

export default function RegisterForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        setLoading(true);
        try {
            const res = await registerApi(data);
            if (res.success) {
                alert("Registration successful. Please login.");
                router.push("/login");
            } else {
                alert(res.message || "Registration failed");
            }
        } catch (err: any) {
            alert(err?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <InputField label="Full Name" icon={<User />} {...register("fullName")} error={errors.fullName?.message} />
            <InputField label="Email" icon={<Mail />} type="email" {...register("email")} error={errors.email?.message} />
            <InputField label="Password" icon={<Lock />} type="password" {...register("password")} error={errors.password?.message} />
            <InputField label="Confirm Password" icon={<Lock />} type="password" {...register("confirmPassword")} error={errors.confirmPassword?.message} />
            <InputField label="Phone" icon={<Phone />} type="tel" {...register("phoneNumber")} error={errors.phoneNumber?.message} />
            <InputField label="Address" icon={<MapPin />} {...register("address")} error={errors.address?.message} />

            <div className="flex gap-4">
                {["customer", "host", "admin"].map((role) => (
                    <label key={role} className="flex items-center gap-2">
                        <input type="radio" value={role} {...register("role")} />
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                    </label>
                ))}
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
    );
}

function InputField({ label, icon, type = "text", error, ...props }: any) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">{label}</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3">
                {icon}
                <input type={type} className="w-full p-3 outline-none border-none text-sm" {...props} />
            </div>
            {error && <span className="text-red-500 text-xs">{error}</span>}
        </div>
    );
}
