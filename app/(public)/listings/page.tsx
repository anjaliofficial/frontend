"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const RAW_API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
const API_BASE = RAW_API_BASE.endsWith("/api")
    ? RAW_API_BASE.slice(0, -4)
    : RAW_API_BASE;

const propertyTypes = [
    { value: "", label: "All types" },
    { value: "room", label: "Room" },
    { value: "apartment", label: "Apartment" },
    { value: "house", label: "House" },
    { value: "homestay", label: "Homestay" },
];

const toImageUrl = (path?: string) => {
    if (!path) return "";
    const normalized = path.replace(/\\/g, "/");
    if (normalized.startsWith("http")) return normalized;
    const cleaned = normalized.startsWith("/") ? normalized : `/${normalized}`;
    return `${API_BASE}${cleaned}`;
};

export default function ListingsPage() {
    const [filters, setFilters] = useState({
        location: "",
        minPrice: "",
        maxPrice: "",
        propertyType: "",
        availableFrom: "",
        availableTo: "",
        guests: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [listings, setListings] = useState<any[]>([]);

    const queryString = useMemo(() => {
        const params = new URLSearchParams();
        if (filters.location) params.set("location", filters.location);
        if (filters.minPrice) params.set("minPrice", filters.minPrice);
        if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
        if (filters.propertyType) params.set("propertyType", filters.propertyType);
        if (filters.availableFrom) params.set("availableFrom", filters.availableFrom);
        if (filters.availableTo) params.set("availableTo", filters.availableTo);
        if (filters.guests) params.set("guests", filters.guests);
        return params.toString();
    }, [filters]);

    const fetchListings = async () => {
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`/api/listings${queryString ? `?${queryString}` : ""}`);
            const data = await res.json();
            if (!res.ok) {
                setError(data?.message || "Failed to load listings");
                setListings([]);
                return;
            }

            setListings(data.listings || []);
        } catch {
            setError("Failed to load listings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchListings();
    }, []);

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        void fetchListings();
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-gradient-to-r from-[#1a3a4a] to-[#21506a] text-white">
                <div className="max-w-6xl mx-auto px-6 py-10">
                    <p className="uppercase tracking-[0.3em] text-xs text-sky-200">Explore stays</p>
                    <h1 className="text-4xl md:text-5xl font-extrabold mt-2">Browse Accommodations</h1>
                    <p className="text-sky-100 mt-3 max-w-2xl">
                        Filter by location, price, type, and availability to find a stay that fits your trip.
                    </p>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-6 py-8 grid gap-6 lg:grid-cols-[320px_1fr]">
                <aside className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-fit">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Search filters</h2>
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-700" htmlFor="filter-location">
                                Location
                            </label>
                            <input
                                id="filter-location"
                                className="border border-slate-200 rounded-lg px-3 py-2"
                                placeholder="Kathmandu"
                                value={filters.location}
                                onChange={(event) =>
                                    setFilters({ ...filters, location: event.target.value })
                                }
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-slate-700" htmlFor="filter-min-price">
                                    Min price
                                </label>
                                <input
                                    id="filter-min-price"
                                    className="border border-slate-200 rounded-lg px-3 py-2"
                                    type="number"
                                    placeholder="100"
                                    min="0"
                                    value={filters.minPrice}
                                    onChange={(event) =>
                                        setFilters({ ...filters, minPrice: event.target.value })
                                    }
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-slate-700" htmlFor="filter-max-price">
                                    Max price
                                </label>
                                <input
                                    id="filter-max-price"
                                    className="border border-slate-200 rounded-lg px-3 py-2"
                                    type="number"
                                    placeholder="400"
                                    min="0"
                                    value={filters.maxPrice}
                                    onChange={(event) =>
                                        setFilters({ ...filters, maxPrice: event.target.value })
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-700" htmlFor="filter-type">
                                Property type
                            </label>
                            <select
                                id="filter-type"
                                className="border border-slate-200 rounded-lg px-3 py-2"
                                value={filters.propertyType}
                                onChange={(event) =>
                                    setFilters({ ...filters, propertyType: event.target.value })
                                }
                            >
                                {propertyTypes.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-slate-700" htmlFor="filter-from">
                                    Check-in
                                </label>
                                <input
                                    id="filter-from"
                                    type="date"
                                    className="border border-slate-200 rounded-lg px-3 py-2"
                                    value={filters.availableFrom}
                                    onChange={(event) =>
                                        setFilters({ ...filters, availableFrom: event.target.value })
                                    }
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-slate-700" htmlFor="filter-to">
                                    Check-out
                                </label>
                                <input
                                    id="filter-to"
                                    type="date"
                                    className="border border-slate-200 rounded-lg px-3 py-2"
                                    value={filters.availableTo}
                                    onChange={(event) =>
                                        setFilters({ ...filters, availableTo: event.target.value })
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-700" htmlFor="filter-guests">
                                Guests
                            </label>
                            <input
                                id="filter-guests"
                                className="border border-slate-200 rounded-lg px-3 py-2"
                                type="number"
                                min="1"
                                placeholder="2"
                                value={filters.guests}
                                onChange={(event) =>
                                    setFilters({ ...filters, guests: event.target.value })
                                }
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#1a3a4a] text-white py-2 rounded-lg font-semibold hover:bg-[#163140] transition"
                        >
                            Apply filters
                        </button>
                    </form>
                </aside>

                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-slate-900">Available stays</h2>
                        <span className="text-sm text-slate-500">{listings.length} results</span>
                    </div>

                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {loading && <p className="text-slate-500">Loading listings...</p>}

                    {!loading && listings.length === 0 && !error && (
                        <p className="text-slate-500">No listings found. Try adjusting filters.</p>
                    )}

                    <div className="grid gap-5 md:grid-cols-2">
                        {listings.map((listing) => {
                            const imageUrl = toImageUrl(listing.images?.[0]);
                            return (
                                <Link
                                    key={listing._id}
                                    href={`/listings/${listing._id}`}
                                    className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-lg transition"
                                >
                                    <div className="h-44 bg-slate-200 relative">
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={listing.title}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">
                                                No image
                                            </div>
                                        )}
                                        <span className="absolute top-3 left-3 bg-white/90 text-xs font-semibold px-3 py-1 rounded-full">
                                            {listing.propertyType || "room"}
                                        </span>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="text-lg font-semibold text-slate-900 group-hover:text-[#1a3a4a]">
                                                {listing.title}
                                            </h3>
                                            <span className="text-sm font-semibold text-[#1a3a4a]">
                                                {listing.pricePerNight} / night
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600">{listing.location}</p>
                                        <div className="text-xs text-slate-500 flex flex-wrap gap-3">
                                            <span>Max guests: {listing.maxGuests || 1}</span>
                                            <span>Min stay: {listing.minStay || 1}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 line-clamp-2">
                                            {listing.description}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
}
