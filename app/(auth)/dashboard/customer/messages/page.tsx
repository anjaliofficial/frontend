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
    const [messagesCursor, setMessagesCursor] = useState<string | null>(null);
    const [messagesHasMore, setMessagesHasMore] = useState(false);
    const [messagesLoadingMore, setMessagesLoadingMore] = useState(false);
    const messagePageSize = 20;
    const [draft, setDraft] = useState("");
    const [threads, setThreads] = useState<ThreadItem[]>([]);
    const [threadsLoading, setThreadsLoading] = useState(false);
    const [threadsCursor, setThreadsCursor] = useState<string | null>(null);
    const [threadsHasMore, setThreadsHasMore] = useState(false);
    const [threadsLoadingMore, setThreadsLoadingMore] = useState(false);
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

    const markThreadRead = async (thread: {
        otherUserId: string;
        listingId: string;
    }) => {
        try {
            await fetch("/api/messages/read", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    otherUserId: thread.otherUserId,
                    listingId: thread.listingId,
                }),
            });
        } catch (error) {
            console.error("Error marking messages as read:", error);
        }
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

    const fetchThreads = async (options?: {
        cursor?: string | null;
        append?: boolean;
    }) => {
        const append = Boolean(options?.append);
        if (append) {
            setThreadsLoadingMore(true);
        } else {
            setThreadsLoading(true);
        }
        try {
            const params = new URLSearchParams();
            params.set("limit", String(threadPageSize));
            if (options?.cursor) {
                params.set("cursor", options.cursor);
            }
            const res = await fetch(`/api/messages/threads?${params.toString()}`, {
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.message || "Failed to load threads");
            }

            const items: ThreadItem[] = (data.threads || []).map((thread: any) => ({
                id: `${thread.otherUserId}_${thread.listingId}`,
                otherUserId: thread.otherUserId,
                listingId: thread.listingId,
                bookingId: "",
                title: thread.otherUserName || "Host",
                subtitle: thread.listingTitle || "Listing",
                lastMessage: thread.lastMessage?.content || "",
                lastMessageAt: thread.lastMessage?.createdAt || "",
                unread: Boolean(thread.unreadCount && thread.unreadCount > 0),
            }));

            setThreads((prev) => (append ? [...prev, ...items] : items));
            setThreadsCursor(data.nextCursor || null);
            setThreadsHasMore(Boolean(data.nextCursor));
        } catch (error) {
            console.error("Error fetching threads:", error);
            if (!append) setThreads([]);
        } finally {
            if (append) {
                setThreadsLoadingMore(false);
            } else {
                setThreadsLoading(false);
            }
        }
    };

    useEffect(() => {
        if (!ready) return;
        fetchThreads();
    }, [ready]);

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

    const fetchMessages = async (
        otherUserId: string,
        listingId: string,
        options?: { cursor?: string | null; append?: boolean },
    ) => {
        const append = Boolean(options?.append);
        if (append) {
            setMessagesLoadingMore(true);
        } else {
            setLoadingMessages(true);
        }
        try {
            const params = new URLSearchParams();
            params.set("limit", String(messagePageSize));
            if (options?.cursor) {
                params.set("cursor", options.cursor);
            }
            const res = await fetch(
                `/api/messages/${otherUserId}/${listingId}?${params.toString()}`,
                { credentials: "include" },
            );
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.message || "Failed to load messages");
            }

            const list = Array.isArray(data?.data) ? data.data : [];
            setMessages((prev) => (append ? [...list, ...prev] : list));
            setMessagesCursor(data.nextCursor || null);
            setMessagesHasMore(Boolean(data.nextCursor));

            if (!append) {
                await markThreadRead({ otherUserId, listingId });
                setThreads((prev) =>
                    prev.map((thread) =>
                        thread.otherUserId === otherUserId &&
                            thread.listingId === listingId
                            ? { ...thread, unread: false }
                            : thread,
                    ),
                );
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
            if (!append) setMessages([]);
        } finally {
            if (append) {
                setMessagesLoadingMore(false);
            } else {
                setLoadingMessages(false);
            }
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
                                                    <span className="flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                                        New
                                                    </span>
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
                    {threadsHasMore && !threadsLoading && (
                        <button
                            type="button"
                            onClick={() =>
                                fetchThreads({ cursor: threadsCursor, append: true })
                            }
                            className="mt-4 w-full px-4 py-2 text-sm font-semibold text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50"
                        >
                            {threadsLoadingMore ? "Loading..." : "Load more"}
                        </button>
                    )}
                </div>

                <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col min-h-[420px]">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h2 className="text-lg font-semibold text-gray-900">Conversation</h2>
                    </div>

                    <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                        {messagesHasMore && (
                            <button
                                type="button"
                                onClick={() =>
                                    fetchMessages(selected.otherUserId, selected.listingId, {
                                        cursor: messagesCursor,
                                        append: true,
                                    })
                                }
                                disabled={messagesLoadingMore}
                                className="w-full px-4 py-2 text-xs font-semibold text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 disabled:opacity-60"
                            >
                                {messagesLoadingMore ? "Loading..." : "Load older messages"}
                            </button>
                        )}
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
