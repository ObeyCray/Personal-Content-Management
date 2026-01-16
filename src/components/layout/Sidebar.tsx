"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderKanban, Calendar, Sparkles, User } from "lucide-react";
import { useGameStore } from "@/lib/gamification";
import { CalendarWidget } from "@/components/planner/CalendarWidget";

const navItems = [
    { icon: Home, label: "Dashboard", href: "/" },
    { icon: FolderKanban, label: "Projekte", href: "/projects" },
    { icon: Calendar, label: "Planner", href: "/planner" },
    { icon: Sparkles, label: "Creation", href: "/creation" },
    { icon: User, label: "Profil", href: "/profile" },
];

export function Sidebar() {
    const pathname = usePathname();
    const { xp, level } = useGameStore();

    return (
        <div className="w-60 h-screen bg-[#0a0a0f] border-r border-white/10 flex flex-col p-5 sticky top-0">
            {/* Logo / Brand */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gradient">AI CMS</h1>
                <p className="text-xs text-gray-400 mt-1">Mission Control</p>
            </div>

            {/* XP Display */}
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">Level {level}</span>
                    <span className="text-xs text-gray-400">{xp} XP</span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500"
                        style={{ width: `${(xp % 1000) / 10}%` }}
                    />
                </div>
            </div>

            {/* Calendar Widget */}
            <div className="mb-6">
                <CalendarWidget />
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                                flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                                ${isActive
                                    ? 'bg-primary/20 text-primary'
                                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                                }
                            `}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="pt-4 border-t border-white/5 text-xs text-gray-500">
                <p>Powered by Groq AI</p>
            </div>
        </div>
    );
}
