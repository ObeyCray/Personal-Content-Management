"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface OrbProps {
    id: string;
    x: number;
    y: number;
    r: number; // radius
    label: string;
    color?: string;
    tags: string[];
}

export function Orb({ r, label, color = "#8b5cf6", tags }: OrbProps) {
    // We use Framer Motion for the visual representation, but D3 controls the actual coordinates.
    // Ideally, we let D3 update the position state, or we use a ref. 
    // For smooth 60fps D3, we usually bind D3 directly to DOM or use SVG. 
    // Let's use absolute positioning with inline styles for performance.

    return (
        <motion.div
            className={cn(
                "rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing select-none",
                "backdrop-blur-md border border-white/10 shadow-[0_0_30px_rgba(139,92,246,0.3)]",
                "bg-black/20 hover:bg-black/40 transition-colors duration-200"
            )}
            style={{
                width: r * 2,
                height: r * 2,
                background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1), ${color}40)`,
                boxShadow: `inset 0 0 20px rgba(255,255,255,0.05), 0 0 20px ${color}20`
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <div className="text-center px-2 pointer-events-none">
                <span className="text-[10px] font-bold text-white/90 block leading-tight">{label}</span>
                {tags.length > 0 && <div className="flex gap-1 justify-center mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                </div>}
            </div>
        </motion.div>
    );
}
