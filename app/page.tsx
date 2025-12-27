"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "./public/components/Header"; // Adjust path as needed
import { MapPin, Home, Shield, Star, Search, Calendar, Users, Filter, ChevronDown } from "lucide-react";

export default function LandingPage() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 200);
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

            {/* 2. HERO SECTION WITH ENHANCED SEARCH */}
            <header style={{ position: 'relative', height: '550px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', textAlign: 'center' }}>
                <div style={{ position: 'absolute', inset: 0 }}>
                    <img src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2000" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Nepal Mountains" />
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)' }}></div>
                </div>

                <div style={{ position: 'relative', zIndex: 2, marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '10px' }}>Find Your Perfect Stay in Nepal</h1>
                    <p style={{ fontSize: '18px', opacity: 0.9 }}>Discover and book unique homes and experiences.</p>
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
                            <span style={{ color: '#94a3b8' }}>mm/dd/yyyy</span>
                            <Calendar size={18} color="#94a3b8" />
                        </div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Check-out</label>
                        <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#94a3b8' }}>mm/dd/yyyy</span>
                            <Calendar size={18} color="#94a3b8" />
                        </div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Guests</label>
                        <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>2 guests</span>
                            <ChevronDown size={18} color="#94a3b8" />
                        </div>
                    </div>
                    <button style={{ height: '45px', backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '0 30px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', alignSelf: 'flex-end' }}>
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
                        price="50"
                        rating="4.9"
                    />
                    <ListingCard
                        img="https://th.bing.com/th/id/R.033701613801a7c0387f5c334c6114ff?rik=VGcgD2ACZbUi4A&pid=ImgRaw&r=0"
                        title="Historic Bhaktapur Home"
                        loc="Bhaktapur, Nepal"
                        price="4500"
                        rating="4.8"
                    />
                    <ListingCard
                        img="https://tse2.mm.bing.net/th/id/OIP.8JQNBGAwYip-2nciBQLcowHaLG?rs=1&pid=ImgDetMain&o=7&rm=3"
                        title="Lakeside Guesthouse"
                        loc="Pokhara, Nepal"
                        price="40"
                        rating="4.9"
                    />
                    <ListingCard
                        img="https://images.unsplash.com/photo-1464146072230-91cabc968266?w=500"
                        title="Mountain Vista Villa"
                        loc="Nagarkot, Nepal"
                        price="120"
                        rating="5.0"
                    />
                </div>
            </section>

            {/* 5. POPULAR DESTINATIONS */}
            <section style={{ padding: '60px 60px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '25px' }}>Explore Popular Destinations</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px' }}>
                    <DestCard img="https://tse1.mm.bing.net/th/id/OIP.sKUty3APE68n5A-isNqBeAHaFj?rs=1&pid=ImgDetMain&o=7&rm=3" name="Kathmandu" />
                    <DestCard img="https://th.bing.com/th/id/R.92459da57f847882a1d348c230969663?rik=VAUvO%2bPyzftvmA&riu=http%3a%2f%2flamakarma.net%2fwp-content%2fuploads%2fFewa_Lake_Pokhara_Nepal.jpg&ehk=100QwiT4a4%2fnZMwM8236SPVGA%2fnfLuWvstY4Wz95%2fIo%3d&risl=&pid=ImgRaw&r=0" name="Pokhara" />
                    <DestCard img="https://irp.cdn-website.com/ca5742e6/dms3rep/multi/Chitwan_Elephant_Ride.jpg" name="Chitwan" />
                </div>
            </section>

            {/* 6. HOSTING CALL TO ACTION */}
            <section style={{ margin: '60px', padding: '60px', borderRadius: '24px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ maxWidth: '500px' }}>
                    <h2 style={{ fontSize: '36px', color: '#1a3a4a', marginBottom: '20px' }}>Become a Host</h2>
                    <p style={{ fontSize: '18px', color: '#64748b', marginBottom: '30px' }}>Earn extra income by sharing your space with travelers from around the world.</p>
                    <button style={{ backgroundColor: '#1a3a4a', color: 'white', padding: '15px 40px', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>List Your Property</button>
                </div>
                <img src="https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=500" style={{ width: '400px', borderRadius: '20px' }} alt="Hosting" />
            </section>

            {/* 7. FOOTER */}
            <footer style={{ padding: '60px', borderTop: '1px solid #eee', backgroundColor: '#fff' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px', marginBottom: '60px' }}>
                    <div>
                        <h4 style={{ marginBottom: '20px' }}>Support</h4>
                        <div style={footerLinkStyle}>Help Center</div>
                        <div style={footerLinkStyle}>Contact Us</div>
                        <div style={footerLinkStyle}>Cancellation options</div>
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '20px' }}>Company</h4>
                        <div style={footerLinkStyle}>About Us</div>
                        <div style={footerLinkStyle}>Careers</div>
                        <div style={footerLinkStyle}>Press</div>
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '20px' }}>Hosting</h4>
                        <div style={footerLinkStyle}>List your property</div>
                        <div style={footerLinkStyle}>Hosting resources</div>
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '20px' }}>Follow Us</h4>
                        {/* Social icons would go here */}
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: '30px', fontSize: '14px', color: '#64748b' }}>
                    <span>© 2024 Nepal Stays. All rights reserved.</span>
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
    backgroundColor: '#eff6ff',
    color: '#3b82f6',
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
        <div style={{ cursor: 'pointer' }}>
            <img src={img} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '16px', marginBottom: '15px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={{ margin: 0, fontSize: '16px' }}>{title}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 'bold' }}>
                    <Star size={14} fill="#f59e0b" color="#f59e0b" /> {rating}
                </div>
            </div>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '5px 0' }}>{loc}</p>
            <p style={{ margin: '5px 0', fontWeight: 'bold' }}>${price} <span style={{ fontWeight: 'normal', color: '#64748b' }}>/ night</span></p>
        </div>
    );
}

function DestCard({ img, name }: any) {
    return (
        <div style={{ position: 'relative', height: '350px', borderRadius: '20px', overflow: 'hidden', cursor: 'pointer' }}>
            <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '25px', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
                <h3 style={{ color: 'white', margin: 0, fontSize: '24px' }}>{name}</h3>
            </div>
        </div>
    );
}