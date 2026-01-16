"use client";

import { usePlannerStore } from "@/lib/planner";
import { Trash2, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations";

export function TimelineView() {
    const { timeline, removeFromTimeline, selectedDate } = usePlannerStore();

    // Format selected date to YYYY-MM-DD for comparison
    const selectedDateStr = selectedDate.toISOString().split('T')[0];

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
            <motion.div variants={fadeIn} className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gradient flex items-center gap-2">
                        Tagesplan
                    </h3>
                    <span className="text-xs font-medium text-muted-foreground bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                        {filteredTimeline.length} Einträge
                    </span>
                </div>
                <p className="text-sm text-gray-400">{formatDate(selectedDate)}</p>
            </motion.div>

            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="relative border-l border-white/10 ml-3 space-y-6 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10"
            >
                {filteredTimeline.length === 0 && (
                    <motion.div variants={fadeIn} className="ml-8 mt-10 p-6 rounded-2xl border border-dashed border-white/10 bg-white/5 text-center">
                        <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="text-muted-foreground text-sm font-medium">Keine Einträge für diesen Tag.</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                            Bitte die KI, Aufgaben für {formatDate(selectedDate)} zu planen.
                        </p>
                    </motion.div>
                )}

                <AnimatePresence mode="popLayout">
                    {filteredTimeline.map((item) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="ml-6 relative group"
                        >
                            <div className={`absolute -left-[31px] top-4 w-4 h-4 rounded-full border-2 border-background z-10 shadow-[0_0_10px_rgba(0,0,0,0.5)] ${item.type === 'work' ? 'bg-blue-500 shadow-blue-500/20' :
                                item.type === 'creative' ? 'bg-purple-500 shadow-purple-500/20' :
                                    'bg-emerald-500 shadow-emerald-500/20'
                                }`} />

                            <div className="glass p-4 rounded-xl hover:bg-white/5 transition-all cursor-pointer border border-white/5 hover:border-primary/20 flex justify-between items-start group-hover:scale-[1.01] duration-300">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {item.time}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider border border-white/10 px-1.5 rounded-full">{item.type}</span>
                                    </div>
                                    <h4 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                                        {item.title}
                                    </h4>
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="opacity-0 group-hover:opacity-100 h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all rounded-full"
                                    onClick={() => removeFromTimeline(item.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

            </motion.div>
        </SpotlightCard>
    );
}
