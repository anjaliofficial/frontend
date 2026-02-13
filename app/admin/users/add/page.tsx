"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUsers } from "../../context/UserContext";
// import { useUsers } from "../context/UsersContext";

export default function AddUserPage() {
    const router = useRouter();
    const { addUser } = useUsers();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        addUser({ name, email });
        router.push("/admin/users");
    };

    return (
        <form onSubmit={handleAdd} className="p-6">
            <h2 className="text-2xl mb-4">Add User</h2>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="border p-2 mb-3 w-full" required />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="border p-2 mb-3 w-full" required />
            <button type="submit" className="bg-green-500 text-white px-4 py-2">Add</button>
        </form>
    );
}
