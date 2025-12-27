"use client";
import React from "react";
import { Home, Users, CheckCircle, Clock } from "lucide-react";

export default function DashboardOverview() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* Header Section */}
            <div>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a3a4a', margin: '0 0 8px 0' }}>
                    Welcome back, User!
                </h1>
                <p style={{ color: '#64748b', margin: 0 }}>Here is what's happening with your bookings today.</p>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px'
            }}>
                <StatCard icon={<Home color="#3b82f6" />} label="Total Listings" value="12" />
                <StatCard icon={<CheckCircle color="#10b981" />} label="Active Bookings" value="5" />
                <StatCard icon={<Clock color="#f59e0b" />} label="Pending Requests" value="3" />
                <StatCard icon={<Users color="#8b5cf6" />} label="Total Reviews" value="48" />
            </div>

            {/* Recent Activity Table */}
            <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
            }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#1a3a4a' }}>Recent Bookings</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #f1f5f9', color: '#94a3b8', fontSize: '14px' }}>
                            <th style={{ padding: '12px 0' }}>Property</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        <TableRow name="Peaceful Lakeside Villa" date="Oct 24, 2023" status="Confirmed" price="Rs. 5,500" />
                        <TableRow name="Modern City Apartment" date="Oct 22, 2023" status="Pending" price="Rs. 3,200" />
                        <TableRow name="Mountain View Cottage" date="Oct 20, 2023" status="Cancelled" price="Rs. 4,800" />
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Helper Component for Stats
function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '12px' }}>{icon}</div>
            <div>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>{label}</p>
                <h4 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>{value}</h4>
            </div>
        </div>
    );
}

// Helper Component for Table Rows
function TableRow({ name, date, status, price }: any) {
    const statusColor = status === "Confirmed" ? "#10b981" : status === "Pending" ? "#f59e0b" : "#ef4444";
    return (
        <tr style={{ borderBottom: '1px solid #f8fafc', fontSize: '14px' }}>
            <td style={{ padding: '16px 0', fontWeight: 500, color: '#1e293b' }}>{name}</td>
            <td style={{ color: '#64748b' }}>{date}</td>
            <td><span style={{ color: statusColor, fontWeight: 600 }}>{status}</span></td>
            <td style={{ fontWeight: 'bold' }}>{price}</td>
        </tr>
    );
}