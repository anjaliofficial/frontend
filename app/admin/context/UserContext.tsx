"use client";

import { createContext, useContext, ReactNode, useState } from "react";

export interface User {
    id: number;
    name: string;
    email: string;
}

interface UsersContextType {
    users: User[];
    addUser: (user: Omit<User, "id">) => void;
    updateUser: (id: number, user: Omit<User, "id">) => void;
    deleteUser: (id: number) => void;
}

const UsersContext = createContext<UsersContextType | null>(null);

export function UsersProvider({ children }: { children: ReactNode }) {
    const [users, setUsers] = useState<User[]>([
        { id: 1, name: "John Doe", email: "john@example.com" },
        { id: 2, name: "Jane Smith", email: "jane@example.com" },
        { id: 3, name: "Alice Lee", email: "alice@example.com" },
    ]);

    const addUser = (user: Omit<User, "id">) => {
        setUsers([...users, { id: Date.now(), ...user }]);
    };

    const updateUser = (id: number, updated: Omit<User, "id">) => {
        setUsers(users.map(u => (u.id === id ? { id, ...updated } : u)));
    };

    const deleteUser = (id: number) => {
        setUsers(users.filter(u => u.id !== id));
    };

    return (
        <UsersContext.Provider value={{ users, addUser, updateUser, deleteUser }}>
            {children}
        </UsersContext.Provider>
    );
}

export function useUsers() {
    const context = useContext(UsersContext);
    if (!context) throw new Error("useUsers must be used inside UsersProvider");
    return context;
}
