// "use client";
// import React from "react";
// import LoginForm from "@/app/(auth)/_components/LoginForm";

// export default function LoginPage() {
//     return (
//         <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6 font-sans">
//             <div className="bg-white rounded-3xl shadow-xl flex max-w-4xl w-full h-[600px] overflow-hidden">
//                 {/* Left Side Image */}
//                 <div className="w-1/2">
//                     <img
//                         src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
//                         alt="Interior"
//                         className="w-full h-full object-cover"
//                     />
//                 </div>
//                 {/* Right Side Form */}
//                 <div className="w-1/2 p-12 flex flex-col justify-center">
//                     <LoginForm />
//                 </div>
//             </div>
//         </div>
//     );
// }



"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        // FRONTEND ONLY: simulate login
        if (email === "admin@example.com" && password === "password") {
            localStorage.setItem("adminToken", "fake-jwt-token");
            router.push("/dashboard");
        } else {
            alert("Invalid credentials");
        }
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <form onSubmit={handleLogin} className="p-6 bg-white shadow rounded">
                <h2 className="text-2xl mb-4">Admin Login</h2>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-2 w-full mb-3"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border p-2 w-full mb-3"
                    required
                />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 w-full">
                    Login
                </button>
            </form>
        </div>
    );
}
