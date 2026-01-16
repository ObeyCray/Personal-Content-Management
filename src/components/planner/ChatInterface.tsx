"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Send, Sparkles, Plus, Clock, Bot, User, Check } from "lucide-react";
import { usePlannerStore, Suggestion } from "@/lib/planner";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

function SuggestionCard({
    suggestion,
    onAdd
}: {
    suggestion: Suggestion,
    onAdd: (s: Suggestion) => void
}) {
    const [added, setAdded] = useState(false);

    const handleAdd = () => {
        if (added) return;
        setAdded(true);
        onAdd(suggestion);
    };

    const typeColors = {
        creative: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
        work: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
        meeting: 'bg-green-500/10 text-green-300 border-green-500/20',
        admin: 'bg-gray-500/10 text-gray-300 border-gray-500/20',
        break: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
    };

    const colors = typeColors[suggestion.type] || typeColors.work;

    return (
        <motion.div
            layout
            className={cn(
                "group flex flex-col p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden",
                added
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-white/5 border-white/5 hover:border-primary/30 hover:bg-white/10"
            )}
        >
            <div className="flex items-start justify-between gap-3 relative z-10">
                <div className="flex gap-3.5">
                    {/* Time Badge */}
                    <div className={cn(
                        "h-11 min-w-[3rem] px-1 rounded-xl flex items-center justify-center text-xs font-bold font-mono border shadow-inner backdrop-blur-sm",
                        added
                            ? "bg-green-500/20 text-green-300 border-green-500/20"
                            : colors
                    )}>
                        {suggestion.time}
                    </div>

                    {/* Content */}
                    <div className="space-y-0.5 pt-0.5">
                        <h4 className={cn(
                            "text-sm font-semibold transition-colors",
                            added ? "text-green-300" : "text-white group-hover:text-primary"
                        )}>
                            {suggestion.title}
                        </h4>
                        <p className={cn(
                            "text-xs line-clamp-1",
                            added ? "text-green-400/70" : "text-muted-foreground"
                        )}>
                            {suggestion.description}
                        </p>
                    </div>
                </div>

                {/* Add Button */}
                <Button
                    size="sm"
                    variant="ghost"
                    disabled={added}
                    className={cn(
                        "h-8 w-8 p-0 rounded-full shrink-0 transition-all duration-500",
                        added
                            ? "bg-green-500 text-white hover:bg-green-500 hover:text-white"
                            : "hover:bg-primary hover:text-white bg-white/5 text-muted-foreground"
                    )}
                    onClick={handleAdd}
                >
                    <AnimatePresence mode="wait">
                        {added ? (
                            <motion.div
                                key="check"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                            >
                                <Check className="w-4 h-4" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="plus"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                            >
                                <Plus className="w-4 h-4" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Button>
            </div>

            {/* Success Flash Effect */}
            {added && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.2, 0] }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-green-500 rounded-2xl pointer-events-none"
                />
            )}
        </motion.div>
    );
}

export function ChatInterface() {
    const { messages, isGenerating, sendMessage, addToTimeline } = usePlannerStore();
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isGenerating]);

    const handleSend = () => {
        if (!input.trim()) return;
        sendMessage(input);
        setInput("");
    };

    const handleAddSuggestion = (suggestion: Suggestion) => {
        addToTimeline(suggestion);
        toast.success(`"${suggestion.title}" zum Plan hinzugefügt`);
    };

    return (
        <SpotlightCard className="h-full max-h-[calc(100vh-10rem)]" spotlightColor="rgba(124, 58, 237, 0.1)">
            <div className="flex flex-col h-full overflow-hidden relative">
                {/* Header */}
                <div className="p-4 border-b border-white/10 bg-black/20 backdrop-blur-sm flex items-center gap-3 z-10 shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white tracking-tight">AI Consultant</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Online & Bereit
                        </p>
                    </div>
                </div>

                {/* Messages Area */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                >
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-2">
                            <Bot className="w-12 h-12 mb-2" />
                            <p className="text-sm">Wie kann ich dir heute helfen?</p>
                        </div>
                    )}

                    <AnimatePresence initial={false}>
                        {messages.map((m) => (
                            <motion.div
                                key={m.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-3 ${m.role === 'ai' ? 'justify-start' : 'justify-end'}`}
                            >
                                {/* AI Avatar */}
                                {m.role === 'ai' && (
                                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-1">
                                        <Bot className="w-4 h-4 text-purple-300" />
                                    </div>
                                )}

                                <div className="flex flex-col gap-2 max-w-[85%]">
                                    <div className={cn(
                                        "p-4 shadow-sm backdrop-blur-md",
                                        m.role === 'ai'
                                            ? "bg-white/5 border border-white/10 rounded-2xl rounded-tl-none text-gray-200"
                                            : "bg-gradient-to-br from-primary to-purple-600 text-white rounded-2xl rounded-tr-none shadow-purple-500/20"
                                    )}>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                                    </div>

                                    {/* Suggestions */}
                                    {m.suggestions && m.suggestions.length > 0 && (
                                        <div className="grid gap-2.5 animate-in fade-in slide-in-from-top-2">
                                            {m.suggestions.map((suggestion) => (
                                                <SuggestionCard
                                                    key={suggestion.id}
                                                    suggestion={suggestion}
                                                    onAdd={handleAddSuggestion}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* User Avatar */}
                                {m.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mt-1">
                                        <User className="w-4 h-4 text-primary" />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Loading State */}
                    {isGenerating && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                <Bot className="w-4 h-4 text-purple-300" />
                            </div>
                            <div className="bg-white/5 px-4 py-3 rounded-2xl rounded-tl-none border border-white/10 flex items-center gap-1.5 w-fit">
                                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area (Static Bottom) */}
                <div className="p-4 bg-black/20 backdrop-blur-md border-t border-white/5 z-20 shrink-0">
                    <div className="relative group max-w-full mx-auto">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative flex items-center bg-[#0A0A0B] border border-white/10 rounded-xl shadow-2xl focus-within:border-primary/50 transition-all overflow-hidden">
                            <Input
                                placeholder="Frage den Consultant..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                className="bg-transparent border-none focus-visible:ring-0 h-14 pl-4 pr-14 text-sm text-white placeholder:text-white/30"
                                disabled={isGenerating}
                            />
                            <Button
                                onClick={handleSend}
                                disabled={isGenerating || !input.trim()}
                                size="icon"
                                className={cn(
                                    "absolute right-2 top-2 h-10 w-10 rounded-lg transition-all",
                                    input.trim() ? "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25" : "bg-white/5 text-white/30 hover:bg-white/10"
                                )}
                            >
                                <Send className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </SpotlightCard>
    );
}
