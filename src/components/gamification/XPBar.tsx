"use client";

import { useGameStore } from "@/lib/gamification";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function XPBar({ className }: { className?: string }) {
    const { xp, level, nextLevelXp } = useGameStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const max = nextLevelXp();
    const percentage = Math.min(100, Math.max(0, (xp / max) * 100));

    return (
        <div className={cn("glass p-4 rounded-2xl flex items-center gap-4", className)}>
            <div className="relative w-12 h-12 flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow-lg rotate-3 group hover:rotate-6 transition-transform">
                <span className="text-xl font-bold text-white drop-shadow-md">
                    {level}
                </span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            </div>

            <div className="flex-1">
                <div className="flex justify-between text-xs mb-1 font-medium text-muted-foreground uppercase tracking-wider">
                    <span>Level Progress</span>
                    <span>{Math.floor(xp)} / {max} XP</span>
                </div>
                <div className="h-3 bg-secondary/50 rounded-full overflow-hidden border border-white/5">
                    <div
                        className="h-full bg-gradient-to-r from-primary via-purple-400 to-pink-500 transition-all duration-1000 ease-out relative"
                        style={{ width: `${percentage}%` }}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                    </div>
                </div>
            </div>
        </div>
    );
}
