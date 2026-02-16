"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/admin/context/AuthContext";
import { getDashboardPath } from "@/lib/auth/roles";

interface BookingStats {
    totalBookings: number;
    confirmed: number;
    pending: number;
    revenue: number;
}

export default function HostBookingsPage() {
    const { user, loading } = useAuth();
    const [ready, setReady] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState<BookingStats | null>(null);
    const [bookingLoading, setBookingLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (loading) return;
        if (!user) {
            router.replace("/login");
            return;
        }
        if (user.role !== "host") {
            router.replace(getDashboardPath(user.role));
            return;
        }
        setReady(true);
        fetchBookings();
    }, [loading, user, router]);

    const fetchBookings = async () => {
        try {
            console.log("Fetching bookings from /api/bookings/host");
            const response = await fetch("/api/bookings/host", {
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });

            console.log("Response status:", response.status);
            const data = await response.json();
            console.log("Response data:", data);

            if (!response.ok) {
                throw new Error(`API returned ${response.status}: ${data?.message || "Failed to fetch bookings"}`);
            }

            setBookings(data.bookings || []);

            if (data.bookings) {
                const totalBookings = data.bookings.length;
                const confirmed = data.bookings.filter((b: any) => b.status === "confirmed").length;
                const pending = data.bookings.filter((b: any) => b.status === "pending").length;
                const revenue = data.bookings
                    .filter((b: any) => b.status === "confirmed")
                    .reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0);
                setStats({ totalBookings, confirmed, pending, revenue });
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
        } finally {
            setBookingLoading(false);
        }
    };

    const acceptBooking = async (bookingId: string) => {
        try {
            await fetch(`/api/bookings/host/${bookingId}/accept`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            fetchBookings();
        } catch (error) {
            console.error("Error accepting booking:", error);
        }
    };

    const rejectBooking = async (bookingId: string) => {
        try {
            await fetch(`/api/bookings/host/${bookingId}/reject`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            fetchBookings();
        } catch (error) {
            console.error("Error rejecting booking:", error);
        }
    };

    if (!ready || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Bookings Management 📋</h1>
                <p className="text-gray-600 text-lg">View and manage reservations for your properties</p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
                        <p className="text-gray-600 text-sm font-medium mb-1">Total Bookings</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
                        <p className="text-gray-600 text-sm font-medium mb-1">Confirmed</p>
                        <p className="text-3xl font-bold text-green-600">{stats.confirmed}</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500">
                        <p className="text-gray-600 text-sm font-medium mb-1">Pending</p>
                        <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
                        <p className="text-gray-600 text-sm font-medium mb-1">Revenue</p>
                        <p className="text-3xl font-bold text-gray-900">NPR {stats.revenue}</p>
                    </div>
                </div>
            )}

            {/* Bookings Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
                    <h2 className="text-xl font-bold text-white">All Bookings</h2>
                </div>

                {bookingLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="p-12 text-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Bookings Yet</h3>
                        <p className="text-gray-600">Your property bookings will appear here.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Property</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Guest</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Check-in</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Check-out</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((booking: any) => (
                                    <tr key={booking._id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">{booking.listingId?.title}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{booking.customerId?.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(booking.checkInDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(booking.checkOutDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">NPR {booking.totalPrice}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${booking.status === "confirmed" ? "bg-green-100 text-green-700" :
                                                booking.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                                    booking.status === "rejected" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
                                                }`}>
                                                {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {booking.status === "pending" && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => acceptBooking(booking._id)}
                                                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition text-xs"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => rejectBooking(booking._id)}
                                                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-xs"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}