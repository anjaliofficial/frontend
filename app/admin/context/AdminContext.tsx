"use client";

import { createContext, useContext, ReactNode, useState } from "react";

/* ---------- Types ---------- */

export type Role = "admin" | "host" | "customer";

export interface User {
    id: number;
    name: string;
    email: string;
    role: Role;
}

export interface Post {
    id: number;
    title: string;
    content: string;
    userId: number;
    hostId?: number;
}

/* ---------- Context Type ---------- */

interface AdminContextType {
    users: User[];
    posts: Post[];
    addUser: (user: Omit<User, "id">) => void;
    updateUser: (id: number, updated: Partial<User>) => void;
    deleteUser: (id: number) => void;
    addPost: (post: Omit<Post, "id">) => void;
    updatePost: (id: number, updated: Partial<Post>) => void;
    deletePost: (id: number) => void;
}

/* ---------- Context ---------- */

const AdminContext = createContext<AdminContextType | null>(null);

/* ---------- Provider ---------- */

export function AdminProvider({ children }: { children: ReactNode }) {
    const [users, setUsers] = useState<User[]>([
        { id: 1, name: "Anjali Apala", email: "anjali@nepal.com", role: "admin" },
        { id: 2, name: "Sneh Shrestha", email: "sneh@gmail.com", role: "host" },
        { id: 3, name: "Harman Kaur", email: "harman@gmail.com", role: "host" },
        { id: 4, name: "Harlen Gurung", email: "harlen@gmail.com", role: "host" },
        { id: 5, name: "Bibek Thapa", email: "bibek@gmail.com", role: "customer" },
        { id: 6, name: "Ritika Rai", email: "ritika@gmail.com", role: "customer" },
        { id: 7, name: "Aashish Karki", email: "aashish@gmail.com", role: "customer" },
        { id: 8, name: "Prerana Poudel", email: "prerana@gmail.com", role: "customer" },
        { id: 9, name: "Suman Bista", email: "suman@gmail.com", role: "customer" },
        { id: 10, name: "Nischal Adhikari", email: "nischal@gmail.com", role: "customer" },
    ]);

    const [posts, setPosts] = useState<Post[]>([
        {
            id: 1,
            title: "Luxury Apartment in Kathmandu",
            content: "Fully furnished apartment near Thamel with city view.",
            userId: 2,
            hostId: 2,
        },
        {
            id: 2,
            title: "Peaceful Homestay in Pokhara",
            content: "Lake-side homestay with mountain views and local food.",
            userId: 3,
            hostId: 3,
        },
        {
            id: 3,
            title: "Mountain View Room - Nagarkot",
            content: "Perfect sunrise view, quiet environment, ideal for couples.",
            userId: 4,
            hostId: 4,
        },
        {
            id: 4,
            title: "Budget Room in Lalitpur",
            content: "Affordable room close to city center.",
            userId: 2,
            hostId: 2,
        },
    ]);

    /* ---------- User CRUD ---------- */
    const addUser = (user: Omit<User, "id">) => {
        const newUser: User = { id: Date.now(), ...user };
        setUsers([...users, newUser]);
    };

    const updateUser = (id: number, updated: Partial<User>) => {
        setUsers(users.map((u) => (u.id === id ? { ...u, ...updated } : u)));
    };

    const deleteUser = (id: number) => {
        setUsers(users.filter((u) => u.id !== id));
        // Optional: Remove user's posts
        setPosts(posts.filter((p) => p.userId !== id && p.hostId !== id));
    };

    /* ---------- Post CRUD ---------- */
    const addPost = (post: Omit<Post, "id">) => {
        const newPost: Post = { id: Date.now(), ...post };
        setPosts([...posts, newPost]);
    };

    const updatePost = (id: number, updated: Partial<Post>) => {
        setPosts(posts.map((p) => (p.id === id ? { ...p, ...updated } : p)));
    };

    const deletePost = (id: number) => {
        setPosts(posts.filter((p) => p.id !== id));
    };

    return (
        <AdminContext.Provider
            value={{
                users,
                posts,
                addUser,
                updateUser,
                deleteUser,
                addPost,
                updatePost,
                deletePost,
            }}
        >
            {children}
        </AdminContext.Provider>
    );
}

/* ---------- Hook ---------- */

export function useAdmin(): AdminContextType {
    const context = useContext(AdminContext);
    if (!context) throw new Error("useAdmin must be used inside AdminProvider");
    return context;
}
