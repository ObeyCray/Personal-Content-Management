"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Send, Sparkles, Wand2 } from "lucide-react";
import { useCreationStore } from "@/lib/creation";
import { cn } from "@/lib/utils";

interface CreationChatProps {
    compact?: boolean;
}

export function CreationChat({ compact = false }: CreationChatProps) {
    const { messages, isGenerating, sendMessage } = useCreationStore();
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isGenerating]);

    const handleSend = () => {
        if (!input.trim() || isGenerating) return;
        sendMessage(input);
        setInput("");
    };

    const quickPrompts = [
        "Hilf mir beim Brainstorming",
        "Prüfe meine Struktur",
        "Mach es ansprechender"
    ];

    return (
        <Card className={cn(
            "flex flex-col h-full overflow-hidden",
            compact ? "bg-transparent border-0 shadow-none" : "glass border-white/10"
        )}>
            {/* Header - only show if not compact */}
            {!compact && (
                <div className="p-4 border-b border-white/10 bg-black/20">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white">AI Content Assistent</h3>
                            <p className="text-xs text-white/50">Dein kreativer Partner</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Messages */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto space-y-4 p-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
            >
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                            <Wand2 className="w-8 h-8 text-purple-400" />
                        </div>
                        <h4 className="text-sm font-semibold text-white mb-2">Lass uns etwas Großartiges erstellen</h4>
                        <p className="text-xs text-white/50 mb-4">
                            Ich helfe dir beim Brainstorming, Strukturieren und Schreiben deines Contents.
                        </p>
                        <div className="space-y-2 w-full">
                            {quickPrompts.map((prompt, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setInput(prompt);
                                        sendMessage(prompt);
                                    }}
                                    className="w-full text-xs px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-white/70 hover:text-white"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((m) => (
                    <div key={m.id} className={`flex flex-col ${m.role === 'ai' ? 'items-start' : 'items-end'}`}>
                        <div className={cn(
                            "max-w-[90%] p-3 rounded-xl shadow-sm",
                            m.role === 'ai'
                                ? "bg-white/5 border border-white/10 rounded-tl-none"
                                : "bg-primary text-primary-foreground rounded-tr-none"
                        )}>
                            {m.role === 'ai' && (
                                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-purple-300">
                                    <Sparkles className="w-3 h-3" />
                                    AI Assistant
                                </div>
                            )}
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                        </div>
                    </div>
                ))}

                {isGenerating && (
                    <div className="flex items-start">
                        <div className="bg-white/5 px-4 py-2 rounded-xl rounded-tl-none border border-white/10 flex items-center gap-2">
                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-4 bg-black/20 backdrop-blur-md border-t border-white/5">
                <div className="flex gap-2 relative">
                    <Input
                        placeholder="Frag mich etwas..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        className="bg-white/5 border-white/10 focus-visible:ring-primary/50 pr-12 h-10 text-sm"
                        disabled={isGenerating}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={isGenerating || !input.trim()}
                        size="icon"
                        className="absolute right-1 top-1 h-8 w-8 bg-primary/90 hover:bg-primary"
                    >
                        <Send className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>
        </Card>
    );
}
