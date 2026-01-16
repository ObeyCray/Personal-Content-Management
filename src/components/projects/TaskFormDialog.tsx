"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { X, Trophy } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Task } from "@/lib/tasks";

interface TaskFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (task: Omit<Task, "id" | "status">) => void;
    initialData?: Task;
    mode?: "create" | "edit";
    projectId: string;
}

export function TaskFormDialog({ open, onClose, onSubmit, initialData, mode = "create", projectId }: TaskFormDialogProps) {
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        time: initialData?.time || "Heute",
        xp: initialData?.xp || 100,
        isMilestone: initialData?.isMilestone || false,
        projectId: initialData?.projectId || projectId,
    });

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
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
        >
            <div
                ref={contentRef}
                className="relative w-full max-w-lg bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-2xl font-bold text-gradient">
                        {mode === "create" ? "Neue Task erstellen" : "Task bearbeiten"}
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
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Titel *</label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="z.B. Video Script schreiben"
                            required
                        />
                    </div>

                    {/* Time/Priority */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Priorität / Zeitplan</label>
                        <select
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        >
                            <option value="Hohe Prio">Hohe Prio</option>
                            <option value="Heute">Heute</option>
                            <option value="Morgen">Morgen</option>
                            <option value="Diese Woche">Diese Woche</option>
                            <option value="Nächste Woche">Nächste Woche</option>
                            <option value="Meilenstein">Meilenstein</option>
                        </select>
                    </div>

                    {/* XP & Milestone */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* XP */}
                        <div>
                            <label className="block text-sm font-medium mb-2">XP Belohnung</label>
                            <Input
                                type="number"
                                min="10"
                                max="1000"
                                step="10"
                                value={formData.xp}
                                onChange={(e) => setFormData({ ...formData, xp: parseInt(e.target.value) })}
                            />
                        </div>

                        {/* Milestone Toggle */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Meilenstein</label>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isMilestone: !formData.isMilestone })}
                                className={`
                                    w-full px-4 py-3 rounded-lg border transition-all flex items-center justify-center gap-2 text-sm font-medium
                                    ${formData.isMilestone
                                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                                        : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                                    }
                                `}
                            >
                                <Trophy className="w-4 h-4" />
                                {formData.isMilestone ? "Ja" : "Nein"}
                            </button>
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
                            {mode === "create" ? "Task erstellen" : "Änderungen speichern"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
