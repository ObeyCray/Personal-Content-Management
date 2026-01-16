"use client";

import { ChatInterface } from "@/components/planner/ChatInterface";
import { TimelineView } from "@/components/planner/TimelineView";
import { CalendarView } from "@/components/planner/CalendarView";
import { motion } from "framer-motion";
import { staggerContainer, fadeIn, scaleUp } from "@/lib/animations";

export default function PlannerPage() {
    return (
        <motion.div
            className="flex-1 px-8 py-6 flex flex-col"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
        >
            {/* Shadow from sidebar */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/20 via-black/5 to-transparent pointer-events-none" />

            <motion.h2 variants={fadeIn} className="text-3xl font-bold tracking-tight text-gradient mb-8">AI Planner</motion.h2>

            <motion.div variants={staggerContainer} className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-h-[calc(100vh-10rem)]">
                <motion.div variants={scaleUp} className="lg:col-span-1">
                    <ChatInterface />
                </motion.div>
                <motion.div variants={scaleUp} className="lg:col-span-2">
                    <CalendarView />
                </motion.div>
                <motion.div variants={scaleUp} className="lg:col-span-1">
                    <TimelineView />
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
