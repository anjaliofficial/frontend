"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/admin/context/AuthContext";
import { getToken, setUserData } from "@/lib/auth/storage";
import Link from "next/link";

interface UserProfile {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    address: string;
    profilePicture: string;
}

interface FormData {
    fullName: string;
    phoneNumber: string;
    address: string;
}

export default function CustomerProfilePage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [formData, setFormData] = useState<FormData>({
        fullName: "",
        phoneNumber: "",
        address: "",
    });
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (authLoading) return;
        if (!user || user.role !== "customer") {
            router.push("/login");
            return;
        }

        // Populate form with user data
        setFormData({
            fullName: user.fullName || "",
            phoneNumber: user.phoneNumber || "",
            address: user.address || "",
        });
        setLoading(false);
    }, [user, authLoading, router]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            const token = getToken();
            const response = await fetch("/api/users/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (data.success) {
                setSuccess("Profile updated successfully!");
                // Update stored user data
                if (user) {
                    setUserData({
                        ...user,
                        ...formData,
                    });
                }
                setTimeout(() => {
                    setSuccess("");
                }, 3000);
            } else {
                setError(data.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Failed to update profile:", error);
            setError("Failed to update profile. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="text-center">Loading profile...</div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                        <p className="text-gray-600 mt-2">Manage your account information</p>
                    </div>
                    <Link
                        href="/dashboard/customer"
                        className="text-blue-600 hover:text-blue-800"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-lg shadow p-8">
                    {error && (
                        <div className="mb-6 bg-red-50 text-red-800 p-4 rounded-lg">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 bg-green-50 text-green-800 p-4 rounded-lg">
                            {success}
                        </div>
                    )}

                    {/* Profile Info Card */}
                    <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="text-lg font-semibold text-gray-900">{user.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Role</p>
                                <p className="text-lg font-semibold">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm capitalize">
                                        {user.role}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Edit Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-900">Edit Profile</h2>

                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                placeholder="+977 98XXXXXXXX"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Address
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                rows={3}
                                placeholder="Enter your address"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-6 border-t">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
                            >
                                {submitting ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>

                    {/* Additional Info */}
                    <div className="mt-8 pt-8 border-t">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">More Options</h3>
                        <div className="space-y-2">
                            <Link
                                href="/forget-password"
                                className="block text-blue-600 hover:text-blue-800 hover:underline"
                            >
                                Change Password
                            </Link>
                            <p className="text-sm text-gray-600 mt-4">
                                Account created on: {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
