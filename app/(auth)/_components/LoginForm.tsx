"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/actions/auth-action";
import { getDashboardPath } from "@/lib/auth/roles";
import { setToken, setUserData } from "@/lib/auth/storage";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await loginUser({ email, password });

            if (result.success && result.user) {
                setUserData(result.user);
                if (result.token) setToken(result.token);

                const redirectUrl = getDashboardPath(result.user.role);
                setLoading(false);
                router.replace(redirectUrl);
                return;
            }

            setError(result.message || "Login failed");
            setLoading(false);
        } catch {
            setError("Connection error");
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80 p-6 bg-white rounded shadow">
            <h1 className="text-2xl font-bold">Login</h1>

            {error && (
                <div className="p-3 bg-red-100 border border-red-400 rounded text-sm text-red-700">
                    {error}
                </div>
            )}

            <input
                type="email"
                placeholder="Email"
                className="border p-2 rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
            />
            <input
                type="password"
                placeholder="Password"
                className="border p-2 rounded"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
            />
            <button
                type="submit"
                className="bg-blue-600 text-white p-2 rounded disabled:opacity-50"
                disabled={loading}
            >
                {loading ? "Loading..." : "Login"}
            </button>
        </form>
    );
}