"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock } from "lucide-react";
import { login as loginApi } from "@/lib/api/auth";
import { loginSchema, LoginFormData } from "../schema";

export default function LoginForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setLoading(true);
        try {
            const res = await loginApi(data); // backend response: { success, token, data: { _id, email, role } }

            if (res.success) {
                // Store token & user info (optional localStorage for demo, cookies preferred)
                localStorage.setItem("token", res.token);
                localStorage.setItem("userData", JSON.stringify(res.data));

                console.log("Login success:", res.data);

                // Redirect based on role
                if (res.data.role === "admin") router.replace("/dashboard/admin");
                else if (res.data.role === "host") router.replace("/dashboard/host");
                else router.replace("/dashboard/user");
            } else {
                alert(res.message || "Login failed");
            }
        } catch (err: any) {
            alert(err?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 bg-white p-10 rounded-lg shadow-md w-96">
            <h2 className="text-2xl font-bold text-gray-800">Login</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <InputField label="Email" icon={<Mail size={18} />} type="email" {...register("email")} error={errors.email?.message} />
                <InputField label="Password" icon={<Lock size={18} />} type="password" {...register("password")} error={errors.password?.message} />

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 bg-[#1a3a4a] text-white py-3 rounded-lg font-bold hover:bg-[#142836] transition disabled:opacity-60"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}

function InputField({ label, icon, type = "text", error, ...props }: any) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">{label}</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3">
                {icon}
                <input type={type} className="w-full p-3 outline-none border-none text-sm" {...props} />
            </div>
            {error && <span className="text-red-500 text-xs">{error}</span>}
        </div>
    );
}
