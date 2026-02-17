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
    read?: boolean;
}

interface ThreadItem {
    id: string;
    otherUserId: string;
    listingId: string;
    bookingId: string;
    title: string;
    subtitle: string;
    lastMessage: string;
    lastMessageAt: string;
    unread: boolean;
}

export default function CustomerMessagesPage() {
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
    const [threads, setThreads] = useState<ThreadItem[]>([]);
    const [threadsLoading, setThreadsLoading] = useState(false);
    const [threadsPage, setThreadsPage] = useState(1);
    const [totalThreads, setTotalThreads] = useState(0);
    const threadPageSize = 6;

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

    useEffect(() => {
        if (!ready) return;

        const otherUserId =
            searchParams.get("hostId") || searchParams.get("otherUserId") || "";
        const listingId = searchParams.get("listingId") || "";
        const bookingId = searchParams.get("bookingId") || "";

        setSelected({ otherUserId, listingId, bookingId });
    }, [ready, searchParams]);

    const setSelectedThread = (thread: {
        otherUserId: string;
        listingId: string;
        bookingId: string;
    }) => {
        setSelected(thread);
        const params = new URLSearchParams();
        if (thread.otherUserId) params.set("hostId", thread.otherUserId);
        if (thread.listingId) params.set("listingId", thread.listingId);
        if (thread.bookingId) params.set("bookingId", thread.bookingId);
        const query = params.toString();
        router.replace(query ? `/dashboard/customer/messages?${query}` : "/dashboard/customer/messages");
    };

    const formatPreview = (text: string) => {
        const trimmed = text.trim();
        if (!trimmed) return "No messages yet";
        return trimmed.length > 60 ? `${trimmed.slice(0, 60)}...` : trimmed;
    };

    const formatTimestamp = (value: string) => {
        if (!value) return "";
        return new Date(value).toLocaleString();
    };

    const fetchThreads = async () => {
        setThreadsLoading(true);
        try {
            const res = await fetch("/api/bookings/customer/my", {
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.message || "Failed to load threads");
            }
            const bookings = data.bookings || [];
            setTotalThreads(bookings.length);
            const pagedBookings = bookings.slice(0, threadPageSize * threadsPage);

            const items = await Promise.all(
                pagedBookings.map(async (booking: any) => {
                    const host = booking.hostId || {};
                    const listing = booking.listingId || {};
                    const otherUserId = host._id || booking.hostId || "";
                    const listingId = listing._id || booking.listingId || "";
                    let lastMessage = "";
                    let lastMessageAt = "";
                    let unread = false;

                    if (otherUserId && listingId) {
                        const messagesRes = await fetch(
                            `/api/messages/${otherUserId}/${listingId}`,
                            { credentials: "include" },
                        );
                        const messagesData = await messagesRes.json();
                        const list = Array.isArray(messagesData?.data)
                            ? messagesData.data
                            : [];
                        const latest = list[list.length - 1];
                        lastMessage = latest?.content || "";
                        lastMessageAt = latest?.createdAt || "";
                        unread = Boolean(
                            latest &&
                            latest.receiver === user?.id &&
                            latest.read === false,
                        );
                    }

                    return {
                        id: `${otherUserId}_${listingId}_${booking._id || ""}`,
                        otherUserId,
                        listingId,
                        bookingId: booking._id || "",
                        title: host.fullName || "Host",
                        subtitle: listing.title || "Listing",
                        lastMessage,
                        lastMessageAt,
                        unread,
                    } as ThreadItem;
                }),
            );
            setThreads(items);
        } catch (error) {
            console.error("Error fetching threads:", error);
            setThreads([]);
        } finally {
            setThreadsLoading(false);
        }
    };

    useEffect(() => {
        if (!ready) return;
        fetchThreads();
    }, [ready, threadsPage]);

    useEffect(() => {
        const hasQuery =
            searchParams.get("hostId") ||
            searchParams.get("otherUserId") ||
            searchParams.get("listingId");
        if (hasQuery) return;
        if (selected.otherUserId || selected.listingId) return;
        if (threads.length === 0) return;
        setSelectedThread({
            otherUserId: threads[0].otherUserId,
            listingId: threads[0].listingId,
            bookingId: threads[0].bookingId,
        });
    }, [threads, selected.otherUserId, selected.listingId, searchParams]);

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
            fetchThreads();
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    if (!ready || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 text-lg">Loading messages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Messages</h1>
                <p className="text-gray-600 text-lg">Chat with hosts about your bookings</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Conversations</h2>
                    {threadsLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : threads.length === 0 ? (
                        <p className="text-gray-500">No conversations yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {threads.map((thread) => {
                                const isActive =
                                    thread.otherUserId === selected.otherUserId &&
                                    thread.listingId === selected.listingId;
                                return (
                                    <button
                                        key={thread.id}
                                        type="button"
                                        onClick={() =>
                                            setSelectedThread({
                                                otherUserId: thread.otherUserId,
                                                listingId: thread.listingId,
                                                bookingId: thread.bookingId,
                                            })
                                        }
                                        className={`w-full text-left px-4 py-3 rounded-xl border transition ${isActive
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-200 hover:bg-gray-50"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{thread.title}</p>
                                                <p className="text-xs text-gray-500 truncate">{thread.subtitle}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {thread.unread && (
                                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                                )}
                                                <span className="text-[11px] text-gray-400 whitespace-nowrap">
                                                    {formatTimestamp(thread.lastMessageAt)}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2 truncate">
                                            {formatPreview(thread.lastMessage)}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    {threads.length < totalThreads && !threadsLoading && (
                        <button
                            type="button"
                            onClick={() => setThreadsPage((page) => page + 1)}
                            className="mt-4 w-full px-4 py-2 text-sm font-semibold text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50"
                        >
                            Load more
                        </button>
                    )}
                </div>

                <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col min-h-[420px]">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h2 className="text-lg font-semibold text-gray-900">Conversation</h2>
                    </div>

                    <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                        {loadingMessages ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : !selected.otherUserId || !selected.listingId ? (
                            <p className="text-gray-500">Select a host to view the conversation.</p>
                        ) : messages.length === 0 ? (
                            <p className="text-gray-500">No messages yet. Start the conversation.</p>
                        ) : (
                            messages.map((message) => {
                                const isOwn = message.sender === user.id;
                                return (
                                    <div
                                        key={message._id}
                                        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isOwn
                                            ? "ml-auto bg-blue-600 text-white"
                                            : "bg-gray-100 text-gray-800"
                                            }`}
                                    >
                                        <p>{message.content}</p>
                                        <p className={`mt-1 text-xs ${isOwn ? "text-blue-100" : "text-gray-500"}`}>
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
                                        : "Select a host to start chatting"
                                }
                                disabled={!selected.otherUserId || !selected.listingId}
                                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                            <button
                                type="submit"
                                disabled={!draft.trim() || !selected.otherUserId || !selected.listingId}
                                className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold disabled:bg-blue-300"
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
