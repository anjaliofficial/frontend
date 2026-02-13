"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAdmin, User, Role } from "../context/AdminContext";

export default function UsersPage() {
    const { users, addUser, updateUser, deleteUser } = useAdmin();
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [form, setForm] = useState({ name: "", email: "", role: "customer" as Role });

    /* ---------- Handlers ---------- */
    const handleEdit = (user: User) => {
        setEditingUser(user);
        setForm({ name: user.name, email: user.email, role: user.role });
    };

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this user?")) {
            deleteUser(id);
            setEditingUser(null);
            setForm({ name: "", email: "", role: "customer" });
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email) return alert("Name and Email are required");

        if (editingUser) {
            updateUser(editingUser.id, form);
        } else {
            addUser(form);
        }

        setEditingUser(null);
        setForm({ name: "", email: "", role: "customer" });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Users Management</h2>

            {/* Form */}
            <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow space-y-3">
                <h3 className="font-semibold">{editingUser ? "Edit User" : "Add New User"}</h3>
                <input
                    type="text"
                    placeholder="Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="border px-3 py-2 rounded w-full"
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="border px-3 py-2 rounded w-full"
                    required
                />
                <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                    className="border px-3 py-2 rounded w-full"
                >
                    <option value="admin">Admin</option>
                    <option value="host">Host</option>
                    <option value="customer">Customer</option>
                </select>
                <div className="flex gap-3">
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                        {editingUser ? "Update" : "Add"}
                    </button>
                    {editingUser && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditingUser(null);
                                setForm({ name: "", email: "", role: "customer" });
                            }}
                            className="bg-gray-300 px-4 py-2 rounded"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            {/* Users Table */}
            <div className="bg-white p-6 rounded-xl shadow overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="text-left text-gray-500 border-b">
                            <th className="py-2">Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id} className="border-b last:border-none hover:bg-gray-50 transition">
                                <td className="py-2">{u.name}</td>
                                <td>{u.email}</td>
                                <td>{u.role}</td>
                                <td className="space-x-2">
                                    <button onClick={() => handleEdit(u)} className="text-blue-500 hover:underline">
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(u.id)} className="text-red-500 hover:underline">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center py-4 text-gray-500">
                                    No users found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
