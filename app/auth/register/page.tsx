"use client";
import React from "react";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', maxWidth: '1024px', width: '100%', height: '650px' }}>

                {/* Left Side - Image */}
                <div style={{ width: '50%', display: 'block' }}>
                    <img
                        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        alt="Interior"
                    />
                </div>

                {/* Right Side - Form */}
                <div style={{ width: '50%', padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <LoginForm />
                </div>
            </div>
        </div>
    );
}