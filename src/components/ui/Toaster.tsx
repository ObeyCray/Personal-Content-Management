"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { cn } from "@/lib/utils";
import { CheckCircle2, Trophy } from "lucide-react";

type ToastType = "success" | "achievement";

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastStore {
    toasts: Toast[];
    addToast: (message: string, type?: ToastType) => void;
    removeToast: (id: number) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    addToast: (message, type = "success") => {
        const id = Date.now();
        set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
        setTimeout(() => {
            set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
        }, 3000);
    },
    removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export function Toaster() {
    const { toasts } = useToastStore();

    return (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-2 pointer-events-none">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={cn(
                        "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md transition-all animate-in slide-in-from-right-full duration-300",
                        toast.type === "achievement"
                            ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500"
                            : "bg-background/80 border-white/10 text-foreground"
                    )}
                >
                    {toast.type === "achievement" ? (
                        <div className="p-1 bg-yellow-500/20 rounded-full"><Trophy className="w-4 h-4" /></div>
                    ) : (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                    )}

                    <span className="text-sm font-medium">{toast.message}</span>
                </div>
            ))}
        </div>
    );
}
