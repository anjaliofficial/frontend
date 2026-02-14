"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const RAW_API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
const API_BASE = RAW_API_BASE.endsWith("/api")
    ? RAW_API_BASE.slice(0, -4)
    : RAW_API_BASE;

const toImageUrl = (path?: string) => {
    if (!path) return "";
    const normalized = path.replace(/\\/g, "/");
    if (normalized.startsWith("http")) return normalized;
    const cleaned = normalized.startsWith("/") ? normalized : `/${normalized}`;
    return `${API_BASE}${cleaned}`;
};

export default function ListingDetailPage() {
    const params = useParams();
    const listingId = params?.id as string | undefined;

    const [listing, setListing] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [dates, setDates] = useState({
        availableFrom: "",
        availableTo: "",
    });
    const [availability, setAvailability] = useState<boolean | null>(null);

    const queryString = useMemo(() => {
        const params = new URLSearchParams();
        if (dates.availableFrom) params.set("availableFrom", dates.availableFrom);
        if (dates.availableTo) params.set("availableTo", dates.availableTo);
        return params.toString();
    }, [dates]);

    const fetchListing = async () => {
        if (!listingId) return;
        setLoading(true);
        setError("");

        try {
            const res = await fetch(
                `/api/listings/${listingId}${queryString ? `?${queryString}` : ""}`,
            );
            const data = await res.json();
            if (!res.ok) {
                setError(data?.message || "Failed to load listing");
                setListing(null);
                setAvailability(null);
                return;
            }

            setListing(data.listing || null);
            setAvailability(
                typeof data.isAvailable === "boolean" ? data.isAvailable : null,
            );
        } catch {
            setError("Failed to load listing");
            setListing(null);
            setAvailability(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchListing();
    }, [listingId, queryString]);

    if (loading && !listing) {
        return <div className="p-8 text-slate-500">Loading listing...</div>;
    }

    if (error) {
        return (
            <div className="p-8 text-red-600">
                {error} <Link href="/listings" className="underline">Back to listings</Link>
            </div>
        );
    }

    if (!listing) return null;

    const images = Array.isArray(listing.images) ? listing.images : [];
    const host = listing.hostId || {};

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-[#1a3a4a] text-white">
                <div className="max-w-5xl mx-auto px-6 py-10">
                    <Link href="/listings" className="text-sm text-sky-200">← Back to listings</Link>
                    <h1 className="text-4xl font-bold mt-3">{listing.title}</h1>
                    <p className="text-sky-100 mt-2">{listing.location}</p>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
                <section className="grid gap-4 md:grid-cols-[2fr_1fr]">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        {images.length ? (
                            <img
                                src={toImageUrl(images[0])}
                                alt={listing.title}
                                className="h-72 w-full object-cover"
                            />
                        ) : (
                            <div className="h-72 flex items-center justify-center text-slate-400">
                                No image
                            </div>
                        )}
                        {images.length > 1 && (
                            <div className="grid grid-cols-3 gap-2 p-4">
                                {images.slice(1, 4).map((img: string) => (
                                    <img
                                        key={img}
                                        src={toImageUrl(img)}
                                        alt="Listing"
                                        className="h-20 w-full object-cover rounded-lg"
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <aside className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Price</p>
                            <p className="text-3xl font-bold text-[#1a3a4a]">{listing.pricePerNight}</p>
                            <p className="text-sm text-slate-500">Per night</p>
                        </div>

                        <div className="space-y-2 text-sm text-slate-600">
                            <div>Property type: {listing.propertyType || "room"}</div>
                            <div>Max guests: {listing.maxGuests || 1}</div>
                            <div>Min stay: {listing.minStay || 1} nights</div>
                            <div>Cancellation: {listing.cancellationPolicy}</div>
                        </div>

                        <div className="border-t border-slate-100 pt-4 space-y-2">
                            <p className="text-sm font-semibold text-slate-700">Check availability</p>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="date"
                                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                    value={dates.availableFrom}
                                    onChange={(event) =>
                                        setDates({ ...dates, availableFrom: event.target.value })
                                    }
                                />
                                <input
                                    type="date"
                                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                    value={dates.availableTo}
                                    onChange={(event) =>
                                        setDates({ ...dates, availableTo: event.target.value })
                                    }
                                />
                            </div>
                            {availability !== null && (
                                <p
                                    className={`text-sm font-semibold ${availability ? "text-emerald-600" : "text-red-600"
                                        }`}
                                >
                                    {availability ? "Available for selected dates" : "Not available"}
                                </p>
                            )}
                        </div>
                    </aside>
                </section>

                <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
                    <h2 className="text-xl font-semibold text-slate-900">About this stay</h2>
                    <p className="text-slate-600 leading-relaxed">{listing.description}</p>
                    <div className="grid gap-4 md:grid-cols-2 text-sm text-slate-600">
                        <div>
                            <p className="text-slate-500 uppercase text-xs tracking-[0.2em]">Amenities</p>
                            <p>{(listing.amenities || []).join(", ") || "No amenities listed"}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 uppercase text-xs tracking-[0.2em]">House rules</p>
                            <p>{listing.houseRules || "No special rules provided."}</p>
                        </div>
                    </div>
                </section>

                <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
                    <h2 className="text-xl font-semibold text-slate-900">Host details</h2>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <p className="text-lg font-semibold text-slate-900">{host.fullName || "Host"}</p>
                            <p className="text-sm text-slate-600">{host.address || ""}</p>
                        </div>
                        <div className="text-sm text-slate-600">
                            <p>Phone: {host.phoneNumber || "N/A"}</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
