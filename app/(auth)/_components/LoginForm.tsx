"use client";
import { Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
    const router = useRouter();

    const handleLogin = () => {
        router.push("/dashboard");
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold text-gray-800">Welcome back to Sajilo Baas</h2>
                <p className="text-sm text-gray-500">Login with your registered Email & Password</p>
            </div>

            <div className="flex flex-col gap-4">
                {/* Email */}
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">Email</label>
                    <div className="flex items-center border border-gray-300 rounded-lg px-3">
                        <Mail size={18} className="text-gray-400" />
                        <input
                            type="email"
                            placeholder="E-mail@example.com"
                            className="w-full p-3 outline-none border-none"
                        />
                    </div>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">Password</label>
                    <div className="flex items-center border border-gray-300 rounded-lg px-3">
                        <Lock size={18} className="text-gray-400" />
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full p-3 outline-none border-none"
                        />
                    </div>
                </div>
            </div>

            <button
                onClick={handleLogin}
                className="w-full bg-[#1e3a4c] text-white py-3 rounded-lg font-semibold hover:bg-[#162a38] transition"
            >
                Log In
            </button>

            <div className="text-center">
                <button className="text-sm text-gray-500 underline">Forgot password?</button>
            </div>

            <p className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <a href="/register" className="text-blue-600 font-semibold">
                    Register Now
                </a>
            </p>
        </div>
    );
}
