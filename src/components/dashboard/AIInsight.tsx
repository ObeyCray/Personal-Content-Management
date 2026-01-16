"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Sparkles, Sun } from "lucide-react";

export function AIInsight() {
    return (
        <Card className="col-span-full md:col-span-2 lg:col-span-2 border-primary/20 bg-gradient-to-br from-primary/10 to-transparent relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-colors duration-700" />

            <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                    AI Daily Briefing
                </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-4">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0 border border-orange-500/30">
                        <Sun className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-1">Guten Morgen, Creator!</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Dein Fokus liegt heute auf <span className="text-primary font-semibold">Video-Produktion</span>.
                            Deine Energie-Kurve peakt um 14:00 Uhr – perfekt für den Dreh.
                            Vergiss nicht, dein Skript vorher zu finalisieren.
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-muted-foreground">
                        🎯 Top Prio: YouTube Skript
                    </div>
                    <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-muted-foreground">
                        ⚡ Energie: 85%
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
