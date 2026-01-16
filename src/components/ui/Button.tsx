import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost" | "glass";
    size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        const buttonRef = React.useRef<HTMLButtonElement>(null);
        // Clean implementation of magnetic effect
        const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
            const btn = e.currentTarget;
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // GSAP for smooth magnetic pull
            // We use standard animate here for simplicity inside the component
            // For "flow", we move the button slightly towards the mouse
            btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        };

        const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.transform = "translate(0px, 0px)";
        };

        return (
            <button
                // Merge refs
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                    variant === "default" && "bg-primary text-primary-foreground shadow hover:bg-primary/90 hover:scale-[1.05] active:scale-95",
                    variant === "outline" && "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
                    variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",
                    variant === "glass" && "glass hover:bg-white/10 text-foreground",
                    size === "default" && "h-9 px-4 py-2",
                    size === "sm" && "h-8 rounded-md px-3 text-xs",
                    size === "lg" && "h-10 rounded-md px-8",
                    size === "icon" && "h-9 w-9",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
