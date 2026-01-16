"use client";

import { useUIStore } from "@/lib/ui-store";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function MainContent({ children }: { children: React.ReactNode }) {
    const { isSidebarCollapsed } = useUIStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <main className="flex-1 min-h-screen relative z-10">
            {children}
        </main>
    );
}
