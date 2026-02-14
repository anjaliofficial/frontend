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
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold mb-2">Host Dashboard</h1>
                <p className="text-gray-600">Manage your listings in one place.</p>
            </div>

            <section className="bg-white p-6 rounded shadow">
                <h2 className="text-2xl font-semibold mb-4">
                    {editingId ? "Edit Listing" : "Create Listing"}
                </h2>

                {error && (
                    <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700" htmlFor="listing-title">
                            Title
                        </label>
                        <input
                            id="listing-title"
                            className="border p-2 rounded"
                            placeholder="Listing title"
                            value={form.title}
                            onChange={(event) => setForm({ ...form, title: event.target.value })}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700" htmlFor="listing-location">
                            Location
                        </label>
                        <input
                            id="listing-location"
                            className="border p-2 rounded"
                            placeholder="City or area"
                            value={form.location}
                            onChange={(event) => setForm({ ...form, location: event.target.value })}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700" htmlFor="listing-type">
                            Property type
                        </label>
                        <select
                            id="listing-type"
                            className="border p-2 rounded"
                            value={form.propertyType}
                            onChange={(event) => setForm({ ...form, propertyType: event.target.value })}
                        >
                            <option value="room">Room</option>
                            <option value="apartment">Apartment</option>
                            <option value="house">House</option>
                            <option value="homestay">Homestay</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1 md:col-span-2">
                        <label className="text-sm font-medium text-gray-700" htmlFor="listing-description">
                            Description
                        </label>
                        <textarea
                            id="listing-description"
                            className="border p-2 rounded"
                            placeholder="Describe the space"
                            value={form.description}
                            onChange={(event) => setForm({ ...form, description: event.target.value })}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700" htmlFor="listing-amenities">
                            Amenities
                        </label>
                        <input
                            id="listing-amenities"
                            className="border p-2 rounded"
                            placeholder="wifi, parking, kitchen"
                            value={form.amenities}
                            onChange={(event) => setForm({ ...form, amenities: event.target.value })}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700" htmlFor="listing-price">
                            Price per night
                        </label>
                        <input
                            id="listing-price"
                            className="border p-2 rounded"
                            type="number"
                            placeholder="e.g. 120"
                            value={form.pricePerNight}
                            onChange={(event) => setForm({ ...form, pricePerNight: event.target.value })}
                            min="1"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700" htmlFor="listing-available-from">
                            Available from
                        </label>
                        <input
                            id="listing-available-from"
                            className="border p-2 rounded"
                            type="date"
                            value={form.availableFrom}
                            onChange={(event) => setForm({ ...form, availableFrom: event.target.value })}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700" htmlFor="listing-available-to">
                            Available to
                        </label>
                        <input
                            id="listing-available-to"
                            className="border p-2 rounded"
                            type="date"
                            value={form.availableTo}
                            onChange={(event) => setForm({ ...form, availableTo: event.target.value })}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700" htmlFor="listing-min-stay">
                            Minimum stay (nights)
                        </label>
                        <input
                            id="listing-min-stay"
                            className="border p-2 rounded"
                            type="number"
                            placeholder="e.g. 2"
                            value={form.minStay}
                            onChange={(event) => setForm({ ...form, minStay: event.target.value })}
                            min="1"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700" htmlFor="listing-max-guests">
                            Max guests
                        </label>
                        <input
                            id="listing-max-guests"
                            className="border p-2 rounded"
                            type="number"
                            placeholder="e.g. 4"
                            value={form.maxGuests}
                            onChange={(event) => setForm({ ...form, maxGuests: event.target.value })}
                            min="1"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700" htmlFor="listing-cancel">
                            Cancellation policy
                        </label>
                        <select
                            id="listing-cancel"
                            className="border p-2 rounded"
                            value={form.cancellationPolicy}
                            onChange={(event) => setForm({ ...form, cancellationPolicy: event.target.value })}
                        >
                            <option value="flexible">Flexible</option>
                            <option value="moderate">Moderate</option>
                            <option value="strict">Strict</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1 md:col-span-2">
                        <label className="text-sm font-medium text-gray-700" htmlFor="listing-rules">
                            House rules
                        </label>
                        <textarea
                            id="listing-rules"
                            className="border p-2 rounded"
                            placeholder="Quiet hours, smoking policy, pets"
                            value={form.houseRules}
                            onChange={(event) => setForm({ ...form, houseRules: event.target.value })}
                        />
                    </div>
                    {!editingId && (
                        <div className="flex flex-col gap-1 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700" htmlFor="listing-images">
                                Images (up to 5)
                            </label>
                            <input
                                id="listing-images"
                                className="border p-2 rounded"
                                type="file"
                                accept="image/png,image/jpeg"
                                multiple
                                onChange={(event) => setForm({ ...form, images: event.target.files })}
                            />
                        </div>
                    )}
                    <div className="md:col-span-2 flex flex-wrap gap-3">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                            disabled={formLoading}
                        >
                            {formLoading
                                ? "Saving..."
                                : editingId
                                    ? "Update Listing"
                                    : "Create Listing"}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                className="border border-gray-300 px-4 py-2 rounded"
                                onClick={resetForm}
                                disabled={formLoading}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </section>

            <section className="bg-white p-6 rounded shadow">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold">My Listings</h2>
                    <button
                        className="text-sm text-blue-600 hover:underline"
                        onClick={fetchListings}
                        disabled={listingsLoading}
                    >
                        {listingsLoading ? "Refreshing..." : "Refresh"}
                    </button>
                </div>

                {listingsLoading && listings.length === 0 && (
                    <p className="text-gray-600">Loading listings...</p>
                )}

                {!listingsLoading && listings.length === 0 && (
                    <p className="text-gray-600">No listings yet. Create your first one above.</p>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                    {listings.map((listing) => (
                        <div key={listing._id} className="border rounded p-4 space-y-2">
                            <div>
                                <h3 className="text-lg font-semibold">{listing.title}</h3>
                                <p className="text-sm text-gray-600">{listing.location}</p>
                            </div>
                            <p className="text-sm text-gray-700 line-clamp-2">{listing.description}</p>
                            <div className="text-sm text-gray-600 flex flex-wrap gap-3">
                                <span>Type: {listing.propertyType || "room"}</span>
                                <span>Price: {listing.pricePerNight}</span>
                                <span>Min stay: {listing.minStay}</span>
                                <span>Max guests: {listing.maxGuests || 1}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    className="border border-gray-300 px-3 py-1 rounded text-sm"
                                    onClick={() => handleEdit(listing)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="border border-red-300 text-red-600 px-3 py-1 rounded text-sm"
                                    onClick={() => handleDelete(listing._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}