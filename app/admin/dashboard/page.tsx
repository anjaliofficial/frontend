"use client";

import { useAdmin, User, Post } from "../context/AdminContext";
import ProtectedRoute from "@/app/component/ProtectedRoute";

export default function DashboardPage() {
    const { users, posts } = useAdmin();

    const admins = users.filter((u) => u.role === "admin");
    const hosts = users.filter((u) => u.role === "host");
    const customers = users.filter((u) => u.role === "customer");

    const recentUsers = users.slice(-6).reverse();
    const recentPosts = posts.slice(-6).reverse();

    return (
        <ProtectedRoute adminOnly>
            <div className="space-y-10">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-gray-500 mt-1">Platform Overview - Sajilo Baas</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    <StatCard title="Total Users" value={users.length} color="bg-purple-100" textColor="text-purple-700" />
                    <StatCard title="Admins" value={admins.length} color="bg-red-100" textColor="text-red-700" />
                    <StatCard title="Hosts" value={hosts.length} color="bg-blue-100" textColor="text-blue-700" />
                    <StatCard title="Customers" value={customers.length} color="bg-green-100" textColor="text-green-700" />
                </div>

                {/* Recent Users */}
                <section className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                    <h2 className="text-xl font-semibold mb-4">Recent Users</h2>
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="text-left text-gray-500 border-b">
                                <th className="py-2">Name</th>
                                <th>Email</th>
                                <th>Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentUsers.map((u: User) => (
                                <tr key={u.id} className="border-b last:border-none hover:bg-gray-50 transition">
                                    <td className="py-2">{u.name}</td>
                                    <td>{u.email}</td>
                                    <td>
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-semibold ${u.role === "admin"
                                                ? "bg-red-100 text-red-700"
                                                : u.role === "host"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-green-100 text-green-700"
                                                }`}
                                        >
                                            {u.role.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                {/* Recent Posts */}
                <section className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                    <h2 className="text-xl font-semibold mb-4">Recent Listings</h2>
                    <ul className="space-y-3 text-sm">
                        {recentPosts.map((p: Post) => {
                            const host = users.find((u) => u.id === p.hostId);
                            return (
                                <li
                                    key={p.id}
                                    className="border-b pb-2 hover:bg-gray-50 transition rounded px-2"
                                >
                                    <strong>{p.title}</strong>
                                    <div className="text-gray-500 text-xs mt-1">Host: {host?.name || "-"}</div>
                                </li>
                            );
                        })}
                    </ul>
                </section>
            </div>
        </ProtectedRoute>
    );
}

/* ---------- Stats Card Component ---------- */
function StatCard({
    title,
    value,
    color,
    textColor,
}: {
    title: string;
    value: number;
    color: string;
    textColor: string;
}) {
    return (
        <div className={`p-6 rounded-xl shadow hover:shadow-lg transition ${color}`}>
            <p className="text-sm font-medium">{title}</p>
            <p className={`text-3xl font-bold mt-2 ${textColor}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">Nepal Region</p>
        </div>
    );
}
