"use client";
import { LayoutDashboard, Calendar, User, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#f8fafc', overflow: 'hidden', fontFamily: 'sans-serif' }}>

            {/* Sidebar - Locked Width */}
            <aside style={{
                width: '260px', minWidth: '260px', backgroundColor: '#1a3a4a',
                color: 'white', padding: '30px', display: 'flex', flexDirection: 'column'
            }}>
                <div style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', backgroundColor: '#3b82f6', borderRadius: '6px' }}></div>
                    <span>Sajilo Baas</span>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                        { icon: <LayoutDashboard size={18} />, label: "Overview" },
                        { icon: <Calendar size={18} />, label: "My Bookings" },
                        { icon: <User size={18} />, label: "Profile" },
                        { icon: <Settings size={18} />, label: "Settings" },
                    ].map((item, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                            borderRadius: '10px', color: i === 0 ? 'white' : '#94a3b8',
                            backgroundColor: i === 0 ? 'rgba(255,255,255,0.1)' : 'transparent',
                            cursor: 'pointer'
                        }}>
                            {item.icon}
                            <span style={{ fontSize: '14px', fontWeight: 500 }}>{item.label}</span>
                        </div>
                    ))}
                </nav>

                <Link href="/" style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                    color: '#f87171', textDecoration: 'none', marginTop: 'auto', fontSize: '14px'
                }}>
                    <LogOut size={18} />
                    <span>Logout</span>
                </Link>
            </aside>

            {/* Content Area */}
            <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}