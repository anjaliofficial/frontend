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
            <div style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '50px', height: '50px', backgroundColor: '#1a3a4a', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>S</span>
                    </div>
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a3a4a', margin: 0 }}>Sajilo Baas</h1>
                </div>
                <div style={{ marginTop: '30px', width: '200px', height: '5px', backgroundColor: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', backgroundColor: '#1a3a4a', width: '0%', animation: 'fill 2s ease-in-out forwards' }} />
                </div>
                <style>{`@keyframes fill { from { width: 0%; } to { width: 100%; } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ fontFamily: 'sans-serif', color: '#333', margin: 0, backgroundColor: '#fff' }}>

            {/* 1. NAVBAR */}
            <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 60px', alignItems: 'center', borderBottom: '1px solid #eee', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 100 }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a3a4a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', backgroundColor: '#1a3a4a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: 'white', fontSize: '16px' }}>S</span>
                    </div>
                    Sajilo Baas
                </div>
                <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
                    <Link href="#" style={{ textDecoration: 'none', color: '#666', fontSize: '14px' }}>List a Property</Link>
                    <Link href="#" style={{ textDecoration: 'none', color: '#666', fontSize: '14px' }}>About Us</Link>
                    <Link href="#" style={{ textDecoration: 'none', color: '#666', fontSize: '14px' }}>Help</Link>
                    <Link href="/auth/login" style={{ textDecoration: 'none', color: '#1a3a4a', fontWeight: '600', padding: '8px 16px', borderRadius: '8px', backgroundColor: '#e0f2fe' }}>Login</Link>
                    <Link href="/auth/register" style={{ textDecoration: 'none', backgroundColor: '#3b82f6', color: 'white', padding: '8px 20px', borderRadius: '8px', fontWeight: '600' }}>Sign Up</Link>
                </div>
            </nav>

            {/* 2. HERO SECTION */}
            <header style={{ position: 'relative', height: '550px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', textAlign: 'center' }}>
                <div style={{ position: 'absolute', inset: 0 }}>
                    <img src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2000" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Nepal Mountains" />
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }}></div>
                </div>

                <div style={{ position: 'relative', zIndex: 2, marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '10px' }}>Find Your Perfect Stay in Nepal</h1>
                    <p style={{ fontSize: '18px', opacity: 0.9 }}>Discover and book unique homes and local experiences.</p>
                </div>

                {/* ADVANCED SEARCH BAR */}
                <div style={{
                    position: 'relative', zIndex: 2, backgroundColor: 'white', padding: '20px',
                    borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', width: '90%', maxWidth: '1000px',
                    color: '#444'
                }}>
                    <div style={{ flex: 1.5, textAlign: 'left' }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Location</label>
                        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                            <Search size={18} color="#94a3b8" />
                            <input type="text" placeholder="e.g., Kathmandu" style={{ border: 'none', background: 'transparent', outline: 'none', marginLeft: '10px', width: '100%' }} />
                        </div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Check-in</label>
                        <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#94a3b8', fontSize: '14px' }}>Select Date</span>
                            <Calendar size={18} color="#94a3b8" />
                        </div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Guests</label>
                        <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '14px' }}>2 Guests</span>
                            <ChevronDown size={18} color="#94a3b8" />
                        </div>
                    </div>
                    <button style={{ height: '48px', backgroundColor: '#1a3a4a', color: 'white', border: 'none', padding: '0 30px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', alignSelf: 'flex-end' }}>
                        <Search size={18} /> Search
                    </button>
                </div>
            </header>

            {/* 3. FILTER BAR */}
            <section style={{ padding: '30px 60px', display: 'flex', gap: '15px' }}>
                <button style={filterBtnStyle}><Home size={16} /> Property Type <ChevronDown size={14} /></button>
                <button style={filterBtnStyle}><Star size={16} /> Price Range <ChevronDown size={14} /></button>
                <button style={filterBtnStyle}><Filter size={16} /> More Filters</button>
            </section>

            {/* 4. FEATURED LISTINGS */}
            <section style={{ padding: '20px 60px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '25px' }}>Featured Listings</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
                    <ListingCard
                        img="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500"
                        title="Modern City View Apartment"
                        loc="Kathmandu, Nepal"
                        price="4,500"
                        rating="4.9"
                    />
                    <ListingCard
                        img="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500"
                        title="Historic Bhaktapur Home"
                        loc="Bhaktapur, Nepal"
                        price="3,200"
                        rating="4.8"
                    />
                    <ListingCard
                        img="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500"
                        title="Lakeside Guesthouse"
                        loc="Pokhara, Nepal"
                        price="2,800"
                        rating="4.9"
                    />
                    <ListingCard
                        img="https://images.unsplash.com/photo-1464146072230-91cabc968266?w=500"
                        title="Mountain Vista Villa"
                        loc="Nagarkot, Nepal"
                        price="12,500"
                        rating="5.0"
                    />
                </div>
            </section>

            {/* 5. POPULAR DESTINATIONS */}
            <section style={{ padding: '60px 60px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '25px' }}>Explore Popular Destinations</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px' }}>
                    <DestCard img="https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?w=600" name="Kathmandu" />
                    <DestCard img="https://th.bing.com/th/id/R.d0b71f480e0c0b6644e30386659ff6c4?rik=W5FU6TRLGO%2bYlw&riu=http%3a%2f%2fwww.horizontravelindia.com%2fwp-content%2fuploads%2f2017%2f10%2fPokhara.jpg&ehk=M0OQFBaSznPUc%2fjW6ATOfjljVtAeut0oCLxglKiAKCA%3d&risl=&pid=ImgRaw&r=0" name="Pokhara" />
                    <DestCard img="https://irp.cdn-website.com/ca5742e6/dms3rep/multi/Chitwan_Elephant_Ride.jpg" name="Chitwan" />
                </div>
            </section>

            {/* 6. HOSTING CTA */}
            <section style={{ margin: '60px', padding: '60px', borderRadius: '24px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ maxWidth: '500px' }}>
                    <h2 style={{ fontSize: '36px', color: '#1a3a4a', marginBottom: '20px', fontWeight: 'bold' }}>Become a Host</h2>
                    <p style={{ fontSize: '18px', color: '#64748b', marginBottom: '30px', lineHeight: '1.6' }}>Earn extra income by sharing your space with travelers from around the world. We make it easy to list and manage your property.</p>
                    <button style={{ backgroundColor: '#1a3a4a', color: 'white', padding: '15px 40px', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>List Your Property</button>
                </div>
                <img src="https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=500" style={{ width: '450px', borderRadius: '20px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} alt="Hosting" />
            </section>

            {/* 7. FOOTER */}
            <footer style={{ padding: '60px', borderTop: '1px solid #eee', backgroundColor: '#fff' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px', marginBottom: '60px' }}>
                    <div>
                        <h4 style={{ marginBottom: '20px', color: '#1a3a4a' }}>Support</h4>
                        <div style={footerLinkStyle}>Help Center</div>
                        <div style={footerLinkStyle}>Contact Us</div>
                        <div style={footerLinkStyle}>Cancellation options</div>
                        <div style={footerLinkStyle}>Safety information</div>
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '20px', color: '#1a3a4a' }}>Company</h4>
                        <div style={footerLinkStyle}>About Us</div>
                        <div style={footerLinkStyle}>Careers</div>
                        <div style={footerLinkStyle}>Press</div>
                        <div style={footerLinkStyle}>Blog</div>
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '20px', color: '#1a3a4a' }}>Hosting</h4>
                        <div style={footerLinkStyle}>List your property</div>
                        <div style={footerLinkStyle}>Hosting resources</div>
                        <div style={footerLinkStyle}>Community forum</div>
                        <div style={footerLinkStyle}>Hosting responsibly</div>
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '20px', color: '#1a3a4a' }}>Sajilo Baas</h4>
                        <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>Providing the easiest way to find and book your stay in the Himalayas.</p>
                        <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                            <Facebook size={20} color="#1a3a4a" />
                            <Instagram size={20} color="#1a3a4a" />
                            <Twitter size={20} color="#1a3a4a" />
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: '30px', fontSize: '14px', color: '#64748b' }}>
                    <span>© 2025 Sajilo Baas. All rights reserved.</span>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <span>Privacy Policy</span>
                        <span>Terms of Service</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// Styling Constants
const filterBtnStyle = {
    padding: '10px 20px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#fff',
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer'
};

const footerLinkStyle = {
    color: '#64748b',
    fontSize: '14px',
    marginBottom: '12px',
    cursor: 'pointer'
};

// Helper Components
function ListingCard({ img, title, loc, price, rating }: any) {
    return (
        <div style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
            <img src={img} style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '16px', marginBottom: '15px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{title}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 'bold' }}>
                    <Star size={14} fill="#f59e0b" color="#f59e0b" /> {rating}
                </div>
            </div>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '5px 0' }}>{loc}</p>
            <p style={{ margin: '5px 0', fontWeight: 'bold', fontSize: '16px' }}>
                Rs. {price} <span style={{ fontWeight: 'normal', color: '#64748b', fontSize: '14px' }}>/ night</span>
            </p>
        </div>
    );
}

function DestCard({ img, name }: any) {
    return (
        <div style={{ position: 'relative', height: '300px', borderRadius: '20px', overflow: 'hidden', cursor: 'pointer' }}>
            <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '25px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                <h3 style={{ color: 'white', margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{name}</h3>
            </div>
        </div>
    );
}