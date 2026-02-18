"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { format } from "date-fns";
import {
  ArrowLeft,
  Send,
  MoreVertical,
  Trash,
  Edit,
  Paperclip,
  X,
  ImageIcon,
  Video,
} from "lucide-react";
import {
  getSocket,
  initSocket,
  sendMessage,
} from "@/lib/api/socket-client";

// Types
interface User {
  id: string;
  name?: string;
  avatar?: string;
  email?: string;
}

interface MediaItem {
  url: string;
  mimeType: string;
  kind: "image" | "video";
  fileName?: string;
}

interface Message {
  _id?: string;
  id?: string;
  tempId?: string;
  content: string;
  sender: User | string;
  receiver: User | string;
  listingId?: string;
  createdAt?: string;
  updatedAt?: string;
  sending?: boolean;
  media?: MediaItem[];
  type?: "text" | "media";
}

interface Thread {
  id: string;
  otherUserId: string;
  listingId: string;
  title: string;
  lastMessage: string;
  lastMessageAt: string;
  unread: boolean;
}

interface Selected {
  otherUserId: string;
  listingId: string;
  hostId: string;
}

interface AttachmentPreview {
  file: File;
  preview: string;
  kind: "image" | "video";
}

// Helper to get user ID from string or object
const getUserId = (u: User | string | undefined): string | undefined => {
  if (!u) return undefined;
  if (typeof u === "string") return u;
  return u.id;
};

// Helper to normalize user strings to objects
const normalizeUser = (u: User | string | undefined): User | undefined => {
  if (!u) return undefined;
  if (typeof u === "string") return { id: u };
  return u;
};

// Helper to normalize messages
const normalizeMessage = (msg: Message): Message => {
  return {
    ...msg,
    sender: normalizeUser(msg.sender) || msg.sender,
    receiver: normalizeUser(msg.receiver) || msg.receiver,
  };
};

