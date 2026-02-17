"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/admin/context/AuthContext";
import { getDashboardPath } from "@/lib/auth/roles";

interface Message {
    _id: string;
    sender: string;
    receiver: string;
    content: string;
    createdAt: string;
}

export default function HostMessagesPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [ready, setReady] = useState(false);
    const [selected, setSelected] = useState({
        otherUserId: "",
        listingId: "",
        bookingId: "",
    });
    const [messages, setMessages] = useState<Message[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [draft, setDraft] = useState("");

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

        const otherUserId =
            searchParams.get("customerId") ||
            searchParams.get("otherUserId") ||
            "";
        const listingId = searchParams.get("listingId") || "";
        const bookingId = searchParams.get("bookingId") || "";

        setSelected({ otherUserId, listingId, bookingId });
    }, [ready, searchParams]);

    const fetchMessages = async (otherUserId: string, listingId: string) => {
        setLoadingMessages(true);
        try {
            const res = await fetch(`/api/messages/${otherUserId}/${listingId}`, {
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.message || "Failed to load messages");
            }
            setMessages(Array.isArray(data?.data) ? data.data : []);
        } catch (error) {
            console.error("Error fetching messages:", error);
            setMessages([]);
        } finally {
            setLoadingMessages(false);
        }
    };

    useEffect(() => {
        if (!selected.otherUserId || !selected.listingId) return;
        fetchMessages(selected.otherUserId, selected.listingId);
    }, [selected.otherUserId, selected.listingId]);

    const handleSend = async (event: FormEvent) => {
        event.preventDefault();
        if (!selected.otherUserId || !selected.listingId) return;

        const content = draft.trim();
        if (!content) return;

        try {
            const res = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    receiverId: selected.otherUserId,
                    listingId: selected.listingId,
                    content,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.message || "Failed to send message");
            }

            setDraft("");
            fetchMessages(selected.otherUserId, selected.listingId);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    if (!ready || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 text-lg">Loading messages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Messages</h1>
                <p className="text-gray-600 text-lg">Chat with guests about their bookings</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Selected Guest</h2>
                    {selected.otherUserId ? (
                        <div className="space-y-2 text-sm text-gray-700">
                            <p><span className="font-semibold text-gray-900">Guest ID:</span> {selected.otherUserId}</p>
                            {selected.listingId && (
                                <p><span className="font-semibold text-gray-900">Listing ID:</span> {selected.listingId}</p>
                            )}
                            {selected.bookingId && (
                                <p><span className="font-semibold text-gray-900">Booking ID:</span> {selected.bookingId}</p>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500">Open a chat from a booking to select a guest.</p>
                    )}
                </div>

                <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col min-h-[420px]">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h2 className="text-lg font-semibold text-gray-900">Conversation</h2>
                    </div>

                    <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                        {loadingMessages ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : !selected.otherUserId || !selected.listingId ? (
                            <p className="text-gray-500">Select a guest to view the conversation.</p>
                        ) : messages.length === 0 ? (
                            <p className="text-gray-500">No messages yet. Start the conversation.</p>
                        ) : (
                            messages.map((message) => {
                                const isOwn = message.sender === user.id;
                                return (
                                    <div
                                        key={message._id}
                                        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isOwn
                                            ? "ml-auto bg-emerald-600 text-white"
                                            : "bg-gray-100 text-gray-800"
                                            }`}
                                    >
                                        <p>{message.content}</p>
                                        <p className={`mt-1 text-xs ${isOwn ? "text-emerald-100" : "text-gray-500"}`}>
                                            {new Date(message.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <form onSubmit={handleSend} className="border-t border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                value={draft}
                                onChange={(event) => setDraft(event.target.value)}
                                placeholder={
                                    selected.otherUserId && selected.listingId
                                        ? "Type your message..."
                                        : "Select a guest to start chatting"
                                }
                                disabled={!selected.otherUserId || !selected.listingId}
                                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                            />
                            <button
                                type="submit"
                                disabled={!draft.trim() || !selected.otherUserId || !selected.listingId}
                                className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-semibold disabled:bg-emerald-300"
                            >
                                Send
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
