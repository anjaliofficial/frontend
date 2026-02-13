"use client";

import { useAuth } from "@/context/AuthContext";
// import ProtectedRoute from "../../../../components/ProtctedRoute";
import { useAdmin } from "../../../context/AdminContext";
// import { useAuth } from "../../../context/AuthContext";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import ProtectedRoute from "@/app/component/ProtectedRoute";

export default function PostEditPage() {
    const { id } = useParams();
    const { posts, updatePost, users } = useAdmin();
    const { user } = useAuth();

    const post = posts.find(p => p.id === Number(id));
    const [title, setTitle] = useState(post?.title || "");
    const [content, setContent] = useState(post?.content || "");
    const [hostId, setHostId] = useState<number | undefined>(post?.hostId);

    useEffect(() => {
        if (post) {
            setTitle(post.title);
            setContent(post.content);
            setHostId(post.hostId);
        }
    }, [post]);

    if (!post) return <ProtectedRoute adminOnly={false}><p>Post not found</p></ProtectedRoute>;
    if (user?.role !== "admin") return <ProtectedRoute adminOnly={false}><p>Access denied</p></ProtectedRoute>;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updatePost(post.id, { title, content, userId: post.userId, hostId });
        alert("Post updated!");
    };

    return (
        <ProtectedRoute adminOnly={true}>
            <div>
                <h2 className="text-2xl mb-4">Edit Post</h2>
                <form onSubmit={handleSubmit}>
                    <input value={title} onChange={e => setTitle(e.target.value)} className="border p-2 mb-3 w-full" required />
                    <textarea value={content} onChange={e => setContent(e.target.value)} className="border p-2 mb-3 w-full" required />
                    <select value={hostId} onChange={e => setHostId(Number(e.target.value))} className="border p-2 mb-3 w-full">
                        <option value={undefined}>Assign Host (optional)</option>
                        {users.filter(u => u.role === "host").map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </select>
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2">Save</button>
                </form>
            </div>
        </ProtectedRoute>
    );
}
