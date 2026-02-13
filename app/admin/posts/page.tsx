"use client";

import { useState } from "react";
import { useAdmin, Post, User, Role } from "../context/AdminContext";
import ProtectedRoute from "@/app/component/ProtectedRoute";

export default function PostsPage() {
    const { posts: initialPosts, users } = useAdmin();
    const hosts = users.filter((u) => u.role === "host");

    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [form, setForm] = useState({ title: "", userId: hosts[0]?.id || 0, hostId: hosts[0]?.id || 0 });

    /* ---------- Handlers ---------- */
    const handleEdit = (post: Post) => {
        setEditingPost(post);
        setForm({ title: post.title, userId: post.userId, hostId: post.hostId || hosts[0]?.id || 0 });
    };

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this post?")) {
            setPosts(posts.filter((p) => p.id !== id));
        }
    };

    const handleSave = () => {
        if (!form.title) return alert("Title required");

        if (editingPost) {
            setPosts(
                posts.map((p) =>
                    p.id === editingPost.id
                        ? { ...p, title: form.title, userId: form.userId, hostId: form.hostId }
                        : p
                )
            );
        } else {
            const newPost: Post = { id: Date.now(), ...form };
            setPosts([...posts, newPost]);
        }

        setEditingPost(null);
        setForm({ title: "", userId: hosts[0]?.id || 0, hostId: hosts[0]?.id || 0 });
    };

    return (
        <ProtectedRoute adminOnly>
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Posts Management</h1>

                {/* Form */}
                <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="font-semibold mb-3">{editingPost ? "Edit Post" : "Add New Post"}</h2>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            placeholder="Title"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="border px-3 py-2 rounded flex-1"
                        />
                        <select
                            value={form.userId}
                            onChange={(e) => setForm({ ...form, userId: Number(e.target.value) })}
                            className="border px-3 py-2 rounded"
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
                            className="border px-3 py-2 rounded"
                        >
                            {hosts.map((h) => (
                                <option key={h.id} value={h.id}>
                                    {h.name} (Host)
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={handleSave}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
                        >
                            {editingPost ? "Update" : "Add"}
                        </button>
                        {editingPost && (
                            <button
                                onClick={() => {
                                    setEditingPost(null);
                                    setForm({ title: "", userId: hosts[0]?.id || 0, hostId: hosts[0]?.id || 0 });
                                }}
                                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded transition"
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
                                <th>User</th>
                                <th>Host</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map((p) => {
                                const user = users.find((u) => u.id === p.userId);
                                const host = users.find((u) => u.id === p.hostId);
                                return (
                                    <tr key={p.id} className="border-b last:border-none hover:bg-gray-50 transition">
                                        <td className="py-2">{p.title}</td>
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
                            {posts.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-4 text-gray-500">
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
