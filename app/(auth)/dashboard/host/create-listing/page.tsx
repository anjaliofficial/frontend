"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/admin/context/AuthContext";
import { getDashboardPath } from "@/lib/auth/roles";
import Link from "next/link";

export default function CreateListing() {
    const { user, loading } = useAuth();
    const [ready, setReady] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [previewImages, setPreviewImages] = useState<string[]>([]);
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setForm((prev) => ({ ...prev, images: e.target.files }));

            // Create preview URLs
            const files = Array.from(e.target.files);
            const previews = files.map((file) => URL.createObjectURL(file));
            setPreviewImages(previews);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError("");
        setSuccess("");
        setFormLoading(true);

        try {
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
                setSuccess("Listing created successfully!");
                setTimeout(() => {
                    router.push("/dashboard/host/listings");
                }, 2000);
            }
        } catch {
            setError("Failed to create listing");
        } finally {
            setFormLoading(false);
        }
    };

    if (!ready || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 text-lg">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Listing</h1>
                    <p className="text-gray-600">Add a new property to your portfolio</p>
                </div>
                <Link
                    href="/dashboard/host"
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                    ← Back
                </Link>
            </div>

            {/* Messages */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-3">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                        <p className="font-semibold">Error</p>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            )}

            {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-start gap-3">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                        <p className="font-semibold">Success</p>
                        <p className="text-sm">{success}</p>
                    </div>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-8 space-y-8">
                    {/* Basic Info */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
                        <div className="space-y-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Property Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={form.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Cozy Apartment in Kathmandu"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleInputChange}
                                    placeholder="Describe your property in detail"
                                    required
                                    rows={5}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
                                />
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={form.location}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Thamel, Kathmandu"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Property Details */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Property Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Property Type */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Property Type *</label>
                                <select
                                    name="propertyType"
                                    value={form.propertyType}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                                >
                                    <option value="room">Room</option>
                                    <option value="apartment">Apartment</option>
                                    <option value="house">House</option>
                                    <option value="villa">Villa</option>
                                </select>
                            </div>

                            {/* Price Per Night */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Price Per Night (NPR) *</label>
                                <input
                                    type="number"
                                    name="pricePerNight"
                                    value={form.pricePerNight}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 2000"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                                />
                            </div>

                            {/* Max Guests */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Max Guests *</label>
                                <input
                                    type="number"
                                    name="maxGuests"
                                    value={form.maxGuests}
                                    onChange={handleInputChange}
                                    min="1"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                                />
                            </div>

                            {/* Min Stay */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Min Stay (nights)</label>
                                <input
                                    type="number"
                                    name="minStay"
                                    value={form.minStay}
                                    onChange={handleInputChange}
                                    min="1"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Availability */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Availability</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Available From</label>
                                <input
                                    type="date"
                                    name="availableFrom"
                                    value={form.availableFrom}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Available To</label>
                                <input
                                    type="date"
                                    name="availableTo"
                                    value={form.availableTo}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Images */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Property Images</h2>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-500 transition">
                            <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-gray-600 font-semibold mb-2">Upload property images</p>
                            <p className="text-gray-500 text-sm mb-4">PNG, JPG up to 10MB each</p>
                            <input
                                type="file"
                                name="images"
                                onChange={handleImageChange}
                                multiple
                                accept="image/*"
                                className="hidden"
                                id="image-input"
                            />
                            <label
                                htmlFor="image-input"
                                className="inline-block px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer transition"
                            >
                                Choose Images
                            </label>
                        </div>

                        {/* Image Preview */}
                        {previewImages.length > 0 && (
                            <div className="mt-6">
                                <p className="text-sm font-semibold text-gray-700 mb-3">Selected Images ({previewImages.length})</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {previewImages.map((preview, index) => (
                                        <div key={index} className="relative rounded-lg overflow-hidden">
                                            <img src={preview} alt={`Preview ${index}`} className="w-full h-32 object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Amenities */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Amenities</h2>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Amenities (comma-separated)</label>
                        <textarea
                            name="amenities"
                            value={form.amenities}
                            onChange={handleInputChange}
                            placeholder="e.g., WiFi, TV, Kitchen, Parking"
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
                        />
                    </div>

                    {/* Cancel Policy */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Cancellation Policy</label>
                        <select
                            name="cancellationPolicy"
                            value={form.cancellationPolicy}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                        >
                            <option value="flexible">Flexible (cancel anytime)</option>
                            <option value="moderate">Moderate (cancel up to 7 days before)</option>
                            <option value="strict">Strict (cancel up to 30 days before)</option>
                        </select>
                    </div>

                    {/* House Rules */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">House Rules</label>
                        <textarea
                            name="houseRules"
                            value={form.houseRules}
                            onChange={handleInputChange}
                            placeholder="Enter any house rules for guests"
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex gap-4">
                    <button
                        type="submit"
                        disabled={formLoading}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                    >
                        {formLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Creating...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create Listing
                            </>
                        )}
                    </button>
                    <Link
                        href="/dashboard/host"
                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-semibold transition"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
