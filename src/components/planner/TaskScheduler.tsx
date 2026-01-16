"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/label";
import { Calendar, CheckCircle2 } from "lucide-react";
import { useTaskStore, Task } from "@/lib/tasks";
import { usePlannerStore } from "@/lib/planner";
import { toast } from "sonner";
import { toLocalDateString } from "@/lib/utils";

interface TaskSchedulerProps {
    selectedDate: Date;
}

export function TaskScheduler({ selectedDate }: TaskSchedulerProps) {
    const [open, setOpen] = useState(false);
    const { tasks, updateTask } = useTaskStore();
    const addToTimeline = usePlannerStore(state => state.addToTimeline);

    // Get unscheduled or tasks without a date
    const unscheduledTasks = tasks.filter(t =>
        t.status === 'pending' && !t.parentTaskId && !t.scheduledDate
    );

    const handleScheduleTask = (task: Task) => {
        const dateStr = toLocalDateString(selectedDate);

        // Update task with scheduled date
        updateTask(task.id, { scheduledDate: dateStr });

        // Add to timeline
        addToTimeline({
            id: Date.now().toString(),
            title: task.title,
            time: "09:00", // Default time
            type: task.isMilestone ? "meeting" : "work",
            description: task.projectId ? `Projekt-Task` : "",
            taskId: task.id
        });

        toast.success(`"${task.title}" für ${formatDate(selectedDate)} geplant`);

        // Close if no more tasks
        if (unscheduledTasks.length === 1) {
            setOpen(false);
        }
    };

    const formatDate = (date: Date) => {
        const days = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
        const months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
        return `${days[date.getDay()]}, ${date.getDate()}. ${months[date.getMonth()]}`;
    };

    if (unscheduledTasks.length === 0) {
        return null; // Don't show button if no tasks to schedule
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{unscheduledTasks.length} Tasks zuordnen</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] glass border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-gradient">Tasks zuordnen</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        Wähle Tasks aus, um sie für {formatDate(selectedDate)} zu planen
                    </p>
                </DialogHeader>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                    {unscheduledTasks.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm font-medium">Alle Tasks sind bereits geplant!</p>
                        </div>
                    ) : (
                        unscheduledTasks.map((task) => (
                            <div
                                key={task.id}
                                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-primary/30 transition-colors group"
                            >
                                <div className="flex-1">
                                    <h4 className="font-medium text-white text-sm">{task.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        {task.isMilestone && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                                                Meilenstein
                                            </span>
                                        )}
                                        <span className="text-xs text-muted-foreground">{task.time}</span>
                                        <span className="text-xs text-muted-foreground">•</span>
                                        <span className="text-xs text-primary">{task.xp} XP</span>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => handleScheduleTask(task)}
                                    className="ml-4"
                                >
                                    Zuordnen
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
