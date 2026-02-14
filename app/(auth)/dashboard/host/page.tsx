"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/admin/context/AuthContext";
import { getDashboardPath } from "@/lib/auth/roles";

export default function HostDashboard() {
    const { user, loading } = useAuth();
    const [ready, setReady] = useState(false);
    const [listings, setListings] = useState<any[]>([]);
    const [listingsLoading, setListingsLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({
        title: "",
        description: "",
        location: "",
        propertyType: "room",
        amenities: "",
        pricePerNight: "",
        availableFrom: "",
        availableTo: "",
        minStay: "1",
        maxGuests: "1",
        cancellationPolicy: "moderate",
        houseRules: "",
        images: null as FileList | null,
    });
    const router = useRouter();

    const amenityList = useMemo(() => {
        return form.amenities
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }, [form.amenities]);

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
    }, [loading, user, router]);

    useEffect(() => {
        if (!ready) return;
        void fetchListings();
    }, [ready]);

    const fetchListings = async () => {
        setListingsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/listings/my");
            const data = await res.json();
            if (!res.ok) {
                setError(data?.message || "Failed to load listings");
                setListings([]);
            } else {
                setListings(data.listings || []);
            }
        } catch {
            setError("Failed to load listings");
        } finally {
            setListingsLoading(false);
        }
    };

    const resetForm = () => {
        setForm({
            title: "",
            description: "",
            location: "",
            propertyType: "room",
            amenities: "",
            pricePerNight: "",
            availableFrom: "",
            availableTo: "",
            minStay: "1",
            maxGuests: "1",
            cancellationPolicy: "moderate",
            houseRules: "",
            images: null,
        });
        setEditingId(null);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError("");
        setSuccess("");
        setFormLoading(true);

        try {
            if (editingId) {
                const payload = {
                    title: form.title,
                    description: form.description,
                    location: form.location,
                    propertyType: form.propertyType,
                    amenities: amenityList,
                    pricePerNight: Number(form.pricePerNight),
                    availableFrom: form.availableFrom,
                    availableTo: form.availableTo,
                    minStay: Number(form.minStay),
                    maxGuests: Number(form.maxGuests),
                    cancellationPolicy: form.cancellationPolicy,
                    houseRules: form.houseRules,
                };

                const res = await fetch(`/api/listings/${editingId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                const data = await res.json();
                if (!res.ok) {
                    setError(data?.message || "Failed to update listing");
                } else {
                    setSuccess("Listing updated");
                    resetForm();
                    await fetchListings();
                }
                return;
            }

            const body = new FormData();
            body.append("title", form.title);
            body.append("description", form.description);
            body.append("location", form.location);
            body.append("propertyType", form.propertyType);
            body.append("pricePerNight", form.pricePerNight);
            body.append("availableFrom", form.availableFrom);
            body.append("availableTo", form.availableTo);
            body.append("minStay", form.minStay);
            body.append("maxGuests", form.maxGuests);
            body.append("cancellationPolicy", form.cancellationPolicy);
            body.append("houseRules", form.houseRules);

            amenityList.forEach((item) => body.append("amenities", item));

            if (form.images) {
                Array.from(form.images).forEach((file) => body.append("images", file));
            }

            const res = await fetch("/api/listings", {
                method: "POST",
                body,
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data?.message || "Failed to create listing");
            } else {
                setSuccess("Listing created");
                resetForm();
                await fetchListings();
            }
        } catch {
            setError(editingId ? "Failed to update listing" : "Failed to create listing");
        } finally {
            setFormLoading(false);
        }
    };

    const handleEdit = (listing: any) => {
        const normalizeDate = (value?: string) => {
            if (!value) return "";
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return "";
            return date.toISOString().slice(0, 10);
        };

        setEditingId(listing._id);
        setForm({
            title: listing.title || "",
            description: listing.description || "",
            location: listing.location || "",
            propertyType: listing.propertyType || "room",
            amenities: Array.isArray(listing.amenities) ? listing.amenities.join(", ") : "",
            pricePerNight: listing.pricePerNight?.toString() || "",
            availableFrom: normalizeDate(listing.availableFrom),
            availableTo: normalizeDate(listing.availableTo),
            minStay: listing.minStay?.toString() || "1",
            maxGuests: listing.maxGuests?.toString() || "1",
            cancellationPolicy: listing.cancellationPolicy || "moderate",
            houseRules: listing.houseRules || "",
            images: null,
        });
        setSuccess("");
        setError("");
    };

    const handleDelete = async (id: string) => {
        setError("");
        setSuccess("");

        try {
            const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) {
                setError(data?.message || "Failed to delete listing");
            } else {
                setSuccess("Listing deleted");
                setListings((prev) => prev.filter((item) => item._id !== id));
            }
        } catch {
            setError("Failed to delete listing");
        }
    };

    if (!ready || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 text-lg">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Host Dashboard 🏠
                    </h1>
                    <p className="text-gray-600 text-lg">Manage your properties and grow your business</p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-gray-600 text-sm font-medium">Total Listings</p>
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{listings.length}</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-gray-600 text-sm font-medium">Active Bookings</p>
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">0</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-gray-600 text-sm font-medium">Monthly Revenue</p>
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">NPR 0</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-gray-600 text-sm font-medium">Avg Rating</p>
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">5.0</p>
                    </div>
                </div>

                {/* Create/Edit Listing Form */}
                <section className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            {editingId ? "Edit Listing" : "Create New Listing"}
                        </h2>
                    </div>

                    <div className="p-6">
                        {error && (
                            <div className="mb-6 rounded-xl border-l-4 border-red-500 bg-red-50 p-4 flex items-start gap-3">
                                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <p className="text-sm font-medium text-red-800">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 rounded-xl border-l-4 border-green-500 bg-green-50 p-4 flex items-start gap-3">
                                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <p className="text-sm font-medium text-green-800">{success}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2" htmlFor="listing-title">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                    Title
                                </label>
                                <input
                                    id="listing-title"
                                    className="border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="e.g., Cozy 2BR Apartment in Thamel"
                                    value={form.title}
                                    onChange={(event) => setForm({ ...form, title: event.target.value })}
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2" htmlFor="listing-location">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Location
                                </label>
                                <input
                                    id="listing-location"
                                    className="border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="e.g., Kathmandu, Thamel"
                                    value={form.location}
                                    onChange={(event) => setForm({ ...form, location: event.target.value })}
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2" htmlFor="listing-type">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    Property Type
                                </label>
                                <select
                                    id="listing-type"
                                    className="border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    value={form.propertyType}
                                    onChange={(event) => setForm({ ...form, propertyType: event.target.value })}
                                >
                                    <option value="room">Room</option>
                                    <option value="apartment">Apartment</option>
                                    <option value="house">House</option>
                                    <option value="homestay">Homestay</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2" htmlFor="listing-price">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Price per Night (NPR)
                                </label>
                                <input
                                    id="listing-price"
                                    className="border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    type="number"
                                    placeholder="e.g., 1500"
                                    value={form.pricePerNight}
                                    onChange={(event) => setForm({ ...form, pricePerNight: event.target.value })}
                                    min="1"
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-2 md:col-span-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2" htmlFor="listing-description">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                    </svg>
                                    Description
                                </label>
                                <textarea
                                    id="listing-description"
                                    className="border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Describe your property, its unique features, and what makes it special..."
                                    value={form.description}
                                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                                    rows={4}
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2" htmlFor="listing-amenities">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Amenities
                                </label>
                                <input
                                    id="listing-amenities"
                                    className="border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="wifi, parking, kitchen, pool (comma separated)"
                                    value={form.amenities}
                                    onChange={(event) => setForm({ ...form, amenities: event.target.value })}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2" htmlFor="listing-available-from">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Available From
                                </label>
                                <input
                                    id="listing-available-from"
                                    className="border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    type="date"
                                    value={form.availableFrom}
                                    onChange={(event) => setForm({ ...form, availableFrom: event.target.value })}
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2" htmlFor="listing-available-to">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Available To
                                </label>
                                <input
                                    id="listing-available-to"
                                    className="border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    type="date"
                                    value={form.availableTo}
                                    onChange={(event) => setForm({ ...form, availableTo: event.target.value })}
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2" htmlFor="listing-min-stay">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Minimum Stay (nights)
                                </label>
                                <input
                                    id="listing-min-stay"
                                    className="border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    type="number"
                                    placeholder="e.g., 1"
                                    value={form.minStay}
                                    onChange={(event) => setForm({ ...form, minStay: event.target.value })}
                                    min="1"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2" htmlFor="listing-max-guests">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Max Guests
                                </label>
                                <input
                                    id="listing-max-guests"
                                    className="border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    type="number"
                                    placeholder="e.g., 4"
                                    value={form.maxGuests}
                                    onChange={(event) => setForm({ ...form, maxGuests: event.target.value })}
                                    min="1"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2" htmlFor="listing-cancel">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    Cancellation Policy
                                </label>
                                <select
                                    id="listing-cancel"
                                    className="border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    value={form.cancellationPolicy}
                                    onChange={(event) => setForm({ ...form, cancellationPolicy: event.target.value })}
                                >
                                    <option value="flexible">Flexible</option>
                                    <option value="moderate">Moderate</option>
                                    <option value="strict">Strict</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-2 md:col-span-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2" htmlFor="listing-rules">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    House Rules
                                </label>
                                <textarea
                                    id="listing-rules"
                                    className="border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Quiet hours, smoking policy, pet policy, etc."
                                    value={form.houseRules}
                                    onChange={(event) => setForm({ ...form, houseRules: event.target.value })}
                                    rows={3}
                                />
                            </div>

                            {!editingId && (
                                <div className="flex flex-col gap-2 md:col-span-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2" htmlFor="listing-images">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Images (up to 5)
                                    </label>
                                    <input
                                        id="listing-images"
                                        className="border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        type="file"
                                        accept="image/png,image/jpeg"
                                        multiple
                                        onChange={(event) => setForm({ ...form, images: event.target.files })}
                                    />
                                </div>
                            )}

                            <div className="md:col-span-2 flex flex-wrap gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                                    disabled={formLoading}
                                >
                                    {formLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {editingId ? "Update Listing" : "Create Listing"}
                                        </>
                                    )}
                                </button>
                                {editingId && (
                                    <button
                                        type="button"
                                        className="border-2 border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 font-semibold transition-all"
                                        onClick={resetForm}
                                        disabled={formLoading}
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </section>

                {/* My Listings */}
                <section className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500 to-teal-600 px-6 py-4 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            My Listings
                        </h2>
                        <button
                            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold text-white transition-all flex items-center gap-2 backdrop-blur-sm"
                            onClick={fetchListings}
                            disabled={listingsLoading}
                        >
                            <svg className={`w-4 h-4 ${listingsLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {listingsLoading ? "Refreshing..." : "Refresh"}
                        </button>
                    </div>

                    <div className="p-6">
                        {listingsLoading && listings.length === 0 && (
                            <div className="flex items-center justify-center py-12">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-gray-600">Loading listings...</p>
                                </div>
                            </div>
                        )}

                        {!listingsLoading && listings.length === 0 && (
                            <div className="text-center py-12">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                </div>
                                <p className="text-gray-600 text-lg font-medium mb-2">No listings yet</p>
                                <p className="text-gray-500">Create your first listing above to get started!</p>
                            </div>
                        )}

                        <div className="grid gap-6 md:grid-cols-2">
                            {listings.map((listing) => (
                                <div key={listing._id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all group">
                                    {/* Listing Image Placeholder */}
                                    <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                        <svg className="w-16 h-16 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    
                                    <div className="p-5 space-y-3">
                                        <div>
                                            <div className="flex items-start justify-between mb-1">
                                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                    {listing.title}
                                                </h3>
                                                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full capitalize">
                                                    {listing.propertyType || "room"}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                </svg>
                                                {listing.location}
                                            </p>
                                        </div>
                                        
                                        <p className="text-sm text-gray-700 line-clamp-2">{listing.description}</p>
                                        
                                        <div className="flex flex-wrap gap-3 text-sm">
                                            <div className="flex items-center gap-1.5 text-gray-600">
                                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="font-semibold text-gray-900">NPR {listing.pricePerNight}</span>/night
                                            </div>
                                            <div className="flex items-center gap-1.5 text-gray-600">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {listing.minStay} night min
                                            </div>
                                            <div className="flex items-center gap-1.5 text-gray-600">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                {listing.maxGuests || 1} guests
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-2 pt-3 border-t border-gray-100">
                                            <button
                                                className="flex-1 border-2 border-blue-600 text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                                                onClick={() => handleEdit(listing)}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Edit
                                            </button>
                                            <button
                                                className="flex-1 border-2 border-red-500 text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                                                onClick={() => handleDelete(listing._id)}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}