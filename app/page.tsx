"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    MapPin, Home, Shield, Star, Search, Calendar,
    Users, Filter, ChevronDown, Facebook, Instagram, Twitter
} from "lucide-react";

export default function LandingPage() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center font-sans">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#1a3a4a] rounded-xl flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">S</span>
                    </div>
                    <h1 className="text-3xl font-bold text-[#1a3a4a]">Sajilo Baas</h1>
                </div>
                <div className="mt-8 w-52 h-1.5 bg-slate-100 rounded-lg overflow-hidden">
                    <div className="h-full bg-[#1a3a4a] animate-[fill_2s_ease-in-out_forwards]" />
                </div>
                <style>{`@keyframes fill { from { width: 0%; } to { width: 100%; } }`}</style>
            </div>
        );
    }

    return (
        <div className="font-sans text-gray-800 bg-white">
            {/* NAVBAR */}
            <nav className="flex justify-between items-center px-16 py-4 border-b border-gray-200 sticky top-0 bg-white z-50">
                <div className="flex items-center gap-2 text-2xl font-bold text-[#1a3a4a]">
                    <div className="w-8 h-8 bg-[#1a3a4a] rounded-md flex items-center justify-center">
                        <span className="text-white text-sm">S</span>
                    </div>
                    Sajilo Baas
                </div>
                <div className="flex gap-6 items-center text-sm">
                    <Link href="#" className="text-gray-600">List a Property</Link>
                    <Link href="#" className="text-gray-600">About Us</Link>
                    <Link href="#" className="text-gray-600">Help</Link>
                    <Link href="/auth/login" className="text-[#1a3a4a] font-semibold px-4 py-2 rounded-lg bg-sky-100">Login</Link>
                    <Link href="/auth/register" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold">Sign Up</Link>
                </div>
            </nav>

            {/* HERO */}
            <header className="relative h-[550px] flex flex-col items-center justify-center text-center text-white">
                <div className="absolute inset-0">
                    <img src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2000" alt="Nepal Mountains" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40" />
                </div>
                <div className="relative z-10 mb-10">
                    <h1 className="text-5xl font-extrabold mb-2">Find Your Perfect Stay in Nepal</h1>
                    <p className="text-lg opacity-90">Discover and book unique homes and local experiences.</p>
                </div>

                {/* SEARCH BAR */}
                <div className="relative z-10 bg-white p-5 rounded-2xl flex items-center gap-4 shadow-xl w-11/12 max-w-4xl text-gray-700">
                    <div className="flex-1.5">
                        <label className="text-xs font-bold mb-1 block">Location</label>
                        <div className="flex items-center bg-slate-50 p-2 rounded-lg">
                            <Search size={18} className="text-slate-400" />
                            <input type="text" placeholder="e.g., Kathmandu" className="ml-2 w-full bg-transparent outline-none" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <label className="text-xs font-bold mb-1 block">Check-in</label>
                        <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                            <span className="text-slate-400 text-sm">Select Date</span>
                            <Calendar size={18} className="text-slate-400" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <label className="text-xs font-bold mb-1 block">Guests</label>
                        <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                            <span className="text-sm">2 Guests</span>
                            <ChevronDown size={18} className="text-slate-400" />
                        </div>
                    </div>
                    <button className="h-12 bg-[#1a3a4a] text-white px-6 rounded-lg font-bold flex items-center gap-2 hover:bg-[#162a38] transition">
                        <Search size={18} /> Search
                    </button>
                </div>
            </header>

            {/* ... keep Featured Listings, Destinations, CTA, Footer same but with Tailwind classes */}
        </div>
    );
}
