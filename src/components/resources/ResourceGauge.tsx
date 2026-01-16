import { cn } from "@/lib/utils";

interface ResourceGaugeProps {
    label: string;
    value: number; // 0-100
    color?: string; // hex or tailwind class text-color
    limit?: string;
}

export function ResourceGauge({ label, value, color = "#7000FF", limit }: ResourceGaugeProps) {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="flex flex-col items-center glass p-6 rounded-2xl relative overflow-hidden group">
            <div className="relative w-32 h-32 mb-4">
                {/* Background Circle */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="64"
                        cy="64"
                        r={radius}
                        fill="transparent"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="8"
                    />
                    {/* Progress Circle */}
                    <circle
                        cx="64"
                        cy="64"
                        r={radius}
                        fill="transparent"
                        stroke={color}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-2xl font-bold">{value}%</span>
                    {limit && <span className="text-xs text-muted-foreground">/ {limit}</span>}
                </div>
            </div>

            <h4 className="font-medium text-lg">{label}</h4>

            {/* Decorative glow */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle at center, ${color}, transparent 70%)` }}
            />
        </div>
    );
}