// Normalize media URLs
const normalizeMediaUrl = (url: string): string => {
  if (!url) return "";
  if (url.startsWith("blob:") || url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  if (url.startsWith("/uploads/")) {
    return `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"}${url}`;
  }
  return `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"}/uploads/${url}`;
};

const MessageApp = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<{ id: string; name?: string } | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Selected>({
    otherUserId: "",
    listingId: "",
    hostId: "",
  });

  const [loadingMessages, setLoadingMessages] = useState(false);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [messagesLoadingMore, setMessagesLoadingMore] = useState(false);
  const [threadsLoadingMore, setThreadsLoadingMore] = useState(false);

  const [threadsCursor, setThreadsCursor] = useState<string | null>(null);
  const [threadsHasMore, setThreadsHasMore] = useState(false);
  const [messagesCursor, setMessagesCursor] = useState<string | null>(null);
  const [messagesHasMore, setMessagesHasMore] = useState(false);

  const [messageInput, setMessageInput] = useState("");
  const [contextMenu, setContextMenu] = useState<{
    open: boolean;
    x: number;
    y: number;
    message: Message | null;
  }>({
    open: false,
    x: 0,
    y: 0,
    message: null,
  });
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    message: Message | null;
  }>({ open: false, message: null });

  const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const threadPageSize = 15;
  const messagePageSize = 20;

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Load user profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data.data);
        } else {
          console.error("Failed to load user:", data.message);
          router.push("/login");
        }
      } catch (error) {
        console.error("Error loading user:", error);
        router.push("/login");
      }
    };
    fetchUser();
  }, [router]);

  // Auto-select from query params
  useEffect(() => {
    const hostId = searchParams.get("hostId") || "";
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
        lastMessage: thread.lastMessage?.type === "media"
          ? (thread.lastMessage?.media && thread.lastMessage.media.length > 0 ? "Attachment" : thread.lastMessage?.content || "")
          : (thread.lastMessage?.content || ""),
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
              tempId: data.tempId,
              sending: false,
            }
            : msg
        )
      );
    });

    newSocket?.on("messageDeleted", (data: { messageId: string }) => {
      console.log("messageDeleted event:", data);
      setMessages((prev) => prev.filter((msg) => msg._id !== data.messageId));
    });

    newSocket?.on("messageUpdated", (data: { message: Message }) => {
      console.log("messageUpdated event:", data);
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.message._id ? normalizeMessage(data.message) : msg
        )
      );
    });

    return () => {
      newSocket?.off("receiveMessage");
      newSocket?.off("messageSent");
      newSocket?.off("messageDeleted");
      newSocket?.off("messageUpdated");
    };
  }, [user, router]);

  // Auto-scroll to bottom of messages (but only when not loading more)
  useEffect(() => {
    if (!messagesContainerRef.current || messagesLoadingMore) return;
    messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
  }, [messages, messagesLoadingMore]);

  // Handle file attachment
  const handleAttachFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    const newAttachments: AttachmentPreview[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!validTypes.includes(file.type)) {
        alert(`File ${file.name} is not a supported image or video type`);
        continue;
      }
      if (file.size > maxSize) {
        alert(`File ${file.name} exceeds 10MB size limit`);
        continue;
      }

      const preview = URL.createObjectURL(file);
      const kind = file.type.startsWith("image/") ? "image" : "video";
      newAttachments.push({ file, preview, kind });
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  // Upload attachments
  const uploadAttachments = async (files: File[]): Promise<MediaItem[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Upload failed");
    }

    const data = await res.json();
    return data.files.map((f: any) => ({
      url: f.path,
      mimeType: f.mimetype,
      kind: f.mimetype.startsWith("image/") ? "image" : "video",
      fileName: f.originalname,
    }));
  };

  // Send message
  const handleSendMessage = async () => {
    const content = messageInput.trim();
    if (!content && attachments.length === 0) return;
    if (!selected.otherUserId || !selected.listingId) return;
    if (!user) return;

    const tempId = `temp_${Date.now()}`;
    let mediaItems: MediaItem[] = [];

    // Upload attachments if any
    if (attachments.length > 0) {
      try {
        mediaItems = await uploadAttachments(attachments.map((a) => a.file));
        // Clean up preview URLs
        attachments.forEach((a) => URL.revokeObjectURL(a.preview));
        setAttachments([]);
      } catch (error) {
        console.error("Upload error:", error);
        alert("Failed to upload attachments");
        return;
      }
    }

    // Optimistic UI update
    const optimisticMessage: Message = {
      tempId,
      content,
      sender: { id: user.id, name: user.name },
      receiver: { id: selected.otherUserId },
      listingId: selected.listingId,
      createdAt: new Date().toISOString(),
      sending: true,
      media: mediaItems,
      type: mediaItems.length > 0 ? "media" : "text",
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setMessageInput("");

    // Send via socket
    if (editingMessage) {
      // Editing not allowed for media messages
      setEditingMessage(null);
    } else {
      sendMessage({
        receiverId: selected.otherUserId,
        listingId: selected.listingId,
        content: content || undefined,
        media: mediaItems.length > 0 ? mediaItems : undefined,
        tempId,
      });
    }
  };

  // Edit message
  const handleEdit = (message: Message) => {
    if (message.media && message.media.length > 0) {
      alert("Cannot edit messages with attachments");
      return;
    }
    setEditingMessage(message);
    setMessageInput(message.content);
    setContextMenu({ open: false, x: 0, y: 0, message: null });
  };

  // Update message
  const handleUpdateMessage = async () => {
    if (!editingMessage) return;
    const content = messageInput.trim();
    if (!content) return;

    try {
      const res = await fetch(`/api/messages/${editingMessage._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update message");
      }

      setMessageInput("");
      setEditingMessage(null);
    } catch (error) {
      console.error("Error updating message:", error);
      alert("Failed to update message");
    }
  };

  // Delete message
  const handleDelete = (message: Message) => {
    setDeleteModal({ open: true, message });
    setContextMenu({ open: false, x: 0, y: 0, message: null });
  };

  const confirmDelete = async () => {
    if (!deleteModal.message) return;

    try {
      const res = await fetch(`/api/messages/${deleteModal.message._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete message");
      }

      setDeleteModal({ open: false, message: null });
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Failed to delete message");
    }
  };

  // Handle scroll for loading more threads
  const handleThreadsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    if (bottom && threadsHasMore && !threadsLoadingMore) {
      fetchThreads({ cursor: threadsCursor, append: true });
    }
  };

  // Handle scroll for loading more messages
  const handleMessagesScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const atTop = target.scrollTop === 0;
    if (atTop && messagesHasMore && !messagesLoadingMore) {
      const prevHeight = target.scrollHeight;
      fetchMessages(selected.otherUserId, selected.listingId, {
        cursor: messagesCursor,
        append: true,
      }).then(() => {
        // Maintain scroll position after loading older messages
        setTimeout(() => {
          const newHeight = target.scrollHeight;
          target.scrollTop = newHeight - prevHeight;
        }, 0);
      });
    }
  };

  // Handle context menu
  const handleContextMenu = (e: React.MouseEvent, message: Message) => {
    e.preventDefault();
    setContextMenu({
      open: true,
      x: e.clientX,
      y: e.clientY,
      message,
    });
  };

  // Close context menu
  useEffect(() => {
    const handleClick = () => {
      if (contextMenu.open) {
        setContextMenu({ open: false, x: 0, y: 0, message: null });
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [contextMenu.open]);

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Threads Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Messages</h2>
        </div>

        <div
          className="flex-1 overflow-y-auto"
          onScroll={handleThreadsScroll}
        >
          {threadsLoading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : threads.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No conversations</div>
          ) : (
            <>
              {threads.map((thread) => (
                <div
                  key={thread.id}
                  onClick={() =>
                    setSelectedThread({
                      otherUserId: thread.otherUserId,
                      listingId: thread.listingId,
                    })
                  }
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selected.otherUserId === thread.otherUserId &&
                      selected.listingId === thread.listingId
                      ? "bg-blue-50"
                      : ""
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-800">{thread.title}</h3>
                    {thread.unread && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-1">
                    {thread.lastMessage || "No messages yet"}
                  </p>
                  {thread.lastMessageAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      {format(new Date(thread.lastMessageAt), "MMM d, h:mm a")}
                    </p>
                  )}
                </div>
              ))}
              {threadsLoadingMore && (
                <div className="p-4 text-center text-gray-500">Loading more...</div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Messages Panel */}
      <div className="flex-1 flex flex-col">
        {!selected.otherUserId ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to start messaging
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <h2 className="text-lg font-semibold text-gray-800">
                {threads.find(
                  (t) =>
                    t.otherUserId === selected.otherUserId &&
                    t.listingId === selected.listingId
                )?.title || "Host"}
              </h2>
            </div>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              onScroll={handleMessagesScroll}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messagesLoadingMore && (
                <div className="text-center text-gray-500 py-2">
                  Loading older messages...
                </div>
              )}
              {loadingMessages ? (
                <div className="text-center text-gray-500">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500">No messages yet</div>
              ) : (
                messages.map((msg, index) => {
                  const senderId = getUserId(msg.sender);
                  const isSender = senderId === user?.id;

                  return (
                    <div
                      key={msg._id || msg.tempId || index}
                      className={`flex ${isSender ? "justify-end" : "justify-start"}`}
                      onContextMenu={(e) => handleContextMenu(e, msg)}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${isSender
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-800"
                          } ${msg.sending ? "opacity-50" : ""}`}
                      >
                        {msg.media && msg.media.length > 0 && (
                          <div className="space-y-2 mb-2">
                            {msg.media.map((item, idx) => {
                              const fullUrl = normalizeMediaUrl(item.url);
                              return (
                                <div key={idx}>
                                  {item.kind === "image" ? (
                                    <Image
                                      src={fullUrl}
                                      alt={item.fileName || "image"}
                                      width={300}
                                      height={200}
                                      className="rounded"
                                    />
                                  ) : (
                                    <video
                                      src={fullUrl}
                                      controls
                                      className="rounded max-w-full"
                                      style={{ maxHeight: "300px" }}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
                        {msg.createdAt && (
                          <p
                            className={`text-xs mt-1 ${isSender ? "text-blue-100" : "text-gray-500"
                              }`}
                          >
                            {format(new Date(msg.createdAt), "h:mm a")}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              {editingMessage && (
                <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded flex justify-between items-center">
                  <span className="text-sm text-yellow-800">Editing message</span>
                  <button
                    onClick={() => {
                      setEditingMessage(null);
                      setMessageInput("");
                    }}
                    className="text-yellow-800 hover:text-yellow-900"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {attachments.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {attachments.map((att, idx) => (
                    <div key={idx} className="relative">
                      {att.kind === "image" ? (
                        <Image
                          src={att.preview}
                          alt="preview"
                          width={80}
                          height={80}
                          className="rounded border border-gray-300"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded border border-gray-300 flex items-center justify-center">
                          <Video size={32} className="text-gray-600" />
                        </div>
                      )}
                      <button
                        onClick={() => removeAttachment(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleAttachFiles(e.target.files)}
                  accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm"
                  multiple
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition"
                  title="Attach files"
                >
                  <Paperclip size={20} />
                </button>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (editingMessage) {
                        handleUpdateMessage();
                      } else {
                        handleSendMessage();
                      }
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  onClick={editingMessage ? handleUpdateMessage : handleSendMessage}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu.open && contextMenu.message && (
        <div
          className="fixed bg-white border border-gray-300 rounded shadow-lg py-2 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {getUserId(contextMenu.message.sender) === user?.id && (
            <>
              {(!contextMenu.message.media || contextMenu.message.media.length === 0) && (
                <button
                  onClick={() => handleEdit(contextMenu.message!)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                >
                  <Edit size={16} />
                  Edit
                </button>
              )}
              <button
                onClick={() => handleDelete(contextMenu.message!)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-red-600"
              >
                <Trash size={16} />
                Delete
              </button>
            </>
          )}
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Message</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this message? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ open: false, message: null })}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageApp;
