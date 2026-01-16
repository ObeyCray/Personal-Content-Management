"use client";

import { usePlannerStore } from "@/lib/planner";
import { Trash2, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations";
import { AddTimelineDialog } from "./AddTimelineDialog";
import { TaskScheduler } from "./TaskScheduler";
import { toLocalDateString } from "@/lib/utils";

export function TimelineView() {
    const { timeline, removeFromTimeline, selectedDate: storedDate } = usePlannerStore();

    // Ensure storedDate is a Date object (handles localStorage deserialization)
    const selectedDate = storedDate instanceof Date ? storedDate : new Date(storedDate);

    // Format selected date to YYYY-MM-DD for comparison
    const selectedDateStr = toLocalDateString(selectedDate);

    // Filter timeline items for the selected date
    const filteredTimeline = timeline.filter(item => {
        if (!item.date) return true; // Show items without date
        return item.date === selectedDateStr;
    });

    // Format the selected date for display
    const formatDate = (date: Date) => {
        const days = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
        const months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
        return `${days[date.getDay()]}, ${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    return (
        <SpotlightCard className="h-full max-h-[calc(100vh-10rem)] p-6 flex flex-col" spotlightColor="rgba(255, 255, 255, 0.05)">
            <motion.div variants={fadeIn} className="mb-6 space-y-4">
                {/* Title and Counter */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-gradient mb-1">
                            Tagesplan
                        </h3>
                        <p className="text-sm text-gray-400">{formatDate(selectedDate)}</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs font-semibold text-primary">
                            {filteredTimeline.length} {filteredTimeline.length === 1 ? 'Eintrag' : 'Einträge'}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    <AddTimelineDialog selectedDate={selectedDate} />
                    <TaskScheduler selectedDate={selectedDate} />
                </div>
            </motion.div>

            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="relative border-l border-white/10 ml-3 space-y-6 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10"
            >
                {filteredTimeline.length === 0 && (
                    <motion.div
                        variants={fadeIn}
                        className="ml-8 mt-16 p-8 rounded-2xl border border-dashed border-white/20 bg-gradient-to-br from-white/5 to-white/[0.02] text-center backdrop-blur-sm"
                    >
                        <div className="inline-flex p-4 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
                            <Calendar className="w-8 h-8 text-primary" />
                        </div>
                        <h4 className="text-white text-lg font-semibold mb-2">Noch nichts geplant</h4>
                        <p className="text-muted-foreground text-sm mb-4 max-w-[280px] mx-auto">
                            Füge einen neuen Eintrag hinzu oder ordne bestehende Tasks diesem Tag zu.
                        </p>
                        <div className="flex flex-col gap-2 items-center">
                            <AddTimelineDialog selectedDate={selectedDate} />
                            <TaskScheduler selectedDate={selectedDate} />
                        </div>
                    </motion.div>
                )}

                <AnimatePresence mode="popLayout">
                    {filteredTimeline.map((item) => {
                        const typeColors = {
                            work: { bg: 'bg-blue-500', text: 'text-blue-300', ring: 'ring-blue-500/20', label: 'Arbeit' },
                            creative: { bg: 'bg-purple-500', text: 'text-purple-300', ring: 'ring-purple-500/20', label: 'Kreativ' },
                            admin: { bg: 'bg-gray-500', text: 'text-gray-300', ring: 'ring-gray-500/20', label: 'Admin' },
                            meeting: { bg: 'bg-green-500', text: 'text-green-300', ring: 'ring-green-500/20', label: 'Meeting' },
                            break: { bg: 'bg-orange-500', text: 'text-orange-300', ring: 'ring-orange-500/20', label: 'Pause' },
                        };
                        const colors = typeColors[item.type] || typeColors.work;

                        return (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="ml-6 relative group"
                            >
                                {/* Timeline dot */}
                                <div className={`absolute -left-[31px] top-5 w-3 h-3 rounded-full border-2 border-background z-10 ${colors.bg} shadow-lg ${colors.ring} ring-2`} />

                                <div className="p-4 rounded-xl hover:bg-white/5 transition-all border border-white/10 hover:border-primary/30 flex justify-between items-start group-hover:scale-[1.01] duration-300 bg-gradient-to-br from-white/[0.03] to-transparent">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`text-xs font-mono font-bold px-2 py-1 rounded-lg flex items-center gap-1.5 ${colors.bg}/20 ${colors.text} border border-current/20`}>
                                                <Clock className="w-3.5 h-3.5" />
                                                {item.time}
                                            </span>
                                            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full ${colors.text} ${colors.bg}/10 border border-current/30`}>
                                                {colors.label}
                                            </span>
                                        </div>
                                        <h4 className="font-semibold text-base text-white group-hover:text-primary transition-colors">
                                            {item.title}
                                        </h4>
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="opacity-0 group-hover:opacity-100 h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all rounded-lg shrink-0"
                                        onClick={() => removeFromTimeline(item.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

            </motion.div>
        </SpotlightCard>
    );
}
