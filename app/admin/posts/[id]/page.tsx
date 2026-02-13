"use client";

import { useAuth } from "@/context/AuthContext";
import { useAdmin } from "../../context/AdminContext";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/app/component/ProtectedRoute";

export default function PostViewPage() {
    const { id } = useParams();
    const { posts, users } = useAdmin();
    const { user } = useAuth();

    const post = posts.find(p => p.id === Number(id));

    if (!post) {
        return (
            <ProtectedRoute adminOnly={false}>
                <p>Post not found</p>
            </ProtectedRoute>
        );
    }

    if (user && user.role !== "admin" && user.role !== "host" && post.userId !== Number(user._id)) {
        return (
            <ProtectedRoute adminOnly={false}>
                <p>Access denied</p>
            </ProtectedRoute>
        );
    }

    const author = users.find(u => u.id === post.userId)?.name || "Unknown";
    const host = post.hostId ? users.find(u => u.id === post.hostId)?.name : "-";

    return (
        <ProtectedRoute adminOnly={false}>
            <div>
                <h2 className="text-2xl mb-4">{post.title}</h2>
                <p>{post.content}</p>
                <p>Author: {author}</p>
                <p>Host: {host}</p>
            </div>
        </ProtectedRoute>
    );
}