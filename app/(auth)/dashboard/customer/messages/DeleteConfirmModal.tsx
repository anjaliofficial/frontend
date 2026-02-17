"use client";

import React from "react";

interface DeleteConfirmModalProps {
    isOpen: boolean;
    isDeleting: boolean;
    onClose: () => void;
    onDeleteForMe: () => Promise<void>;
    onDeleteForEveryone: () => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
    isOpen,
    isDeleting,
    onClose,
    onDeleteForMe,
    onDeleteForEveryone,
}) => {
    if (!isOpen) return null;

    const handleDeleteForMe = async () => {
        try {
            await onDeleteForMe();
        } catch (err: any) {
            console.error("Delete for me error:", err);
        }
    };

    const handleDeleteForEveryone = async () => {
        try {
            await onDeleteForEveryone();
        } catch (err: any) {
            console.error("Delete for everyone error:", err);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-gray-900 text-white rounded-2xl shadow-2xl max-w-sm w-full border border-gray-700 animate-in fade-in zoom-in-95">
                    {/* Header */}
                    <div className="px-6 py-6 border-b border-gray-700">
                        <h2 className="text-xl font-semibold">Delete message?</h2>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-4">
                        <p className="text-gray-300 text-sm mb-4">
                            Choose how you want to delete this message.
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="px-6 py-4 border-t border-gray-700 space-y-3">
                        {/* Delete for Everyone */}
                        <button
                            onClick={handleDeleteForEveryone}
                            disabled={isDeleting}
                            className="w-full px-4 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {isDeleting && (
                                <span className="animate-spin text-lg">⏳</span>
                            )}
                            <span>Delete for everyone</span>
                        </button>

                        {/* Delete for Me */}
                        <button
                            onClick={handleDeleteForMe}
                            disabled={isDeleting}
                            className="w-full px-4 py-3 bg-teal-700 hover:bg-teal-800 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {isDeleting && (
                                <span className="animate-spin text-lg">⏳</span>
                            )}
                            <span>Delete for me</span>
                        </button>

                        {/* Cancel */}
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DeleteConfirmModal;
