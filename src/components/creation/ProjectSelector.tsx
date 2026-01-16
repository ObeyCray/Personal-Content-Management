"use client";

import { useState } from "react";
import { useProjectStore } from "@/lib/projects";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Check, FolderKanban, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectSelectorProps {
    open: boolean;
    onClose: () => void;
    onSelect: (projectId: string) => void;
}

export function ProjectSelector({ open, onClose, onSelect }: ProjectSelectorProps) {
    const { projects } = useProjectStore();
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

    if (!open) return null;

    const handleSubmit = () => {
        if (selectedProjectId) {
            onSelect(selectedProjectId);
            onClose();
        }
    };

    const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'planning');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-2xl mx-4 glass border-white/10 max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            <FolderKanban className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Projekt auswählen</h2>
                            <p className="text-sm text-white/50">Wo möchtest du diesen Content speichern?</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="hover:bg-white/10"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Project List */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {activeProjects.length === 0 ? (
                        <div className="text-center py-12">
                            <FolderKanban className="w-16 h-16 text-white/30 mx-auto mb-4" />
                            <p className="text-white/50">Keine aktiven Projekte vorhanden.</p>
                            <p className="text-white/30 text-sm mt-2">Erstelle zuerst ein Projekt im Projekt-Tab.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {activeProjects.map((project) => (
                                <button
                                    key={project.id}
                                    onClick={() => setSelectedProjectId(project.id)}
                                    className={cn(
                                        "p-4 rounded-xl border transition-all text-left relative",
                                        "hover:border-white/30 hover:bg-white/5",
                                        selectedProjectId === project.id
                                            ? "border-primary bg-primary/10"
                                            : "border-white/10 bg-white/5"
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">{project.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-semibold text-white mb-1">
                                                {project.title}
                                            </h3>
                                            <p className="text-xs text-white/50 line-clamp-2">
                                                {project.description}
                                            </p>
                                            <div className="mt-2 flex items-center gap-2">
                                                <span className={cn(
                                                    "text-xs px-2 py-0.5 rounded-full",
                                                    project.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                                                )}>
                                                    {project.status}
                                                </span>
                                                <span className="text-xs text-white/30">
                                                    {project.progress}%
                                                </span>
                                            </div>
                                        </div>
                                        {selectedProjectId === project.id && (
                                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 flex justify-end gap-2">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="hover:bg-white/10"
                    >
                        Abbrechen
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!selectedProjectId}
                        className="bg-primary hover:bg-primary/90"
                    >
                        Speichern
                    </Button>
                </div>
            </Card>
        </div>
    );
}
