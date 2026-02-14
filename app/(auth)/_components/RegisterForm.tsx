"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/actions/auth-action";

export default function RegisterForm() {
    const [form, setForm] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        address: "",
        password: "",
        confirmPassword: "",
        role: "customer"
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Validate passwords match
        if (form.password !== form.confirmPassword) {
            setError("Passwords don't match");
            setLoading(false);
            return;
        }

        // Validate phone number is 10 digits
        if (!/^\d{10}$/.test(form.phoneNumber)) {
            setError("Phone number must be 10 digits");
            setLoading(false);
            return;
        }

        try {
            const res = await registerUser(form);

            if (res.success) {
                alert("Registration successful! Please login.");
                router.push("/login");
            } else {
                setError(res.message || "Registration failed");
                setLoading(false);
            }
        } catch (err) {
            setError("An error occurred");
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-80 p-6 bg-white rounded shadow">
            <h1 className="text-2xl font-bold text-center mb-4">Register</h1>

            {error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                    {error}
                </div>
            )}

            <input
                className="border p-2 rounded"
                type="text"
                placeholder="Full Name"
                value={form.fullName}
                onChange={e => setForm({ ...form, fullName: e.target.value })}
                required
                disabled={loading}
            />

            <input
                className="border p-2 rounded"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                disabled={loading}
            />

            <input
                className="border p-2 rounded"
                type="tel"
                placeholder="Phone Number (10 digits)"
                value={form.phoneNumber}
                onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                required
                disabled={loading}
            />

            <input
                className="border p-2 rounded"
                type="text"
                placeholder="Address"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                required
                disabled={loading}
            />

            <select
                className="border p-2 rounded"
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
                disabled={loading}
            >
                <option value="customer">Customer</option>
                <option value="host">Host</option>
            </select>

            <input
                className="border p-2 rounded"
                type="password"
                placeholder="Password (min 8 characters)"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                disabled={loading}
            />

            <input
                className="border p-2 rounded"
                type="password"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                required
                disabled={loading}
            />

            <button
                className="bg-blue-600 text-white p-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
                type="submit"
                disabled={loading}
            >
                {loading ? "Registering..." : "Register"}
            </button>

            <p className="text-center text-sm">
                Already have an account?{" "}
                <a href="/login" className="text-blue-600 hover:underline">
                    Login here
                </a>
            </p>
        </form>
    );
}