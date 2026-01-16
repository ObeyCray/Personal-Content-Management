"use client";

interface MaterialIconProps {
    icon: string;
    className?: string;
    filled?: boolean;
    size?: number;
}

export function MaterialIcon({ icon, className = "", filled = false, size }: MaterialIconProps) {
    const sizeClass = size ? `text-[${size}px]` : "";

    return (
        <span
            className={`material-symbols-outlined ${filled ? 'material-symbols-filled' : ''} ${sizeClass} ${className}`}
            style={size ? { fontSize: `${size}px` } : undefined}
        >
            {icon}
        </span>
    );
}
