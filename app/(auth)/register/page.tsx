"use client";
import React from "react";
import RegisterForm from "../_components/RegisterForm";

export default function RegisterPage() {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', maxWidth: '1024px', width: '100%', minHeight: '650px' }}>

                {/* Left Side - Image */}
                <div style={{ width: '50%', display: 'block' }}>
                    <img
                        src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        alt="Nepal Scenery"
                    />
                </div>

                {/* Right Side - Form */}
                <div style={{ width: '50%', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <RegisterForm />
                </div>
            </div>
        </div>
    );
}