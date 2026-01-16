"use client";

import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Button } from "@/components/ui/Button";
import { Play, FolderKanban, TrendingUp, CheckCircle2, Calendar } from "lucide-react";
import { XPBar } from "@/components/gamification/XPBar";
import { useProjectStore } from "@/lib/projects";
import { useTaskStore } from "@/lib/tasks";
import { usePlannerStore } from "@/lib/planner";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export default function Home() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { projects } = useProjectStore();
    const { tasks } = useTaskStore();
    const { timeline } = usePlannerStore();
    const router = useRouter();

    const activeProjects = projects.filter(p => p.status === 'active');
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const todaySchedule = timeline.slice(0, 3); // Next 3 items

    useGSAP(() => {
        gsap.from(".stagger-item", {
            y: 30,
            opacity: 0,
            stagger: 0.1,
            duration: 0.8,
            ease: "power3.out"
        });
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="flex-1 pl-8 pr-6 py-4 space-y-6 relative">
            {/* Shadow from sidebar */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/20 via-black/5 to-transparent pointer-events-none" />
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-bold text-gradient">Mission Control</h1>
                    <p className="text-muted-foreground">Deine Zentrale für Projekte, Planung und Fortschritt.</p>
                </div>
                <div className="w-full md:w-[380px]">
                    <XPBar />
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Active Projects Overview (2 cols) */}
                <div className="md:col-span-2 stagger-item">
                    <SpotlightCard className="p-6 h-full">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <FolderKanban className="w-6 h-6 text-primary" />
                                <h2 className="text-2xl font-bold text-foreground">Aktive Projekte</h2>
                            </div>
                            <Button variant="ghost" onClick={() => router.push('/projects')}>
                                Alle anzeigen &rarr;
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {activeProjects.slice(0, 2).map((project) => {
                                const projectTasks = tasks.filter(t => t.projectId === project.id);
                                const completed = projectTasks.filter(t => t.status === 'completed').length;

                                return (
                                    <div
                                        key={project.id}
                                        className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                                        onClick={() => router.push('/projects')}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">{project.icon}</span>
                                                <div>
                                                    <h3 className="font-bold text-base">{project.title}</h3>
                                                    <p className="text-xs text-muted-foreground">{completed}/{projectTasks.length} Tasks</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold text-primary">{project.progress}%</p>
                                            </div>
                                        </div>
                                        <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full bg-gradient-to-r ${project.color} transition-all duration-500`}
                                                style={{ width: `${project.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {activeProjects.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                <FolderKanban className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>Keine aktiven Projekte. Zeit, etwas Neues zu starten!</p>
                            </div>
                        )}
                    </SpotlightCard>
                </div>

                {/* Quick Stats (1 col) */}
                <div className="space-y-4 stagger-item">
                    <SpotlightCard className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <h3 className="font-bold text-sm">Offene Aufgaben</h3>
                        </div>
                        <p className="text-3xl font-bold text-primary mb-1">{pendingTasks.length}</p>
                        <p className="text-xs text-muted-foreground">Über alle Projekte</p>
                    </SpotlightCard>

                    <SpotlightCard className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="w-4 h-4 text-blue-400" />
                            <h3 className="font-bold text-sm">Fortschritt</h3>
                        </div>
                        <p className="text-3xl font-bold text-primary mb-1">
                            {Math.round(activeProjects.reduce((acc, p) => acc + p.progress, 0) / activeProjects.length) || 0}%
                        </p>
                        <p className="text-xs text-muted-foreground">Durchschnitt aller Projekte</p>
                    </SpotlightCard>
                </div>

                {/* Today's Schedule (Full width) */}
                <div className="md:col-span-3 stagger-item">
                    <SpotlightCard className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-6 h-6 text-primary" />
                                <h2 className="text-2xl font-bold">Dein Tagesplan</h2>
                            </div>
                            <Button variant="ghost" onClick={() => router.push('/planner')}>
                                Zum Planner &rarr;
                            </Button>
                        </div>

                        {todaySchedule.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {todaySchedule.map((item) => (
                                    <div
                                        key={item.id}
                                        className="p-3 rounded-xl bg-white/5 border border-white/10"
                                    >
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="text-xs font-mono text-primary font-bold bg-primary/10 px-2 py-0.5 rounded">
                                                {item.time}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground uppercase border border-white/10 px-1.5 py-0.5 rounded-full">
                                                {item.type}
                                            </span>
                                        </div>
                                        <h4 className="font-semibold text-sm">{item.title}</h4>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>Noch nichts geplant. Nutze den AI Planner!</p>
                                <Button className="mt-4" onClick={() => router.push('/planner')}>
                                    <Play className="w-4 h-4 mr-2" />
                                    Mit Planung starten
                                </Button>
                            </div>
                        )}
                    </SpotlightCard>
                </div>
            </div>
        </div>
    );
}
