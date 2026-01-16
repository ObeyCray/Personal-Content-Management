"use client";

import { useState, useEffect } from "react";
import { Search, Filter, SortAsc, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import type { Project } from "@/lib/projects";

interface FilterBarProps {
    onSearchChange: (value: string) => void;
    onStatusFilter: (status: string) => void;
    onSortChange: (sort: string) => void;
    activeFilters: {
        search: string;
        status: string;
        sort: string;
    };
}

const STATUS_FILTERS = [
    { value: "all", label: "Alle Status" },
    { value: "active", label: "Aktiv" },
    { value: "planning", label: "Planung" },
    { value: "on-hold", label: "Pausiert" },
    { value: "completed", label: "Abgeschlossen" },
];

const SORT_OPTIONS = [
    { value: "date-desc", label: "Neueste zuerst" },
    { value: "date-asc", label: "Älteste zuerst" },
    { value: "progress-desc", label: "Höchster Fortschritt" },
    { value: "progress-asc", label: "Niedrigster Fortschritt" },
    { value: "title-asc", label: "A - Z" },
    { value: "title-desc", label: "Z - A" },
];

export function FilterBar({ onSearchChange, onStatusFilter, onSortChange, activeFilters }: FilterBarProps) {
    const [searchValue, setSearchValue] = useState(activeFilters.search);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearchChange(searchValue);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchValue, onSearchChange]);

    const hasActiveFilters = activeFilters.status !== "all" || activeFilters.search !== "";

    const resetFilters = () => {
        setSearchValue("");
        onSearchChange("");
        onStatusFilter("all");
        onSortChange("date-desc");
    };

    const selectedStatusLabel = STATUS_FILTERS.find(s => s.value === activeFilters.status)?.label || "Alle Status";
    const selectedSortLabel = SORT_OPTIONS.find(s => s.value === activeFilters.sort)?.label || "Neueste zuerst";

    return (
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Search */}
            <div className="relative flex-1 w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Projekte durchsuchen..."
                    className="pl-10 pr-10"
                />
                {searchValue && (
                    <button
                        onClick={() => setSearchValue("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-colors"
                    >
                        <X className="w-3 h-3" />
                    </button>
                )}
            </div>

            {/* Status Filter */}
            <div className="relative">
                <button
                    onClick={() => {
                        setShowStatusDropdown(!showStatusDropdown);
                        setShowSortDropdown(false);
                    }}
                    className={`
                        px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm
                        hover:bg-white/10 transition-colors flex items-center gap-2 min-w-[160px]
                        ${activeFilters.status !== "all" ? "border-primary/50 bg-primary/10" : ""}
                    `}
                >
                    <Filter className="w-4 h-4" />
                    <span className="flex-1 text-left">{selectedStatusLabel}</span>
                </button>
                {showStatusDropdown && (
                    <div className="absolute top-full mt-2 w-full bg-gray-900 border border-white/10 rounded-lg overflow-hidden z-10 shadow-xl">
                        {STATUS_FILTERS.map((status) => (
                            <button
                                key={status.value}
                                onClick={() => {
                                    onStatusFilter(status.value);
                                    setShowStatusDropdown(false);
                                }}
                                className={`
                                    w-full px-4 py-2.5 text-sm text-left hover:bg-white/10 transition-colors
                                    ${activeFilters.status === status.value ? "bg-primary/20 text-primary" : ""}
                                `}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Sort */}
            <div className="relative">
                <button
                    onClick={() => {
                        setShowSortDropdown(!showSortDropdown);
                        setShowStatusDropdown(false);
                    }}
                    className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors flex items-center gap-2 min-w-[180px]"
                >
                    <SortAsc className="w-4 h-4" />
                    <span className="flex-1 text-left">{selectedSortLabel}</span>
                </button>
                {showSortDropdown && (
                    <div className="absolute top-full mt-2 w-full bg-gray-900 border border-white/10 rounded-lg overflow-hidden z-10 shadow-xl">
                        {SORT_OPTIONS.map((sort) => (
                            <button
                                key={sort.value}
                                onClick={() => {
                                    onSortChange(sort.value);
                                    setShowSortDropdown(false);
                                }}
                                className={`
                                    w-full px-4 py-2.5 text-sm text-left hover:bg-white/10 transition-colors
                                    ${activeFilters.sort === sort.value ? "bg-primary/20 text-primary" : ""}
                                `}
                            >
                                {sort.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
                <button
                    onClick={resetFilters}
                    className="px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/20"
                >
                    Filter zurücksetzen
                </button>
            )}
        </div>
    );
}
