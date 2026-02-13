"use client";

import { useAuth } from "@/context/AuthContext";
// import ProtectedRoute from "../../../components/ProtectedRoute";
import { useAdmin } from "../../context/AdminContext";
// import { useAuth } from "../../../context/AuthContext";
import { useState } from "react";
import ProtectedRoute from "@/app/component/ProtectedRoute";

export default function PostCreatePage() {
    const { addPost, users } = useAdmin();
    const { user } = useAuth();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [hostId, setHostId] = useState<number | undefined>(undefined);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        addPost({ title, content, userId: user.id, hostId });
        alert("Post created!");
        setTitle(""); setContent(""); setHostId(undefined);
    };

    return (
        <ProtectedRoute adminOnly={user?.role === "admin"}>
            <div>
                <h2 className="text-2xl mb-4">Create Post</h2>
                <form onSubmit={handleSubmit}>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="border p-2 mb-3 w-full" required />
                    <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Content" className="border p-2 mb-3 w-full" required />
                    <select value={hostId} onChange={e => setHostId(Number(e.target.value))} className="border p-2 mb-3 w-full">
                        <option value={undefined}>Assign Host (optional)</option>
                        {users.filter(u => u.role === "host").map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </select>
                    <button type="submit" className="bg-green-500 text-white px-4 py-2">Create</button>
                </form>
            </div>
        </ProtectedRoute>
    );
}
