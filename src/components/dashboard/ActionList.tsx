"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { CheckCircle2, Circle } from "lucide-react";
import { useGameStore } from "@/lib/gamification";
import { useToastStore } from "@/components/ui/Toaster";
import { useTaskStore } from "@/lib/tasks";
import { cn } from "@/lib/utils";

export function ActionList() {
    const { tasks, completeTask } = useTaskStore();
    const { addXp, incrementStat } = useGameStore();
    const { addToast } = useToastStore();

    const handleComplete = (id: number) => {
        const xp = completeTask(id);
        if (xp > 0) {
            addXp(xp);
            incrementStat('tasksCompleted');
            addToast(`Task Completed! +${xp} XP`, "achievement");
        }
    };

    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Nächste Schritte</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {tasks.map((action) => {
                        const isCompleted = action.status === "completed";
                        return (
                            <div
                                key={action.id}
                                onClick={() => !isCompleted && handleComplete(action.id)}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer group",
                                    isCompleted
                                        ? "bg-white/5 border-transparent opacity-50"
                                        : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-primary/50"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <Circle className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    )}
                                    <span className={isCompleted ? "line-through text-muted-foreground" : ""}>
                                        {action.title}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    {!isCompleted && <span className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">+{action.xp} XP</span>}
                                    <span className="text-sm text-muted-foreground">{action.time}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
