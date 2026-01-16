"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { usePlannerStore } from "@/lib/planner";
import { motion, AnimatePresence } from "framer-motion";

type ViewMode = "month" | "week" | "day";

interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    time?: string;
    color?: string;
}

export function CalendarView() {
    const { selectedDate: storedDate, setSelectedDate: setStoredSelectedDate } = usePlannerStore();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>("month");
    const [localSelectedDate, setLocalSelectedDate] = useState(storedDate);

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const monthNames = [
        "Januar", "Februar", "März", "April", "Mai", "Juni",
        "Juli", "August", "September", "Oktober", "November", "Dezember"
    ];

    const dayNames = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
    const dayNamesShort = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setLocalSelectedDate(today);
        setStoredSelectedDate(today);
    };

    const isToday = (day: number) => {
        const today = new Date();
        return (
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear()
        );
    };

    const isSelected = (day: number) => {
        return (
            day === localSelectedDate.getDate() &&
            currentMonth === localSelectedDate.getMonth() &&
            currentYear === localSelectedDate.getFullYear()
        );
    };

    const handleDateClick = (day: number) => {
        const newDate = new Date(currentYear, currentMonth, day);
        setLocalSelectedDate(newDate);
        setStoredSelectedDate(newDate);
    };

    // Generate calendar grid
    const generateCalendarGrid = () => {
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        const daysInPreviousMonth = new Date(currentYear, currentMonth, 0).getDate();

        const calendarDays = [];

        // Previous month days
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            const day = daysInPreviousMonth - i;
            calendarDays.push({
                day,
                isCurrentMonth: false,
                isToday: false,
                isSelected: false,
            });
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            calendarDays.push({
                day,
                isCurrentMonth: true,
                isToday: isToday(day),
                isSelected: isSelected(day),
            });
        }

        // Next month days to fill the grid
        const remainingDays = 42 - calendarDays.length; // 6 weeks * 7 days
        for (let day = 1; day <= remainingDays; day++) {
            calendarDays.push({
                day,
                isCurrentMonth: false,
                isToday: false,
                isSelected: false,
            });
        }

        return calendarDays;
    };

    const calendarDays = generateCalendarGrid();

    return (
        <div className="h-full max-h-[calc(100vh-10rem)] flex flex-col rounded-2xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 backdrop-blur-xl p-8 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-xl">
                        <CalendarIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            {monthNames[currentMonth]} {currentYear}
                        </h2>
                        <p className="text-sm text-gray-400">
                            {dayNames[localSelectedDate.getDay()]}, {localSelectedDate.getDate()}. {monthNames[localSelectedDate.getMonth()]}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={goToToday}
                        className="px-4 py-2 text-sm font-medium text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10"
                    >
                        Heute
                    </button>
                    <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
                        <button
                            onClick={goToPreviousMonth}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            aria-label="Vorheriger Monat"
                        >
                            <ChevronLeft className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                            onClick={goToNextMonth}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            aria-label="Nächster Monat"
                        >
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                </div>
            </div>

            {/* View Mode Selector (for future) */}
            {/* <div className="flex gap-2 mb-4">
                {(["month", "week", "day"] as ViewMode[]).map((mode) => (
                    <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                            viewMode === mode
                                ? "bg-primary/20 text-primary border border-primary/30"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                    >
                        {mode === "month" ? "Monat" : mode === "week" ? "Woche" : "Tag"}
                    </button>
                ))}
            </div> */}

            {/* Calendar Grid */}
            <div className="flex-1 flex flex-col min-h-0">
                {/* Day names header */}
                <div className="grid grid-cols-7 gap-3 mb-4">
                    {dayNamesShort.map((day, index) => (
                        <div
                            key={day}
                            className={`text-center text-sm font-semibold ${index === 0 || index === 6 ? "text-primary/70" : "text-gray-400"
                                }`}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-3 flex-1">
                    <AnimatePresence mode="wait">
                        {calendarDays.map((dayInfo, index) => (
                            <motion.button
                                key={`${currentMonth}-${index}`}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2, delay: index * 0.01 }}
                                onClick={() => dayInfo.isCurrentMonth && handleDateClick(dayInfo.day)}
                                disabled={!dayInfo.isCurrentMonth}
                                className={`
                                    aspect-square rounded-xl flex flex-col items-center justify-center
                                    transition-all relative group
                                    ${!dayInfo.isCurrentMonth
                                        ? "text-gray-600 cursor-default"
                                        : dayInfo.isToday
                                            ? "bg-primary/30 text-primary ring-2 ring-primary/50 font-bold"
                                            : dayInfo.isSelected
                                                ? "bg-primary/20 text-white ring-1 ring-primary/30"
                                                : "text-gray-300 hover:bg-white/10 hover:text-white hover:scale-105"
                                    }
                                `}
                            >
                                <span className="text-base font-medium">{dayInfo.day}</span>

                                {/* Event indicator (placeholder) */}
                                {dayInfo.isCurrentMonth && dayInfo.day % 7 === 0 && (
                                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                                        <div className="w-1 h-1 rounded-full bg-primary/60" />
                                    </div>
                                )}

                                {/* Hover effect */}
                                {dayInfo.isCurrentMonth && (
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/0 to-purple-500/0 group-hover:from-primary/10 group-hover:to-purple-500/10 transition-all pointer-events-none" />
                                )}
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Selected Date Info */}
            <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-400">Ausgewähltes Datum</p>
                        <p className="text-white font-medium">
                            {dayNames[localSelectedDate.getDay()]}, {localSelectedDate.getDate()}. {monthNames[localSelectedDate.getMonth()]} {localSelectedDate.getFullYear()}
                        </p>
                    </div>
                    <div className="text-sm text-gray-500">
                        Keine Events
                    </div>
                </div>
            </div>
        </div>
    );
}
