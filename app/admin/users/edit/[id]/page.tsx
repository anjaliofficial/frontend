"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUsers } from "@/app/admin/context/UserContext";
// import { useUsers } from "../context/UsersContext";

export default function EditUserPage() {
    const router = useRouter();
    const params = useParams();
    const userId = Number(params.id);

    const { users, updateUser } = useUsers();
    const user = users.find(u => u.id === userId);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
        }
    }, [user]);

    if (!user) return <p>User not found</p>;

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        updateUser(userId, { name, email });
        router.push("/admin/users");
    };

    return (
        <form onSubmit={handleUpdate} className="p-6">
            <h2 className="text-2xl mb-4">Edit User</h2>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="border p-2 mb-3 w-full" required />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="border p-2 mb-3 w-full" required />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2">Update</button>
        </form>
    );
}
