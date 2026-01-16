"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function CalendarWidget() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const monthNames = [
        "Januar", "Februar", "März", "April", "Mai", "Juni",
        "Juli", "August", "September", "Oktober", "November", "Dezember"
    ];

    const dayNames = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
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
            day === selectedDate.getDate() &&
            currentMonth === selectedDate.getMonth() &&
            currentYear === selectedDate.getFullYear()
        );
    };

    const handleDateClick = (day: number) => {
        setSelectedDate(new Date(currentYear, currentMonth, day));
    };

    // Generate calendar days
    const calendarDays = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(
            <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={`
                    aspect-square rounded-lg text-xs font-medium transition-all
                    ${isToday(day)
                        ? 'bg-primary/30 text-primary ring-1 ring-primary/50'
                        : isSelected(day)
                            ? 'bg-primary/20 text-white'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }
                `}
            >
                {day}
            </button>
        );
    }

    return (
        <div className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm">
            {/* Header with month navigation */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={goToPreviousMonth}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                    aria-label="Vorheriger Monat"
                >
                    <ChevronLeft className="w-4 h-4 text-gray-400" />
                </button>
                <h3 className="text-sm font-semibold text-white">
                    {monthNames[currentMonth]} {currentYear}
                </h3>
                <button
                    onClick={goToNextMonth}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                    aria-label="Nächster Monat"
                >
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                    <div
                        key={day}
                        className="text-[10px] font-medium text-gray-500 text-center"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
                {calendarDays}
            </div>
        </div>
    );
}
