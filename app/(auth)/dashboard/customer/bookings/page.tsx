"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/admin/context/AuthContext";
import { getDashboardPath } from "@/lib/auth/roles";

export default function CustomerBookingsPage() {
    const { user, loading } = useAuth();
    const [ready, setReady] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.replace("/login");
            return;
        }

        if (user.role !== "customer") {
            router.replace(getDashboardPath(user.role));
            return;
        }

        setReady(true);
    }, [loading, user, router]);

    if (!ready || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 text-lg">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">My Bookings</h1>
                    <p className="text-gray-600 text-lg">View and manage your reservations</p>
                </div>

                {/* Empty State */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-12 text-center">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Bookings Yet</h3>
                        <p className="text-gray-600 mb-6">You haven't made any reservations yet. Start exploring!</p>
                        <a
                            href="/listings"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Browse Listings
                        </a>
                    </div>
                </div>

                {/* Example Booking Card (for future use) */}
                {/* <div className="grid gap-6">
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
                        <div className="flex flex-col md:flex-row">
                            <div className="w-full md:w-64 h-48 md:h-auto bg-gradient-to-br from-blue-400 to-purple-500"></div>
                            <div className="flex-1 p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">Property Title</h3>
                                        <p className="text-gray-600 flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            </svg>
                                            Kathmandu, Nepal
                                        </p>
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">Confirmed</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Check-in</p>
                                        <p className="font-semibold text-gray-900">Jan 15, 2026</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Check-out</p>
                                        <p className="font-semibold text-gray-900">Jan 20, 2026</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <div>
                                        <p className="text-sm text-gray-500">Total Price</p>
                                        <p className="text-2xl font-bold text-gray-900">NPR 7,500</p>
                                    </div>
                                    <button className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition-all">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> */}
            </div>
        </div>
    );
}
