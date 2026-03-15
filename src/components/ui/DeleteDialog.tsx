"use client";
import React from 'react';
import { X, Trash2, AlertCircle } from 'lucide-react';

interface DeleteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    isLoading?: boolean;
}

export default function DeleteDialog({
    isOpen,
    onClose,
    onConfirm,
    title = "Delete Address",
    message = "Are you sure you want to delete this address? This action cannot be undone.",
    isLoading = false
}: DeleteDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6">
            <div className="absolute inset-0 bg-primary/20 backdrop-blur-md" onClick={onClose} />

            <div className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-8 md:p-10 text-center">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trash2 size={40} />
                    </div>

                    <h3 className="text-2xl font-black text-primary tracking-tighter mb-2">
                        {title}
                    </h3>
                    <p className="text-gray-400 font-medium text-sm leading-relaxed mb-8">
                        {message}
                    </p>

                    <div className="flex justify-center items-center gap-3">
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="w-full py-4 bg-red-500 text-white rounded-2xl font-black text-lg hover:bg-red-600 transition-all active:scale-[0.98] shadow-xl shadow-red-500/20 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                "Yes, Delete"
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-lg hover:bg-gray-100 transition-all active:scale-[0.98]"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
