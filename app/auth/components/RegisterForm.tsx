"use client";
import React, { useState } from "react";
import { Mail, Lock, User, Phone } from "lucide-react";

export default function RegisterForm() {
    const [role, setRole] = useState<"User" | "Hosts">("User");

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Register to Sajilo Baas</h2>

            {/* Role Toggle */}
            <div style={{ display: 'flex', backgroundColor: '#f3f4f6', padding: '4px', borderRadius: '8px', width: 'fit-content' }}>
                <button
                    onClick={() => setRole("User")}
                    style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', backgroundColor: role === "User" ? "white" : "transparent", boxShadow: role === "User" ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}
                >User</button>
                <button
                    onClick={() => setRole("Hosts")}
                    style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', backgroundColor: role === "Hosts" ? "white" : "transparent", boxShadow: role === "Hosts" ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}
                >Hosts</button>
            </div>

            <form style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <InputField label="Name" icon={<User size={18} color="#9ca3af" />} placeholder="John Doe" />
                <InputField label="Email" icon={<Mail size={18} color="#9ca3af" />} placeholder="email@example.com" />
                <InputField label="Password" icon={<Lock size={18} color="#9ca3af" />} placeholder="••••••••" type="password" />
                <InputField label="Phone Number" icon={<Phone size={18} color="#9ca3af" />} placeholder="+977-98000000" />

                <button type="submit" style={{ marginTop: '10px', backgroundColor: '#1a3a4a', color: 'white', padding: '14px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
                    Register as {role}
                </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>
                Already have an account? <a href="/auth/login" style={{ color: '#2563eb', fontWeight: 'bold', textDecoration: 'none' }}>Sign In Now</a>
            </p>
        </div>
    );
}

function InputField({ label, icon, placeholder, type = "text" }: any) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>{label}</label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '8px', padding: '0 12px' }}>
                {icon}
                <input type={type} placeholder={placeholder} style={{ width: '100%', padding: '10px', border: 'none', outline: 'none', fontSize: '14px' }} />
            </div>
        </div>
    );
}