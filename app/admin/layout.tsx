"use client";

import { ReactNode } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/app/component/ProtectedRoute";
import { AdminProvider } from "./context/AdminContext";

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <AdminProvider>
                <ProtectedRoute adminOnly>
                    <AdminShell>{children}</AdminShell>
                </ProtectedRoute>
            </AdminProvider>
        </AuthProvider>
    );
}

function AdminShell({ children }: { children: ReactNode }) {
    const { user, logout } = useAuth();

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white p-6 flex flex-col">
                <h2 className="text-xl font-bold">Admin Panel</h2>
                <p className="text-sm text-gray-400 mt-1">{user?.email}</p>

                <nav className="mt-6 flex-1 space-y-2">
                    <NavLink href="/admin/dashboard">Dashboard</NavLink>
                    <NavLink href="/admin/users">Users</NavLink>
                    <NavLink href="/admin/posts">Posts</NavLink>
                </nav>

                <button
                    onClick={logout}
                    className="mt-6 bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition"
                >
                    Logout
                </button>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-8 bg-gray-100 overflow-auto">{children}</main>
        </div>
    );
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
    return (
        <a
            href={href}
            className="block py-2 px-3 rounded hover:bg-gray-700 transition"
        >
            {children}
        </a>
    );
}