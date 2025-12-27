"use client";
import { Mail, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation'; // 1. Import the router

export default function LoginForm() {
    const router = useRouter(); // 2. Initialize the router

    const handleLogin = () => {
        // 3. Simple direct redirect to dashboard
        router.push('/dashboard');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Welcome back to Sajilo Baas</h2>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Login with your registered Email & Password</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Email</label>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '8px', padding: '0 12px' }}>
                        <Mail size={18} color="#9ca3af" />
                        <input type="email" placeholder="E-mail@example.com" style={{ width: '100%', padding: '12px', border: 'none', outline: 'none' }} />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Password</label>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '8px', padding: '0 12px' }}>
                        <Lock size={18} color="#9ca3af" />
                        <input type="password" placeholder="Password" style={{ width: '100%', padding: '12px', border: 'none', outline: 'none' }} />
                    </div>
                </div>
            </div>

            {/* 4. Added onClick handler here */}
            <button
                onClick={handleLogin}
                style={{ width: '100%', backgroundColor: '#1e3a4c', color: 'white', padding: '12px', borderRadius: '8px', fontWeight: '600', border: 'none', cursor: 'pointer' }}
            >
                Log In
            </button>

            <div style={{ textAlign: 'center' }}>
                <button style={{ fontSize: '14px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Forgot password?</button>
            </div>

            <p style={{ textAlign: 'center', fontSize: '14px', color: '#4b5563' }}>
                Don't have an account? <a href="/auth/register" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>Register Now</a>
            </p>
        </div>
    );
}