"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { X, Smile, Palette } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Project } from "@/lib/projects";

interface ProjectFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (project: Omit<Project, "id" | "createdAt" | "progress">) => void;
    initialData?: Project;
    mode?: "create" | "edit";
}

const ICON_OPTIONS = [
    "tv", "language", "palette", "computer", "phone_android", "rocket_launch",
    "bolt", "flag", "local_fire_department", "lightbulb", "sports_esports",
    "menu_book", "music_note", "directions_run", "star", "fitness_center",
    "videocam", "brush", "code", "campaign", "shopping_cart", "article"
];

const COLOR_OPTIONS = [
    { name: "Red-Orange", value: "from-red-500 to-orange-500" },
    { name: "Purple-Indigo", value: "from-purple-500 to-indigo-500" },
    { name: "Blue-Cyan", value: "from-blue-500 to-cyan-500" },
    { name: "Green-Emerald", value: "from-green-500 to-emerald-500" },
    { name: "Pink-Purple", value: "from-pink-500 to-purple-500" },
    { name: "Yellow-Orange", value: "from-yellow-500 to-orange-500" },
    { name: "Teal-Blue", value: "from-teal-500 to-blue-500" },
    { name: "Rose-Pink", value: "from-rose-500 to-pink-500" },
];

const STATUS_OPTIONS: Array<{ value: Project["status"]; label: string }> = [
    { value: "planning", label: "Planung" },
    { value: "active", label: "Aktiv" },
    { value: "on-hold", label: "Pausiert" },
    { value: "completed", label: "Abgeschlossen" },
];

export function ProjectFormDialog({ open, onClose, onSubmit, initialData, mode = "create" }: ProjectFormDialogProps) {
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        description: initialData?.description || "",
        status: initialData?.status || "planning" as Project["status"],
        deadline: initialData?.deadline || "",
        icon: initialData?.icon || "tv",
        color: initialData?.color || "from-purple-500 to-indigo-500",
    });

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const dialogRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (open && contentRef.current) {
            gsap.from(contentRef.current, {
                scale: 0.9,
                opacity: 0,
                duration: 0.3,
                ease: "power2.out"
            });
        }
    }, { dependencies: [open], scope: dialogRef });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        handleClose();
    };

    const handleClose = () => {
        if (contentRef.current) {
            gsap.to(contentRef.current, {
                scale: 0.9,
                opacity: 0,
                duration: 0.2,
                ease: "power2.in",
                onComplete: onClose
            });
        } else {
            onClose();
        }
    };

    if (!open) return null;

    return (
        <div
            ref={dialogRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
        >
            <div
                ref={contentRef}
                className="relative w-full max-w-2xl bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-2xl font-bold text-gradient">
                        {mode === "create" ? "Neues Projekt erstellen" : "Projekt bearbeiten"}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Icon and Color Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Icon Selector */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Icon</label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-between"
                                >
                                    <MaterialIcon icon={formData.icon} size={24} />
                                    <Smile className="w-4 h-4 text-muted-foreground" />
                                </button>
                                {showEmojiPicker && (
                                    <div className="absolute top-full mt-2 w-full bg-gray-900 border border-white/10 rounded-lg p-3 grid grid-cols-8 gap-2 z-10 shadow-xl max-h-64 overflow-y-auto">
                                        {ICON_OPTIONS.map((iconName) => (
                                            <button
                                                key={iconName}
                                                type="button"
                                                onClick={() => {
                                                    setFormData({ ...formData, icon: iconName });
                                                    setShowEmojiPicker(false);
                                                }}
                                                className="hover:bg-white/10 p-2 rounded transition-colors flex items-center justify-center"
                                                title={iconName}
                                            >
                                                <MaterialIcon icon={iconName} size={24} />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Color Selector */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Farbe</label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowColorPicker(!showColorPicker)}
                                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-between"
                                >
                                    <div className={`h-6 w-20 bg-gradient-to-r ${formData.color} rounded`} />
                                    <Palette className="w-4 h-4 text-muted-foreground" />
                                </button>
                                {showColorPicker && (
                                    <div className="absolute top-full mt-2 w-full bg-gray-900 border border-white/10 rounded-lg p-3 space-y-2 z-10 shadow-xl">
                                        {COLOR_OPTIONS.map((color) => (
                                            <button
                                                key={color.value}
                                                type="button"
                                                onClick={() => {
                                                    setFormData({ ...formData, color: color.value });
                                                    setShowColorPicker(false);
                                                }}
                                                className="w-full flex items-center gap-3 p-2 hover:bg-white/10 rounded transition-colors"
                                            >
                                                <div className={`h-6 w-6 bg-gradient-to-r ${color.value} rounded`} />
                                                <span className="text-sm">{color.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Titel *</label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="z.B. YouTube Channel Launch"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Beschreibung</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Kurze Beschreibung des Projekts..."
                            rows={3}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                        />
                    </div>

                    {/* Status and Deadline */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as Project["status"] })}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            >
                                {STATUS_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Deadline */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Deadline (optional)</label>
                            <Input
                                type="date"
                                value={formData.deadline}
                                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleClose}
                            className="flex-1"
                        >
                            Abbrechen
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={!formData.title.trim()}
                        >
                            {mode === "create" ? "Projekt erstellen" : "Änderungen speichern"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
