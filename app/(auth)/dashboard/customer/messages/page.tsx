"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/admin/context/AuthContext";
import {
    initSocket,
    getSocket,
    sendMessage as emitSendMessage,
    deleteMessage as emitDeleteMessage,
    editMessage as emitEditMessage,
    joinRoom,
    stopTyping,
    startTyping,
    markConversationRead,
} from "@/lib/api/socket-client";
import ContextMenu from "./ContextMenu";
import DeleteConfirmModal from "./DeleteConfirmModal";
import Toast from "./Toast";

export enum MessageStatus {
    SENT = "sent",
    DELIVERED = "delivered",
    READ = "read",
}

interface Message {
    _id: string;
    sender: any;
    receiver: any;
    content: string;
    status: MessageStatus;
    read: boolean;
    isEdited: boolean;
    editedAt?: string;
    isDeleted: boolean;
    deletedFor: string[];
    createdAt: string;
    updatedAt: string;
    sending?: boolean;
    tempId?: string;
}

export default function CustomerMessagesPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuth();

    // Thread selection state
    const [selected, setSelected] = useState({
        otherUserId: "",
        listingId: "",
        hostId: "",
    });

    // Messages state
    const [messages, setMessages] = useState<Message[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [messagesCursor, setMessagesCursor] = useState<string | null>(null);
    const [messagesHasMore, setMessagesHasMore] = useState(false);
    const [messagesLoadingMore, setMessagesLoadingMore] = useState(false);
    const messagePageSize = 20;

    // Threads state
    const [threads, setThreads] = useState<any[]>([]);
    const [threadsLoading, setThreadsLoading] = useState(true);
    const [threadsCursor, setThreadsCursor] = useState<string | null>(null);
    const [threadsHasMore, setThreadsHasMore] = useState(false);
    const [threadsLoadingMore, setThreadsLoadingMore] = useState(false);
    const threadPageSize = 6;

    // Input/Edit state
    const [inputValue, setInputValue] = useState("");
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editOriginal, setEditOriginal] = useState("");
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

    // Context Menu State
    const [contextMenu, setContextMenu] = useState({
        isOpen: false,
        x: 0,
        y: 0,
        messageId: "",
        isOwnMessage: false,
    });

    // Delete Confirmation State
    const [deleteConfirm, setDeleteConfirm] = useState({
        isOpen: false,
        messageId: "",
    });

    const socket = getSocket();
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const getUserId = (value: any) => (typeof value === "string" ? value : value?._id);

    const normalizeUser = (value: any) => {
        if (!value) return value;
        if (typeof value === "string") {
            return { _id: value, fullName: "", profilePicture: "", email: "" };
        }
        return value;
    };

    const normalizeMessage = (message: Message): Message => ({
        ...message,
        sender: normalizeUser(message.sender),
        receiver: normalizeUser(message.receiver),
    });

    // Extract URL params and update selected thread
    useEffect(() => {
        if (!searchParams) return;
        const hostId = searchParams.get("hostId") || searchParams.get("otherUserId");
        const listingId = searchParams.get("listingId") || "all";

        if (hostId) {
            setSelected({ otherUserId: hostId, listingId, hostId });
        }
    }, [searchParams]);

    // Fetch threads
    const fetchThreads = async (options?: { cursor?: string | null; append?: boolean }) => {
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
            params.set("scope", "all");
            const res = await fetch(`/api/messages/threads?${params.toString()}`, {
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.message || "Failed to load threads");
            }

            const items = (data.threads || []).map((thread: any) => ({
                id: `${thread.otherUserId}_${thread.listingId}`,
                otherUserId: thread.otherUserId,
                listingId: thread.listingId || "all",
                title: thread.otherUserName || "Host",
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

    // Load threads on component mount
    useEffect(() => {
        if (!user) return;
        fetchThreads();
    }, [user]);

    // Auto-select first thread if none selected
    useEffect(() => {
        const hasQuery =
            searchParams.get("hostId") ||
            searchParams.get("otherUserId") ||
            searchParams.get("listingId");
        if (hasQuery) return;
        if (selected.otherUserId || selected.listingId !== "") return;
        if (threads.length === 0) return;

        setSelectedThread({
            otherUserId: threads[0].otherUserId,
            listingId: threads[0].listingId,
        });
    }, [threads, selected.otherUserId, searchParams]);

    // Navigate to thread and update URL
    const setSelectedThread = (thread: { otherUserId: string; listingId: string }) => {
        setSelected({ ...thread, hostId: thread.otherUserId });
        const params = new URLSearchParams();
        if (thread.otherUserId) params.set("hostId", thread.otherUserId);
        if (thread.listingId && thread.listingId !== "all") params.set("listingId", thread.listingId);
        const query = params.toString();
        router.replace(query ? `/dashboard/customer/messages?${query}` : "/dashboard/customer/messages");
    };

    // Mark thread as read
    const markThreadRead = async (thread: { otherUserId: string; listingId: string }) => {
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

    // Fetch messages for selected thread
    const fetchMessages = async (
        hostId: string,
        listingId: string,
        options?: { cursor?: string | null; append?: boolean }
    ) => {
        const normalizedListingId = !listingId || listingId === "all" ? "all" : listingId;
        if (!hostId || !normalizedListingId) {
            if (!options?.append) {
                setMessages([]);
                setMessagesHasMore(false);
                setMessagesCursor(null);
            }
            return;
        }

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
                `/api/messages/${hostId}/${normalizedListingId}?${params.toString()}`,
                { credentials: "include" }
            );
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.message || "Failed to load messages");
            }

            const list = Array.isArray(data?.data) ? data.data : [];
            const normalized = list.map((message: Message) => normalizeMessage(message));
            setMessages((prev) => (append ? [...normalized, ...prev] : normalized));
            setMessagesCursor(data.nextCursor || null);
            setMessagesHasMore(Boolean(data.nextCursor));

            if (!append) {
                await markThreadRead({ otherUserId: hostId, listingId: normalizedListingId });
                setThreads((prev) =>
                    prev.map((thread) =>
                        thread.otherUserId === hostId && thread.listingId === normalizedListingId
                            ? { ...thread, unread: false }
                            : thread
                    )
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

    // Auto-fetch messages when thread is selected
    useEffect(() => {
        if (!selected.otherUserId || !selected.listingId) return;
        fetchMessages(selected.otherUserId, selected.listingId);
    }, [selected.otherUserId, selected.listingId]);

    // Initialize socket
    useEffect(() => {
        if (!user) return;

        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        console.log("Initializing socket");
        initSocket(token);
        const newSocket = getSocket();

        // Socket event listeners
        newSocket?.on("receiveMessage", (message: Message) => {
            console.log("receiveMessage event received:", message);
            setMessages((prev) => [...prev, normalizeMessage({ ...message, sending: false })]);
        });

        newSocket?.on("messageSent", (data: any) => {
            console.log("messageSent event:", data);
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.tempId === data.tempId
                        ? {
                            ...normalizeMessage(data.message),
                            tempId: undefined,
                            sending: false,
                        }
                        : msg,
                ),
            );
        });

        newSocket?.on("messageStatusUpdate", (data: any) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg._id === data.messageId
                        ? { ...msg, status: data.status, read: data.status === "read" }
                        : msg,
                ),
            );
        });

        newSocket?.on("messageEdited", (editedMessage: Message) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg._id === editedMessage._id
                        ? { ...normalizeMessage(editedMessage), sending: false }
                        : msg,
                ),
            );
            setEditingMessageId(null);
            setEditOriginal("");
            setInputValue("");
        });

        newSocket?.on("messageDeleted", (data: any) => {
            console.log("messageDeleted event received:", data);
            if (data.deleteType === "for_me") {
                console.log("Removing message locally:", data.messageId);
                setMessages((prev) =>
                    prev.filter((msg) => msg._id !== data.messageId),
                );
            } else if (data.deleteType === "for_everyone") {
                console.log("Marking message as deleted:", data.messageId);
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg._id === data.messageId
                            ? {
                                ...msg,
                                isDeleted: true,
                                deletedFor: [...(msg.deletedFor || []), user?.id || ""],
                                content: "This message was deleted",
                            }
                            : msg,
                    ),
                );
            }
        });

        newSocket?.on("userTyping", (data: any) => {
            setTypingUsers((prev) => new Set([...prev, data.userId]));
        });

        newSocket?.on("userStoppedTyping", (data: any) => {
            setTypingUsers((prev) => {
                const newSet = new Set(prev);
                newSet.delete(data.userId);
                return newSet;
            });
        });

        newSocket?.on("messageError", (data: any) => {
            setError(data.error);
            setMessages((prev) =>
                prev.filter((msg) => msg.tempId !== data.tempId),
            );
        });

        return () => {
            newSocket?.removeAllListeners();
        };
    }, [user, router]);

    // Join room when thread is selected
    useEffect(() => {
        if (!selected.listingId) return;
        console.log("Joining room:", selected.listingId);
        joinRoom(selected.listingId);
    }, [selected.listingId]);

    // Send message handler
    const handleSendMessage = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();

            if (!user || !selected.otherUserId || !socket?.connected) {
                setError("Unable to send message");
                return;
            }

            const contentToSend = inputValue.trim();
            if (!contentToSend) {
                setError("Unable to send message");
                return;
            }

            if (editingMessageId) {
                if (contentToSend === editOriginal.trim()) {
                    setEditingMessageId(null);
                    setEditOriginal("");
                    setInputValue("");
                    return;
                }
                try {
                    emitEditMessage(editingMessageId, contentToSend);
                    setEditingMessageId(null);
                    setEditOriginal("");
                    setInputValue("");
                } catch (err) {
                    setError("Failed to edit message");
                    console.error(err);
                }
                return;
            }

            const tempId = `temp_${Date.now()}`;
            const tempMessage: Message = {
                _id: tempId,
                tempId,
                sender: {
                    _id: user?.id || "",
                    fullName: user?.fullName || "",
                    profilePicture: user?.profilePicture,
                    email: user?.email || "",
                },
                receiver: {
                    _id: selected.otherUserId,
                    fullName: "",
                    email: "",
                },
                content: contentToSend,
                status: MessageStatus.SENT,
                read: false,
                isEdited: false,
                isDeleted: false,
                deletedFor: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                sending: true,
            };

            setMessages((prev) => [...prev, tempMessage]);
            setInputValue("");
            stopTyping(selected.otherUserId, selected.listingId || "all");

            emitSendMessage({
                receiverId: selected.otherUserId,
                listingId: selected.listingId || "all",
                content: contentToSend,
                tempId,
            });
        },
        [inputValue, user, selected.otherUserId, socket, selected.listingId, editingMessageId, editOriginal, emitEditMessage],
    );

    const handleEditMessage = useCallback(
        (messageId: string) => {
            const message = messages.find((msg) => msg._id === messageId);
            if (message) {
                setEditingMessageId(messageId);
                setEditOriginal(message.content);
                setInputValue(message.content);
            }
        },
        [messages],
    );

    const handleDeleteMessage = useCallback(
        (messageId: string, type: "for_me" | "for_everyone") => {
            try {
                emitDeleteMessage(messageId, type);
            } catch (err) {
                setError("Failed to delete message");
                console.error(err);
            }
        },
        [],
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);

        if (selected.otherUserId && selected.listingId) {
            startTyping(selected.otherUserId, selected.listingId);

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(() => {
                stopTyping(selected.otherUserId, selected.listingId);
            }, 3000);
        }
    };

    // Context Menu Handlers
    const handleContextMenu = useCallback(
        (e: React.MouseEvent, messageId: string, isOwnMessage: boolean) => {
            e.preventDefault();
            console.log("Right-click detected on message:", messageId);
            setContextMenu({
                isOpen: true,
                x: e.clientX,
                y: e.clientY,
                messageId,
                isOwnMessage,
            });
        },
        [],
    );

    // Long press support for mobile
    const longPressRef = useRef<NodeJS.Timeout | null>(null);
    const handleMouseDown = useCallback(
        (messageId: string, isOwnMessage: boolean) => {
            longPressRef.current = setTimeout(() => {
                const event = new MouseEvent("contextmenu", {
                    bubbles: true,
                    cancelable: true,
                });
                // Simulate context menu
                setContextMenu({
                    isOpen: true,
                    x: window.innerWidth / 2 - 100,
                    y: window.innerHeight / 2 - 100,
                    messageId,
                    isOwnMessage,
                });
            }, 500);
        },
        [],
    );

    const handleMouseUp = useCallback(() => {
        if (longPressRef.current) {
            clearTimeout(longPressRef.current);
        }
    }, []);

    // Copy message to clipboard
    const handleCopyMessage = useCallback(() => {
        const message = messages.find((m) => m._id === contextMenu.messageId);
        if (message) {
            navigator.clipboard.writeText(message.content);
            setToast({ message: "Message copied to clipboard", type: "success" });
        }
    }, [contextMenu.messageId, messages]);

    // Delete handlers
    const handleDeleteForMe = async (): Promise<void> => {
        console.log("Delete for me clicked, messageId:", deleteConfirm.messageId);
        return new Promise<void>((resolve, reject) => {
            try {
                console.log("Emitting delete message event with type: for_me");
                emitDeleteMessage(deleteConfirm.messageId, "for_me");
                // Wait for socket event to be processed
                setTimeout(() => {
                    console.log("Closing modal after for_me deletion");
                    setContextMenu({ isOpen: false, x: 0, y: 0, messageId: "", isOwnMessage: false });
                    resolve();
                }, 1000);
            } catch (err) {
                console.error("Error deleting message:", err);
                reject(err);
            }
        });
    };

    const handleDeleteForEveryone = async (): Promise<void> => {
        console.log("Delete for everyone clicked, messageId:", deleteConfirm.messageId);
        return new Promise<void>((resolve, reject) => {
            try {
                console.log("Emitting delete message event with type: for_everyone");
                emitDeleteMessage(deleteConfirm.messageId, "for_everyone");
                // Wait for socket event to be processed
                setTimeout(() => {
                    console.log("Closing modal after for_everyone deletion");
                    setContextMenu({ isOpen: false, x: 0, y: 0, messageId: "", isOwnMessage: false });
                    resolve();
                }, 1000);
            } catch (err) {
                console.error("Error deleting message:", err);
                reject(err);
            }
        });
    };

    // Add timeout to prevent forever loading
    useEffect(() => {
        const loadingTimeout = setTimeout(() => {
            if (loadingMessages && !messages.length) {
                console.warn("Loading timeout - showing error");
                setError("Failed to load messages. Please refresh the page.");
                setLoadingMessages(false);
            }
        }, 10000); // 10 second timeout

        return () => clearTimeout(loadingTimeout);
    }, [loadingMessages, messages]);

    useEffect(() => {
        if (messagesLoadingMore) return;
        if (messages.length === 0) return;
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, messagesLoadingMore, selected.otherUserId, selected.listingId]);

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-center">
                    <p className="text-gray-600 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Left sidebar - Thread list */}
            <div className="w-80 border-r border-gray-300 flex flex-col bg-white">
                <div className="border-b border-gray-200 px-4 py-4">
                    <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {threadsLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : threads.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                            No conversations yet
                        </div>
                    ) : (
                        threads.map((thread) => (
                            <button
                                key={thread.id}
                                onClick={() => setSelectedThread({ otherUserId: thread.otherUserId, listingId: thread.listingId })}
                                className={`w-full px-4 py-3 border-b border-gray-100 text-left hover:bg-gray-50 transition-colors ${selected.otherUserId === thread.otherUserId ? "bg-emerald-50 border-l-4 border-l-emerald-600" : ""
                                    } ${thread.unread ? "bg-blue-50" : ""}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate">{thread.title}</h3>
                                        <p className="text-xs text-gray-500 truncate">{thread.lastMessage || "No messages"}</p>
                                    </div>
                                    {thread.unread && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0"></div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">{new Date(thread.lastMessageAt).toLocaleDateString()}</p>
                            </button>
                        ))
                    )}
                </div>

                {threadsHasMore && !threadsLoading && (
                    <button
                        onClick={() => fetchThreads({ cursor: threadsCursor, append: true })}
                        className="m-4 px-4 py-2 text-sm font-semibold text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-50"
                    >
                        {threadsLoadingMore ? "Loading..." : "Load more"}
                    </button>
                )}
            </div>

            {/* Right side - Messages */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="bg-white border-b border-gray-300 p-4 flex items-center justify-between shadow-sm">
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900">
                            {selected.otherUserId ? threads.find(t => t.otherUserId === selected.otherUserId)?.title || "Chat" : "Select a conversation"}
                        </h1>
                        {typingUsers.size > 0 && (
                            <p className="text-sm text-gray-500 italic">
                                {typingUsers.size === 1 ? "Typing..." : "Multiple people typing..."}
                            </p>
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 flex justify-between items-center">
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="text-red-700 font-bold hover:text-red-900">×</button>
                    </div>
                )}

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                    {!selected.otherUserId ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-400 text-center">Select a conversation to start messaging</p>
                        </div>
                    ) : loadingMessages ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-400 text-center">No messages yet. Start the conversation!</p>
                        </div>
                    ) : (
                        (() => {
                            let lastDate = "";
                            return messages.map((message) => {
                                const isOwnMessage = getUserId(message.sender) === user?.id;
                                const isDeletedForEveryone = message.isDeleted && message.deletedFor?.includes(user?.id || "");
                                const dateLabel = new Date(message.createdAt).toLocaleDateString();
                                const showDate = dateLabel !== lastDate;
                                lastDate = dateLabel;

                                return (
                                    <div key={message._id}>
                                        {showDate && (
                                            <div className="text-center text-xs text-gray-400 my-3">
                                                {dateLabel}
                                            </div>
                                        )}
                                        <div
                                            className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} group`}
                                        >
                                            {!isOwnMessage && message.sender?.profilePicture && (
                                                <img
                                                    src={message.sender.profilePicture}
                                                    alt={message.sender.fullName}
                                                    className="w-8 h-8 rounded-full mr-2 mt-1"
                                                />
                                            )}

                                            <div className="relative max-w-md">
                                                <div
                                                    onContextMenu={(e) => {
                                                        if (!isDeletedForEveryone) {
                                                            handleContextMenu(e, message._id, isOwnMessage);
                                                        }
                                                    }}
                                                    onMouseDown={() =>
                                                        handleMouseDown(message._id, isOwnMessage)
                                                    }
                                                    onMouseUp={handleMouseUp}
                                                    onTouchStart={() =>
                                                        handleMouseDown(message._id, isOwnMessage)
                                                    }
                                                    onTouchEnd={handleMouseUp}
                                                    className={`px-4 py-2 rounded-2xl break-words transition-opacity ${!isDeletedForEveryone ? "cursor-context-menu" : "cursor-default"
                                                        } ${isOwnMessage
                                                            ? "bg-blue-500 text-white rounded-br-none"
                                                            : "bg-gray-300 text-gray-900 rounded-bl-none"
                                                        } ${message.sending ? "opacity-60" : ""} ${isDeletedForEveryone ? "opacity-60 pointer-events-none" : ""
                                                        }`}
                                                >
                                                    {isDeletedForEveryone ? (
                                                        <p className="text-sm italic text-gray-500">
                                                            {isOwnMessage
                                                                ? "You deleted this message"
                                                                : "This message was deleted"}
                                                        </p>
                                                    ) : (
                                                        <>
                                                            <>
                                                                <p
                                                                    className={`text-sm ${isOwnMessage ? "text-white" : "text-gray-900"
                                                                        }`}
                                                                >
                                                                    {message.content}
                                                                </p>
                                                                <div
                                                                    className={`text-xs mt-1 flex items-center justify-between ${isOwnMessage
                                                                        ? "text-blue-100"
                                                                        : "text-gray-600"
                                                                        }`}
                                                                >
                                                                    <span>
                                                                        {new Date(
                                                                            message.createdAt,
                                                                        ).toLocaleTimeString([], {
                                                                            hour: "2-digit",
                                                                            minute: "2-digit",
                                                                        })}
                                                                    </span>
                                                                    <div className="ml-2 flex items-center gap-1">
                                                                        {message.isEdited && (
                                                                            <span className="italic text-xs">
                                                                                (edited)
                                                                            </span>
                                                                        )}
                                                                        {isOwnMessage && !message.sending && (
                                                                            <span className="font-semibold">
                                                                                {message.status ===
                                                                                    MessageStatus.SENT && "✓"}
                                                                                {message.status ===
                                                                                    MessageStatus.DELIVERED &&
                                                                                    "✓✓"}
                                                                                {message.status ===
                                                                                    MessageStatus.READ && (
                                                                                        <span className="text-blue-200">
                                                                                            ✓✓
                                                                                        </span>
                                                                                    )}
                                                                            </span>
                                                                        )}
                                                                        {message.sending && (
                                                                            <span className="animate-pulse">⏳</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </>
                                                        </>
                                                    )}
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                );
                            });
                        })()
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                {
                    selected.otherUserId && (
                        <div className="bg-white border-t border-gray-300 p-4 shadow-lg">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <textarea
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter" && !event.shiftKey) {
                                            event.preventDefault();
                                            event.currentTarget.form?.requestSubmit();
                                        }
                                    }}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                    rows={1}
                                    disabled={!socket?.connected}
                                    maxLength={5000}
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || !socket?.connected}
                                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
                                >
                                    Send
                                </button>
                            </form>
                        </div>
                    )
                }
            </div>

            {/* Context Menu */}
            <ContextMenu
                isOpen={contextMenu.isOpen}
                x={contextMenu.x}
                y={contextMenu.y}
                isOwnMessage={contextMenu.isOwnMessage}
                onClose={() =>
                    setContextMenu({ isOpen: false, x: 0, y: 0, messageId: "", isOwnMessage: false })
                }
                onCopy={handleCopyMessage}
                onEdit={() => {
                    handleEditMessage(contextMenu.messageId);
                    setContextMenu({ isOpen: false, x: 0, y: 0, messageId: "", isOwnMessage: false });
                }}
                onDelete={() => {
                    console.log("Delete option clicked from context menu");
                    setDeleteConfirm({ isOpen: true, messageId: contextMenu.messageId });
                    setContextMenu({ isOpen: false, x: 0, y: 0, messageId: "", isOwnMessage: false });
                }}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, messageId: "" })}
                onDeleteForMe={handleDeleteForMe}
                onDeleteForEveryone={handleDeleteForEveryone}
            />

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
