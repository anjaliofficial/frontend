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

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [otherUserId, setOtherUserId] = useState<string | null>(null);
    const [listingId, setListingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [paramsReady, setParamsReady] = useState(false);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
    const [error, setError] = useState<string | null>(null);

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
        isDeleting: false,
    });

    const socket = getSocket();
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Extract otherUserId and listingId from URL query params
    useEffect(() => {
        const otherUserIdFromParams = searchParams.get("otherUserId") || searchParams.get("customerId");
        const listingIdFromParams = searchParams.get("listingId") || "all";

        console.log("Param extraction - otherUserId:", otherUserIdFromParams, "listingId:", listingIdFromParams);

        if (otherUserIdFromParams) {
            console.log("Setting otherUserId:", otherUserIdFromParams, "listingId:", listingIdFromParams);
            setOtherUserId(otherUserIdFromParams);
            setListingId(listingIdFromParams);
            setParamsReady(true);
        } else {
            console.warn("Invalid params - missing otherUserId");
            setLoading(false);
            setParamsReady(false);
        }
    }, [searchParams]);

    // Initialize socket and fetch messages
    useEffect(() => {
        if (!user) {
            console.log("No user, skipping socket init");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            console.log("No token, redirecting to login");
            router.push("/login");
            return;
        }

        console.log("Initializing socket and messages - paramsReady:", paramsReady, "otherUserId:", otherUserId, "listingId:", listingId);
        initSocket(token);
        const newSocket = getSocket();

        if (listingId && otherUserId) {
            console.log("Joining room and fetching messages");
            joinRoom(listingId);
            markConversationRead(otherUserId, listingId);
            fetchMessages();
        } else {
            console.warn("Missing listingId or otherUserId");
            setLoading(false);
        }

        // Socket event listeners
        newSocket?.on("messageSent", (data: any) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.tempId === data.tempId
                        ? {
                            ...data.message,
                            tempId: undefined,
                            sending: false,
                        }
                        : msg,
                ),
            );
        });

        newSocket?.on("receiveMessage", (message: Message) => {
            setMessages((prev) => [...prev, { ...message, sending: false }]);
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
                        ? { ...editedMessage, sending: false }
                        : msg,
                ),
            );
            setEditingMessageId(null);
            setEditContent("");
        });

        newSocket?.on("messageDeleted", (data: any) => {
            if (data.deleteType === "for_me") {
                setMessages((prev) =>
                    prev.filter((msg) => msg._id !== data.messageId),
                );
            } else if (data.deleteType === "for_everyone") {
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
            newSocket?.off("messageSent");
            newSocket?.off("receiveMessage");
            newSocket?.off("messageStatusUpdate");
            newSocket?.off("messageEdited");
            newSocket?.off("messageDeleted");
            newSocket?.off("userTyping");
            newSocket?.off("userStoppedTyping");
            newSocket?.off("messageError");
        };
    }, [user, listingId, otherUserId, router, paramsReady]);

    const fetchMessages = async () => {
        if (!otherUserId || !listingId || !user) {
            console.warn("fetchMessages early return - otherUserId:", otherUserId, "listingId:", listingId, "user:", user);
            setLoading(false);
            return;
        }

        try {
            console.log("Fetching messages for:", otherUserId, listingId);
            setLoading(true);
            const response = await fetch(
                `/api/messages/${otherUserId}/${listingId}`,
            );
            console.log("API response status:", response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("API response data:", data);

            if (data.success && Array.isArray(data.data)) {
                setMessages(
                    data.data.map((msg: Message) => ({ ...msg, sending: false })),
                );
            } else if (!data.success) {
                setError("Failed to fetch messages: " + (data.message || "Unknown error"));
            }
        } catch (err: any) {
            const errorMsg = err instanceof Error ? err.message : "Failed to load messages";
            setError(errorMsg);
            console.error("Error fetching messages:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();

            if (!inputValue.trim() || !user || !otherUserId || !socket?.connected) {
                setError("Unable to send message");
                return;
            }

            const tempId = `temp_${Date.now()}`;
            const contentToSend = inputValue;
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
                    _id: otherUserId,
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
            stopTyping(otherUserId, listingId!);

            emitSendMessage({
                receiverId: otherUserId,
                listingId: listingId || "all",
                content: contentToSend,
                tempId,
            });
        },
        [inputValue, user, otherUserId, socket, listingId],
    );

    const handleEditMessage = useCallback(
        (messageId: string) => {
            const message = messages.find((msg) => msg._id === messageId);
            if (message) {
                setEditingMessageId(messageId);
                setEditContent(message.content);
            }
        },
        [messages],
    );

    const handleSaveEdit = useCallback(async () => {
        if (!editContent.trim() || !editingMessageId) {
            setError("Edit content cannot be empty");
            return;
        }

        try {
            emitEditMessage(editingMessageId, editContent);
            setEditingMessageId(null);
            setEditContent("");
        } catch (err) {
            setError("Failed to edit message");
            console.error(err);
        }
    }, [editContent, editingMessageId]);

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

        if (otherUserId && listingId) {
            startTyping(otherUserId, listingId);

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(() => {
                stopTyping(otherUserId, listingId);
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
            setError("Message copied to clipboard");
            setTimeout(() => setError(null), 2000);
        }
    }, [contextMenu.messageId, messages]);

    // Delete handlers
    const handleDeleteForMe = async () => {
        console.log("Delete for me clicked");
        setDeleteConfirm((prev) => ({ ...prev, isDeleting: true }));
        try {
            console.log("Emitting delete message event:", contextMenu.messageId);
            emitDeleteMessage(contextMenu.messageId, "for_me");
            // Give a short delay to show loading state
            setTimeout(() => {
                setDeleteConfirm({ isOpen: false, messageId: "", isDeleting: false });
                setContextMenu({ isOpen: false, x: 0, y: 0, messageId: "", isOwnMessage: false });
            }, 500);
        } catch (err) {
            setDeleteConfirm((prev) => ({ ...prev, isDeleting: false }));
            console.error("Error deleting message:", err);
        }
    };

    const handleDeleteForEveryone = async () => {
        console.log("Delete for everyone clicked");
        setDeleteConfirm((prev) => ({ ...prev, isDeleting: true }));
        try {
            console.log("Emitting delete for everyone event:", contextMenu.messageId);
            emitDeleteMessage(contextMenu.messageId, "for_everyone");
            // Give a short delay to show loading state
            setTimeout(() => {
                setDeleteConfirm({ isOpen: false, messageId: "", isDeleting: false });
                setContextMenu({ isOpen: false, x: 0, y: 0, messageId: "", isOwnMessage: false });
            }, 500);
        } catch (err) {
            setDeleteConfirm((prev) => ({ ...prev, isDeleting: false }));
            console.error("Error deleting message:", err);
        }
    };

    // Placeholder handlers for other menu options
    const handleReply = () => {
        // TODO: Implement reply/quote functionality
        console.log("Reply to message:", contextMenu.messageId);
    };

    const handleForward = () => {
        // TODO: Implement forward functionality
        console.log("Forward message:", contextMenu.messageId);
    };

    const handlePin = () => {
        // TODO: Implement pin functionality
        console.log("Pin message:", contextMenu.messageId);
    };

    const handleStar = () => {
        // TODO: Implement star/favorite functionality
        console.log("Star message:", contextMenu.messageId);
    };

    const handleSelect = () => {
        // TODO: Implement bulk select functionality
        console.log("Select message:", contextMenu.messageId);
    };

    // Add timeout to prevent forever loading
    useEffect(() => {
        const loadingTimeout = setTimeout(() => {
            if (loading && !messages.length) {
                console.warn("Loading timeout - showing error");
                setError("Failed to load messages. Please refresh the page.");
                setLoading(false);
            }
        }, 10000); // 10 second timeout

        return () => clearTimeout(loadingTimeout);
    }, [loading, messages]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-sm">Loading messages...</p>
                    <p className="text-gray-400 text-xs mt-2">otherUserId: {otherUserId}, listingId: {listingId}, user: {user?.id}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white border-b border-gray-300 p-4 flex items-center justify-between shadow-sm">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Messages</h1>
                    {typingUsers.size > 0 && (
                        <p className="text-sm text-gray-500 italic">
                            {typingUsers.size === 1
                                ? "Someone is typing..."
                                : "Multiple people typing..."}
                        </p>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 flex justify-between items-center">
                    <span>{error}</span>
                    <button
                        onClick={() => setError(null)}
                        className="text-red-700 font-bold hover:text-red-900"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400 text-center">
                            No messages yet.<br />
                            Start a conversation!
                        </p>
                    </div>
                ) : (
                    messages.map((message) => {
                        const isOwnMessage = message.sender._id === user?.id;
                        const isDeletedForEveryone =
                            message.isDeleted && message.deletedFor?.includes(user?.id || "");

                        return (
                            <div
                                key={message._id}
                                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} group`}
                            >
                                {!isOwnMessage && message.sender.profilePicture && (
                                    <img
                                        src={message.sender.profilePicture}
                                        alt={message.sender.fullName}
                                        className="w-8 h-8 rounded-full mr-2 mt-1"
                                    />
                                )}

                                <div className="relative max-w-md">
                                    <div
                                        onContextMenu={(e) =>
                                            handleContextMenu(e, message._id, isOwnMessage)
                                        }
                                        onMouseDown={() =>
                                            handleMouseDown(message._id, isOwnMessage)
                                        }
                                        onMouseUp={handleMouseUp}
                                        onTouchStart={() =>
                                            handleMouseDown(message._id, isOwnMessage)
                                        }
                                        onTouchEnd={handleMouseUp}
                                        className={`px-4 py-2 rounded-2xl break-words transition-opacity cursor-context-menu ${isOwnMessage
                                            ? "bg-blue-500 text-white rounded-br-none"
                                            : "bg-gray-300 text-gray-900 rounded-bl-none"
                                            } ${message.sending ? "opacity-60" : ""}`}
                                    >
                                        {isDeletedForEveryone ? (
                                            <p className="text-sm italic text-gray-500">
                                                {isOwnMessage
                                                    ? "You deleted this message"
                                                    : "This message was deleted"}
                                            </p>
                                        ) : (
                                            <>
                                                {editingMessageId === message._id ? (
                                                    <div className="flex flex-col gap-2">
                                                        <textarea
                                                            value={editContent}
                                                            onChange={(e) =>
                                                                setEditContent(e.target.value)
                                                            }
                                                            className="w-full p-2 border border-gray-400 rounded text-gray-900"
                                                            rows={2}
                                                            autoFocus
                                                        />
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={handleSaveEdit}
                                                                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingMessageId(null);
                                                                    setEditContent("");
                                                                }}
                                                                className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
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
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {/* Message actions */}
                                    {isOwnMessage &&
                                        !isDeletedForEveryone &&
                                        editingMessageId !== message._id && (
                                            <div className="opacity-0 group-hover:opacity-100 absolute right-0 top-0 translate-y-1 flex gap-1 bg-white rounded-lg shadow-lg border border-gray-200 transition-opacity">
                                                <button
                                                    onClick={() =>
                                                        handleEditMessage(message._id)
                                                    }
                                                    className="px-3 py-2 text-sm text-blue-500 hover:bg-gray-100 rounded-l-lg"
                                                    title="Edit message"
                                                >
                                                    ✏️
                                                </button>
                                                <div className="w-px bg-gray-300"></div>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteMessage(message._id, "for_me")
                                                    }
                                                    className="px-3 py-2 text-sm text-orange-500 hover:bg-gray-100"
                                                    title="Delete for me"
                                                >
                                                    🗑️
                                                </button>
                                                <div className="w-px bg-gray-300"></div>
                                                <button
                                                    onClick={() => {
                                                        if (
                                                            confirm(
                                                                "Delete for everyone? This cannot be undone.",
                                                            )
                                                        ) {
                                                            handleDeleteMessage(
                                                                message._id,
                                                                "for_everyone",
                                                            );
                                                        }
                                                    }}
                                                    className="px-3 py-2 text-sm text-red-500 hover:bg-gray-100 rounded-r-lg"
                                                    title="Delete for all"
                                                >
                                                    ⚠️
                                                </button>
                                            </div>
                                        )}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-300 p-4 shadow-lg">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <textarea
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={1}
                        disabled={!socket?.connected}
                        maxLength={5000}
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim() || !socket?.connected}
                        className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
                    >
                        Send
                    </button>
                </form>
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
                onReply={handleReply}
                onCopy={handleCopyMessage}
                onForward={handleForward}
                onPin={handlePin}
                onStar={handleStar}
                onEdit={() => {
                    handleEditMessage(contextMenu.messageId);
                    setContextMenu({ isOpen: false, x: 0, y: 0, messageId: "", isOwnMessage: false });
                }}
                onDelete={() => {
                    console.log("Delete option clicked from context menu");
                    setDeleteConfirm({ isOpen: true, messageId: contextMenu.messageId, isDeleting: false });
                    setContextMenu({ isOpen: false, x: 0, y: 0, messageId: "", isOwnMessage: false });
                }}
                onSelect={handleSelect}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={deleteConfirm.isOpen}
                isDeleting={deleteConfirm.isDeleting}
                onClose={() => setDeleteConfirm({ isOpen: false, messageId: "", isDeleting: false })}
                onDeleteForMe={handleDeleteForMe}
                onDeleteForEveryone={handleDeleteForEveryone}
            />
        </div>
    );
}
