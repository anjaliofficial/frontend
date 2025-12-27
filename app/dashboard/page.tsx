"use client";
import React, { useState, useEffect } from "react";
import { LayoutDashboard, Calendar, User, Settings, LogOut } from "lucide-react";

export default function EmergencyPage() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 2500);
        return () => clearTimeout(timer);
    }, []);

    // 1. SPLASH SCREEN UI
    if (loading) {
        return (
            <div style={{ position: 'fixed', inset: 0, zIndex: 999, backgroundColor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '50px', height: '50px', backgroundColor: '#1a3a4a', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>S</span>
                    </div>
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a3a4a', margin: 0 }}>Sajilo Baas</h1>
                </div>
                <div style={{ marginTop: '30px', width: '200px', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', backgroundColor: '#1a3a4a', width: '0%', animation: 'load 2.5s ease-in-out forwards' }} />
                </div>
                <style>{`@keyframes load { from { width: 0%; } to { width: 100%; } }`}</style>
            </div>
        );
    }

    // 2. DASHBOARD UI (The "After Loading" view)
    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#f8fafc', fontFamily: 'sans-serif', margin: 0 }}>
            {/* Sidebar */}
            <aside style={{ width: '260px', backgroundColor: '#1a3a4a', color: 'white', padding: '30px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '40px' }}>Sajilo Baas</div>
                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px', padding: '12px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                        <LayoutDashboard size={20} /> Dashboard
                    </div>
                    <div style={{ display: 'flex', gap: '10px', padding: '12px', color: '#94a3b8' }}>
                        <Calendar size={20} /> Bookings
                    </div>
                    <div style={{ display: 'flex', gap: '10px', padding: '12px', color: '#94a3b8' }}>
                        <User size={20} /> Profile
                    </div>
                </nav>
                <div style={{ color: '#f87171', display: 'flex', gap: '10px', padding: '12px', cursor: 'pointer' }}>
                    <LogOut size={20} /> Logout
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '40px' }}>
                <h1 style={{ color: '#1a3a4a', margin: 0 }}>Welcome back, User!</h1>
                <p style={{ color: '#64748b' }}>Here is your stay overview in Nepal.</p>

                <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
                    <div style={{ flex: 1, backgroundColor: 'white', padding: '25px', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
                        <div style={{ color: '#64748b', fontSize: '12px' }}>ACTIVE BOOKINGS</div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a3a4a' }}>02</div>
                    </div>
                    <div style={{ flex: 1, backgroundColor: 'white', padding: '25px', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
                        <div style={{ color: '#64748b', fontSize: '12px' }}>REVIEWS</div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a3a4a' }}>08</div>
                    </div>
                </div>
            </main>
        </div>
    );
}