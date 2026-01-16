"use client";

import { useState, useRef, useMemo } from "react";
import { useProjectStore } from "@/lib/projects";
import { useTaskStore } from "@/lib/tasks";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Button } from "@/components/ui/Button";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { Calendar, Target, TrendingUp, Clock, Plus, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { gsap, useGSAP } from "@/lib/gsap";
import { ProjectFormDialog } from "@/components/projects/ProjectFormDialog";
import { DeleteConfirmDialog } from "@/components/projects/DeleteConfirmDialog";
import { FilterBar } from "@/components/projects/FilterBar";
import { ProjectDetails } from "@/components/projects/ProjectDetails";
import type { Project } from "@/lib/projects";

export default function ProjectsPage() {
    const { projects, addProject, updateProject, deleteProject } = useProjectStore();
    const { tasks } = useTaskStore();
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);

    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [deletingProject, setDeletingProject] = useState<Project | null>(null);
    const [detailsProject, setDetailsProjectState] = useState<Project | null>(null);
    const [initialTab, setInitialTab] = useState<"Übersicht" | "Tasks" | "AI Planner" | "Einstellungen">("Übersicht");

    const setDetailsProject = (project: Project | null, tab?: "Übersicht" | "Tasks" | "AI Planner" | "Einstellungen") => {
        setDetailsProjectState(project);
        if (tab) setInitialTab(tab);
    };
    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortOption, setSortOption] = useState("date-desc");

    // Filtered and sorted projects
    const filteredProjects = useMemo(() => {
        let result = [...projects];

        // Apply search filter
        if (searchQuery) {
            result = result.filter(p =>
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply status filter
        if (statusFilter !== "all") {
            result = result.filter(p => p.status === statusFilter);
        }

        // Apply sorting
        result.sort((a, b) => {
            switch (sortOption) {
                case "date-desc":
                    return b.createdAt - a.createdAt;
                case "date-asc":
                    return a.createdAt - b.createdAt;
                case "progress-desc":
                    return b.progress - a.progress;
                case "progress-asc":
                    return a.progress - b.progress;
                case "title-asc":
                    return a.title.localeCompare(b.title);
                case "title-desc":
                    return b.title.localeCompare(a.title);
                default:
                    return 0;
            }
        });

        return result;
    }, [projects, searchQuery, statusFilter, sortOption]);

    useGSAP(() => {
        gsap.from(".project-card", {
            y: 40,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out"
        });
    }, { scope: containerRef });

    const getProjectTasks = (projectId: string) => {
        return tasks.filter(t => t.projectId === projectId);
    };

    const getCompletedCount = (projectId: string) => {
        return tasks.filter(t => t.projectId === projectId && t.status === 'completed').length;
    };

    const handleCreateProject = (projectData: Omit<Project, "id" | "createdAt" | "progress">) => {
        addProject(projectData);
        setCreateDialogOpen(false);
    };

    const handleEditProject = (projectData: Omit<Project, "id" | "createdAt" | "progress">) => {
        if (editingProject) {
            updateProject(editingProject.id, projectData);
            setEditingProject(null);
        }
    };

    const handleDeleteProject = () => {
        if (deletingProject) {
            deleteProject(deletingProject.id);
            setDeletingProject(null);
        }
    };

    return (
        <div ref={containerRef} className="flex-1 pl-8 pr-6 py-4 space-y-6 relative">
            {/* Shadow from sidebar */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/20 via-black/5 to-transparent pointer-events-none" />
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-4xl font-bold text-gradient">Projekte</h1>
                    <p className="text-muted-foreground">Deine Mission Control. Alle aktiven Ziele auf einen Blick.</p>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Neues Projekt
                </Button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <SpotlightCard className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Gesamt</p>
                    <p className="text-2xl font-bold text-primary">{projects.length}</p>
                </SpotlightCard>
                <SpotlightCard className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Aktiv</p>
                    <p className="text-2xl font-bold text-emerald-400">{projects.filter(p => p.status === 'active').length}</p>
                </SpotlightCard>
                <SpotlightCard className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Durchschnitt</p>
                    <p className="text-2xl font-bold text-blue-400">
                        {Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length) || 0}%
                    </p>
                </SpotlightCard>
                <SpotlightCard className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Abgeschlossen</p>
                    <p className="text-2xl font-bold text-purple-400">{projects.filter(p => p.status === 'completed').length}</p>
                </SpotlightCard>
            </div>

            {/* Filter Bar */}
            <FilterBar
                onSearchChange={setSearchQuery}
                onStatusFilter={setStatusFilter}
                onSortChange={setSortOption}
                activeFilters={{
                    search: searchQuery,
                    status: statusFilter,
                    sort: sortOption,
                }}
            />

            {/* Project Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredProjects.map((project) => {
                    const projectTasks = getProjectTasks(project.id);
                    const completedTasks = getCompletedCount(project.id);
                    const totalTasks = projectTasks.length;

                    return (
                        <SpotlightCard
                            key={project.id}
                            className="project-card p-6 flex flex-col justify-between min-h-[280px] group"
                            spotlightColor="rgba(139, 92, 246, 0.15)"
                        >
                            {/* Project Header */}
                            <div>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${project.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                                            <MaterialIcon icon={project.icon || "tv"} size={28} className="text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-foreground">{project.title}</h3>
                                            <span className={`
                                                text-xs px-2 py-1 rounded-full inline-block mt-1
                                                ${project.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : ''}
                                                ${project.status === 'planning' ? 'bg-blue-500/20 text-blue-400' : ''}
                                                ${project.status === 'on-hold' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                                                ${project.status === 'completed' ? 'bg-gray-500/20 text-gray-400' : ''}
                                            `}>
                                                {project.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-right">
                                            <p className="text-3xl font-bold text-primary">{project.progress}%</p>
                                            <p className="text-xs text-muted-foreground">Fortschritt</p>
                                        </div>
                                        {/* Edit & Delete buttons - visible on hover */}
                                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                            <button
                                                onClick={() => setEditingProject(project)}
                                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                                title="Bearbeiten"
                                            >
                                                <Pencil className="w-4 h-4 text-blue-400" />
                                            </button>
                                            <button
                                                onClick={() => setDeletingProject(project)}
                                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                                title="Löschen"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-400" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-muted-foreground mb-4">{project.description}</p>

                                {/* Stats */}
                                <div className="flex items-center gap-4 text-sm mb-4">
                                    <div className="flex items-center gap-2">
                                        <Target className="w-4 h-4 text-primary" />
                                        <span className="text-muted-foreground">{completedTasks}/{totalTasks} Tasks</span>
                                    </div>
                                    {project.deadline && (
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-orange-400" />
                                            <span className="text-muted-foreground">{new Date(project.deadline).toLocaleDateString('de-DE')}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Progress Bar */}
                                <div className="h-2 bg-black/30 rounded-full overflow-hidden mb-4">
                                    <div
                                        className={`h-full bg-gradient-to-r ${project.color} transition-all duration-700`}
                                        style={{ width: `${project.progress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <Button
                                    className="flex-1"
                                    onClick={() => setDetailsProject(project, "AI Planner")}
                                >
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Mit AI planen
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="flex-1"
                                    onClick={() => setDetailsProject(project)}
                                >
                                    <TrendingUp className="w-4 h-4 mr-2" />
                                    Details
                                </Button>
                            </div>
                        </SpotlightCard>
                    );
                })}
            </div>

            {/* Empty State */}
            {filteredProjects.length === 0 && (
                <div className="text-center py-20">
                    <div className="inline-block p-8 bg-white/5 rounded-2xl border border-white/10 mb-4">
                        <Target className="w-16 h-16 text-muted-foreground mx-auto" />
                    </div>
                    {projects.length === 0 ? (
                        <>
                            <h3 className="text-2xl font-bold mb-2">Noch keine Projekte</h3>
                            <p className="text-muted-foreground mb-6">Starte dein erstes Projekt und erreiche deine Ziele!</p>
                            <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                                <Plus className="w-4 h-4" />
                                Erstes Projekt erstellen
                            </Button>
                        </>
                    ) : (
                        <>
                            <h3 className="text-2xl font-bold mb-2">Keine Projekte gefunden</h3>
                            <p className="text-muted-foreground mb-6">Versuche andere Filter oder Suchbegriffe.</p>
                            <Button
                                onClick={() => {
                                    setSearchQuery("");
                                    setStatusFilter("all");
                                }}
                                variant="ghost"
                            >
                                Filter zurücksetzen
                            </Button>
                        </>
                    )}
                </div>
            )}

            {/* Dialogs */}
            <ProjectFormDialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                onSubmit={handleCreateProject}
                mode="create"
            />

            <ProjectFormDialog
                open={!!editingProject}
                onClose={() => setEditingProject(null)}
                onSubmit={handleEditProject}
                initialData={editingProject || undefined}
                mode="edit"
            />

            <DeleteConfirmDialog
                open={!!deletingProject}
                onClose={() => setDeletingProject(null)}
                onConfirm={handleDeleteProject}
                projectTitle={deletingProject?.title || ""}
            />

            <ProjectDetails
                open={!!detailsProject}
                onClose={() => setDetailsProject(null)}
                project={detailsProject!}
                tasks={detailsProject ? getProjectTasks(detailsProject.id) : []}
                initialTab={initialTab}
                onEdit={() => {
                    if (detailsProject) {
                        setEditingProject(detailsProject);
                        setDetailsProject(null);
                    }
                }}
            />
        </div>
    );
}
