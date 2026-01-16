"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Send, Sparkles, Plus, Clock, Info } from "lucide-react";
import { usePlannerStore, Suggestion } from "@/lib/planner";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ChatInterface() {
    const { messages, isGenerating, sendMessage, addToTimeline } = usePlannerStore();
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

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
        toast.success(`Added "${suggestion.title}" to your schedule`);
    };

    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-10rem)]">
            <Card className="flex-1 flex flex-col overflow-hidden relative glass border-white/10">
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto space-y-6 p-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                >
                    {messages.map((m) => (
                        <div key={m.id} className={`flex flex-col ${m.role === 'ai' ? 'items-start' : 'items-end'}`}>
                            <div className={cn(
                                "max-w-[85%] p-4 rounded-2xl shadow-sm",
                                m.role === 'ai'
                                    ? "bg-white/5 border border-white/10 rounded-tl-none"
                                    : "bg-primary text-primary-foreground rounded-tr-none"
                            )}>
                                {m.role === 'ai' && (
                                    <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-purple-300">
                                        <Sparkles className="w-3 h-3" />
                                        AI Consultant
                                    </div>
                                )}
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                            </div>

                            {/* Suggestions Rail (In-Chat) */}
                            {m.suggestions && m.suggestions.length > 0 && (
                                <div className="mt-3 grid grid-cols-1 gap-2 w-full max-w-[85%] animate-in fade-in slide-in-from-top-2">
                                    {m.suggestions.map((suggestion) => (
                                        <div
                                            key={suggestion.id}
                                            className="group relative flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-white/5 hover:border-primary/30 hover:bg-secondary/50 transition-all cursor-default"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold font-mono",
                                                    suggestion.type === 'creative' ? 'bg-purple-500/20 text-purple-300' :
                                                        suggestion.type === 'work' ? 'bg-blue-500/20 text-blue-300' :
                                                            'bg-gray-500/20 text-gray-300'
                                                )}>
                                                    {suggestion.time}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium">{suggestion.title}</h4>
                                                    <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                                                </div>
                                            </div>

                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="hover:bg-primary hover:text-primary-foreground"
                                                onClick={() => handleAddSuggestion(suggestion)}
                                            >
                                                <Plus className="w-4 h-4 mr-1" />
                                                Add
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {isGenerating && (
                        <div className="flex items-start">
                            <div className="bg-white/5 px-4 py-2 rounded-2xl rounded-tl-none border border-white/10 flex items-center gap-2">
                                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-black/20 backdrop-blur-md border-t border-white/5">
                    <div className="flex gap-2 relative">
                        <Input
                            placeholder="Type a request (e.g., 'Plan a video block')..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            className="bg-white/5 border-white/10 focus-visible:ring-primary/50 pr-12 h-11"
                            disabled={isGenerating}
                        />
                        <Button
                            onClick={handleSend}
                            disabled={isGenerating || !input.trim()}
                            size="icon"
                            className="absolute right-1 top-1 h-9 w-9 bg-primary/90 hover:bg-primary"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
