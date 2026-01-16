
"use client";

"use client";

import React, { useRef, useState } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { gsap } from "@/lib/gsap";
import { useGSAP } from "@gsap/react";

interface SpotlightCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    spotlightColor?: string;
}

export const SpotlightCard = ({
    children,
    className = "",
    spotlightColor = "rgba(120, 119, 198, 0.3)",
    ...props
}: SpotlightCardProps) => {
    const divRef = useRef<HTMLDivElement>(null);
    const spotlightRef = useRef<HTMLDivElement>(null);
    const [opacity, setOpacity] = useState(0);

    const xTo = useRef<gsap.QuickToFunc | null>(null);
    const yTo = useRef<gsap.QuickToFunc | null>(null);

    useGSAP(() => {
        if (!spotlightRef.current) return;
        // precise "velocity" feel using quickTo
        xTo.current = gsap.quickTo(spotlightRef.current, "x", { duration: 0.5, ease: "power3.out" });
        yTo.current = gsap.quickTo(spotlightRef.current, "y", { duration: 0.5, ease: "power3.out" });
    }, { scope: divRef });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current || !xTo.current || !yTo.current) return;

        const rect = divRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Fluid Spotlight Follow
        xTo.current(x);
        yTo.current(y);

        // Micro-Parallax / Subtle Lift (No aggressive Tilt)
        // Just a tiny suggestion of movement for "sensible" feedback
        gsap.to(divRef.current, {
            y: -2,
            scale: 1.005,
            duration: 0.4,
            ease: "power2.out",
            boxShadow: "0 20px 40px -10px rgba(0,0,0,0.3)"
        });
    };

    const handleFocus = () => setOpacity(1);
    const handleBlur = () => {
        setOpacity(0);
        gsap.to(divRef.current, { y: 0, scale: 1, boxShadow: "none", duration: 0.5, ease: "power2.out" });
    };
    const handleMouseEnter = () => setOpacity(1);
    const handleMouseLeave = () => {
        setOpacity(0);
        gsap.to(divRef.current, {
            y: 0,
            scale: 1,
            boxShadow: "none",
            duration: 0.5,
            ease: "power2.out"
        });
    };

    return (
        <motion.div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`relative overflow-hidden rounded-xl border border-white/10 bg-black/20 backdrop-blur-md ${className}`}
            {...props}
        >
            <div
                ref={spotlightRef}
                className="pointer-events-none absolute -top-[300px] -left-[300px] w-[600px] h-[600px] opacity-0 transition-opacity duration-500"
                style={{
                    opacity,
                    background: `radial-gradient(circle, ${spotlightColor}, transparent 70%)`,
                }}
            />
            <div className="relative h-full">{children}</div>
        </motion.div>
    );
};
