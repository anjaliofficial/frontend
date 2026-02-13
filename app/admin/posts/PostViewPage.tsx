"use client";

import { useState } from "react";
import { useAdmin, Post, User } from "../context/AdminContext";
import ProtectedRoute from "@/app/component/ProtectedRoute";

export default function PostsPage() {
    const { posts: initialPosts, users, addPost, updatePost, deletePost } = useAdmin();
    const hosts = users.filter((u) => u.role === "host");

    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [form, setForm] = useState({ title: "", content: "", userId: hosts[0]?.id || 0, hostId: hosts[0]?.id || 0 });

    /* ---------- Handlers ---------- */
    const handleEdit = (post: Post) => {
        setEditingPost(post);
        setForm({ title: post.title, content: post.content, userId: post.userId, hostId: post.hostId || hosts[0]?.id || 0 });
    };

    const handleSave = () => {
        if (!form.title || !form.content) return alert("Title and Content required");

        if (editingPost) {
            updatePost(editingPost.id, form);
        } else {
            addPost(form);
        }

        setEditingPost(null);
        setForm({ title: "", content: "", userId: hosts[0]?.id || 0, hostId: hosts[0]?.id || 0 });
    };

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this post?")) deletePost(id);
    };

    return (
        <ProtectedRoute adminOnly>
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Posts Management</h1>

                {/* Form */}
                <div className="bg-white p-6 rounded-xl shadow space-y-3">
                    <h3 className="font-semibold">{editingPost ? "Edit Post" : "Add New Post"}</h3>
                    <input
                        type="text"
                        placeholder="Title"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="border px-3 py-2 rounded w-full"
                    />
                    <textarea
                        placeholder="Content"
                        value={form.content}
                        onChange={(e) => setForm({ ...form, content: e.target.value })}
                        className="border px-3 py-2 rounded w-full"
                    />
                    <select
                        value={form.userId}
                        onChange={(e) => setForm({ ...form, userId: Number(e.target.value) })}
                        className="border px-3 py-2 rounded w-full"
                    >
                        {hosts.map((h) => (
                            <option key={h.id} value={h.id}>
                                {h.name} (User)
                            </option>
                        ))}
                    </select>
                    <select
                        value={form.hostId}
                        onChange={(e) => setForm({ ...form, hostId: Number(e.target.value) })}
                        className="border px-3 py-2 rounded w-full"
                    >
                        {hosts.map((h) => (
                            <option key={h.id} value={h.id}>
                                {h.name} (Host)
                            </option>
                        ))}
                    </select>
                    <div className="flex gap-3">
                        <button type="button" onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded">
                            {editingPost ? "Update" : "Add"}
                        </button>
                        {editingPost && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingPost(null);
                                    setForm({ title: "", content: "", userId: hosts[0]?.id || 0, hostId: hosts[0]?.id || 0 });
                                }}
                                className="bg-gray-300 px-4 py-2 rounded"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>

                {/* Posts Table */}
                <div className="bg-white p-6 rounded-xl shadow overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="text-left text-gray-500 border-b">
                                <th className="py-2">Title</th>
                                <th>Content</th>
                                <th>User</th>
                                <th>Host</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {initialPosts.map((p) => {
                                const user = users.find((u) => u.id === p.userId);
                                const host = users.find((u) => u.id === p.hostId);
                                return (
                                    <tr key={p.id} className="border-b last:border-none hover:bg-gray-50 transition">
                                        <td className="py-2">{p.title}</td>
                                        <td>{p.content}</td>
                                        <td>{user?.name}</td>
                                        <td>{host?.name}</td>
                                        <td className="space-x-2">
                                            <button onClick={() => handleEdit(p)} className="text-blue-500 hover:underline">
                                                Edit
                                            </button>
                                            <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:underline">
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {initialPosts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-4 text-gray-500">
                                        No posts found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </ProtectedRoute>
    );
}
