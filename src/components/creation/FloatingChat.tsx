"use client";

import { useState } from "react";
import { CreationChat } from "@/components/creation/CreationChat";
import { Button } from "@/components/ui/Button";
import { MessageSquare, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function FloatingChat() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "fixed bottom-6 right-6 z-50",
                    "w-14 h-14 rounded-full",
                    "bg-gradient-to-br from-purple-500 to-pink-500",
                    "shadow-lg hover:shadow-xl",
                    "flex items-center justify-center",
                    "transition-all duration-300",
                    "hover:scale-110",
                    isOpen && "scale-0 opacity-0"
                )}
            >
                <MessageSquare className="w-6 h-6 text-white" />
            </button>

            {/* Chat Modal */}
            <div
                className={cn(
                    "fixed bottom-6 right-6 z-50",
                    "w-[400px] h-[600px]",
                    "transition-all duration-300",
                    "origin-bottom-right",
                    isOpen
                        ? "scale-100 opacity-100"
                        : "scale-0 opacity-0 pointer-events-none"
                )}
            >
                <div className="relative h-full flex flex-col rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl bg-black/80 border border-white/10">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <MessageSquare className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-white">AI Assistent</h3>
                                <p className="text-xs text-white/50">Dein kreativer Partner</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4 text-white/70" />
                        </button>
                    </div>

                    {/* Chat Content */}
                    <div className="flex-1 overflow-hidden">
                        <CreationChat compact={true} />
                    </div>
                </div>
            </div>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
