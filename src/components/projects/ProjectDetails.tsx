"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { X, Calendar, Target, Clock, TrendingUp, CheckCircle2, Circle, Pencil, Plus, Trophy, Trash2, Zap, Gauge, Sparkles } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { TaskFormDialog } from "@/components/projects/TaskFormDialog";
import { ProjectAIPlanner } from "@/components/projects/ProjectAIPlanner";
import { HierarchicalTaskList } from "./HierarchicalTaskList";
import { toast } from "sonner";
import { useTaskStore } from "@/lib/tasks";
import { useProjectStore } from "@/lib/projects";
import type { Project } from "@/lib/projects";
import type { Task } from "@/lib/tasks";

interface ProjectDetailsProps {
    open: boolean;
    onClose: () => void;
    project: Project;
    tasks: Task[];
    onEdit: () => void;
    initialTab?: Tab; // Optional: which tab to open initially
}

const TABS = ["Übersicht", "Tasks", "AI Planner", "Einstellungen"] as const;
type Tab = typeof TABS[number];

export function ProjectDetails({ open, onClose, project, tasks, onEdit, initialTab }: ProjectDetailsProps) {
    const detailsRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<Tab>(initialTab || "Übersicht");
    const [taskDialogOpen, setTaskDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);
    const [focusedTask, setFocusedTask] = useState<Task | null>(null); // For AI Planner focus
    const [collapsedTasks, setCollapsedTasks] = useState<Set<number>>(new Set()); // Track collapsed parent tasks
    const dialogRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const { toggleTask, deleteTask: removeTask, updateTask, getSubTasks, addTask } = useTaskStore();
    const { updateProject, calculateProgress } = useProjectStore();

    // Helper functions for hierarchical task display
    const toggleCollapse = (taskId: number) => {
        setCollapsedTasks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
                newSet.delete(taskId);
            } else {
                newSet.add(taskId);
            }
            return newSet;
        });
    };

    const getParentTasks = () => tasks.filter(t => !t.parentTaskId);
    const getTaskSubTasks = (taskId: number) => tasks.filter(t => t.parentTaskId === taskId);
    const hasSubTasks = (taskId: number) => tasks.some(t => t.parentTaskId === taskId);

    const handleDiscussTask = (task: Task) => {
        setFocusedTask(task);
        setActiveTab("AI Planner");
    };

    // Memoize task counts to prevent unnecessary recalculations
    const completedTasksCount = useMemo(() =>
        tasks.filter(t => t.status === 'completed').length,
        [tasks]
    );

    const totalTasksCount = useMemo(() =>
        tasks.length,
        [tasks]
    );

    // Auto-calculate progress when task counts change
    useEffect(() => {
        if (open && project?.id) {
            calculateProgress(project.id, completedTasksCount, totalTasksCount);
        }
    }, [completedTasksCount, totalTasksCount, open, project?.id, calculateProgress]);

    useGSAP(() => {
        if (open && contentRef.current) {
            gsap.from(contentRef.current, {
                scale: 0.95,
                opacity: 0,
                duration: 0.3,
                ease: "power2.out"
            });
        }
    }, { dependencies: [open], scope: dialogRef });

    const handleClose = () => {
        if (contentRef.current) {
            gsap.to(contentRef.current, {
                scale: 0.95,
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

    const completedTasks = completedTasksCount;
    const totalTasks = totalTasksCount;
    const daysUntilDeadline = project.deadline
        ? Math.ceil((new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

    return (
        <div
            ref={dialogRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
        >
            <div
                ref={contentRef}
                className="relative w-full max-w-5xl max-h-[90vh] bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-white/10">
                    <div className="flex items-start gap-4 flex-1">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${project.color} flex items-center justify-center shadow-lg`}>
                            <MaterialIcon icon={project.icon || "tv"} size={36} className="text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold text-foreground mb-2">{project.title}</h2>
                            <div className="flex items-center gap-3">
                                <span className={`
                                    text-xs px-3 py-1 rounded-full
                                    ${project.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : ''}
                                    ${project.status === 'planning' ? 'bg-blue-500/20 text-blue-400' : ''}
                                    ${project.status === 'on-hold' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                                    ${project.status === 'completed' ? 'bg-gray-500/20 text-gray-400' : ''}
                                `}>
                                    {project.status}
                                </span>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                        Erstellt: {new Date(project.createdAt).toLocaleDateString('de-DE')}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="relative w-20 h-20 mb-2">
                                <svg className="w-20 h-20 transform -rotate-90">
                                    <circle
                                        cx="40"
                                        cy="40"
                                        r="36"
                                        stroke="currentColor"
                                        strokeWidth="6"
                                        fill="none"
                                        className="text-white/10"
                                    />
                                    <circle
                                        cx="40"
                                        cy="40"
                                        r="36"
                                        stroke="currentColor"
                                        strokeWidth="6"
                                        fill="none"
                                        strokeDasharray={`${2 * Math.PI * 36}`}
                                        strokeDashoffset={`${2 * Math.PI * 36 * (1 - project.progress / 100)}`}
                                        className="text-primary transition-all duration-700"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-lg font-bold text-primary">{project.progress}%</span>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">Fortschritt</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors ml-4"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 px-6 pt-4 border-b border-white/10">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`
                                px-4 py-2 text-sm font-medium rounded-t-lg transition-all
                                ${activeTab === tab
                                    ? 'bg-white/10 text-foreground border-t border-x border-white/10'
                                    : 'text-muted-foreground hover:bg-white/5'
                                }
                            `}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === "Übersicht" && (
                        <div className="space-y-8">
                            {/* Header Section */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${project.color} flex items-center justify-center text-2xl`}>
                                        <MaterialIcon icon={project.icon || "tv"} size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Beschreibung</p>
                                        <p className="text-sm text-muted-foreground mt-0.5">{project.description || "Keine Beschreibung vorhanden"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Key Metrics Grid */}
                            <div className="grid grid-cols-3 gap-4">
                                {/* Tasks Metric */}
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Circle className="w-4 h-4 text-blue-400" />
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Tasks</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-3xl font-bold">{completedTasksCount}/{totalTasksCount}</p>
                                        <p className="text-xs text-muted-foreground">{completedTasksCount} abgeschlossen</p>
                                    </div>
                                </div>

                                {/* Progress Metric */}
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
                                    <div className="flex items-center gap-2 mb-3">
                                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Fortschritt</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-3xl font-bold">{project.progress}%</p>
                                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full bg-gradient-to-r ${project.color} transition-all duration-500`}
                                                style={{ width: `${project.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Created Date Metric */}
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Calendar className="w-4 h-4 text-purple-400" />
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Erstellt am</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xl font-semibold">
                                            {new Date(project.createdAt).toLocaleDateString('de-DE', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            })}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {Math.floor((Date.now() - new Date(project.createdAt).getTime()) / (1000 * 60 * 60 * 24))} Tage aktiv
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => setActiveTab("Tasks")}
                                    variant="ghost"
                                    className="flex-1 h-12 bg-white/5 hover:bg-white/10 border border-white/10"
                                >
                                    <Target className="w-4 h-4 mr-2" />
                                    Tasks verwalten
                                </Button>
                                <Button
                                    onClick={() => setActiveTab("AI Planner")}
                                    variant="ghost"
                                    className="flex-1 h-12 bg-white/5 hover:bg-white/10 border border-white/10"
                                >
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Mit AI planen
                                </Button>
                            </div>
                        </div>
                    )}

                    {activeTab === "Tasks" && (
                        <div className="space-y-4">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold">Aufgaben</h3>
                                <Button onClick={() => setTaskDialogOpen(true)} size="sm">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Neue Task
                                </Button>
                            </div>

                            {/* Hierarchical Task List */}
                            {tasks.length > 0 ? (
                                <HierarchicalTaskList
                                    tasks={tasks}
                                    onToggle={toggleTask}
                                    onEdit={setEditingTask}
                                    onDelete={setDeletingTaskId}
                                    onDiscuss={handleDiscussTask}
                                />
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <p>Noch keine Aufgaben vorhanden.</p>
                                    <Button
                                        onClick={() => setTaskDialogOpen(true)}
                                        variant="ghost"
                                        className="mt-4"
                                    >
                                        Erste Task erstellen
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "AI Planner" && (
                        <div>
                            <ProjectAIPlanner
                                project={project}
                                existingTasks={tasks}
                                focusedTask={focusedTask}
                                onClearFocus={() => {
                                    setFocusedTask(null);
                                    toast.success('Zurück zum normalen Chat-Modus');
                                }}
                            />
                        </div>
                    )}

                    {activeTab === "Einstellungen" && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold mb-4">Projekteinstellungen</h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                        <h4 className="font-medium mb-2">Projekt bearbeiten</h4>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            Ändere Titel, Beschreibung, Icon, Farbe und andere Einstellungen.
                                        </p>
                                        <Button onClick={() => { onEdit(); handleClose(); }} variant="ghost">
                                            Projekt bearbeiten
                                        </Button>
                                    </div>

                                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                        <h4 className="font-medium mb-2">Projekt-Farbe</h4>
                                        <div className={`h-12 w-full bg-gradient-to-r ${project.color} rounded-lg`} />
                                    </div>

                                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                        <h4 className="font-medium mb-2">Projekt-ID</h4>
                                        <p className="text-sm text-muted-foreground font-mono">{project.id}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Task Form Dialog */}
                <TaskFormDialog
                    open={taskDialogOpen || !!editingTask}
                    onClose={() => {
                        setTaskDialogOpen(false);
                        setEditingTask(null);
                    }}
                    onSubmit={(taskData) => {
                        if (editingTask) {
                            // Update existing task
                            updateTask(editingTask.id, taskData);
                        } else {
                            // Add new task
                            addTask(taskData);
                        }
                        // Progress will auto-update via useEffect
                    }}
                    initialData={editingTask || undefined}
                    mode={editingTask ? "edit" : "create"}
                    projectId={project.id}
                />

                {/* Delete Confirmation */}
                {deletingTaskId !== null && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-gray-900 border border-red-500/30 rounded-xl p-6 max-w-md">
                            <h3 className="text-lg font-bold mb-2">Task löschen?</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Möchtest du diese Task wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                            </p>
                            <div className="flex gap-3">
                                <Button variant="ghost" onClick={() => setDeletingTaskId(null)} className="flex-1">
                                    Abbrechen
                                </Button>
                                <Button
                                    onClick={() => {
                                        removeTask(deletingTaskId);
                                        setDeletingTaskId(null);
                                    }}
                                    className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                                >
                                    Löschen
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
