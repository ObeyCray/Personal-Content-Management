import { useState, useRef, useEffect } from "react";
import { CheckCircle2, Circle, ChevronRight, ChevronDown, Pencil, Trash2, Zap, MessageSquare, Trophy } from "lucide-react";
import type { Task } from "@/lib/tasks";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

interface HierarchicalTaskListProps {
    tasks: Task[];
    onToggle: (id: number) => void;
    onEdit: (task: Task) => void;
    onDelete: (id: number) => void;
    onDiscuss: (task: Task) => void;
}

function TaskItem({
    task,
    level = 0,
    subTasks,
    collapsed,
    onToggleCollapse,
    onToggle,
    onEdit,
    onDelete,
    onDiscuss,
    subTasksRef
}: {
    task: Task;
    level?: number;
    subTasks: Task[];
    collapsed: boolean;
    onToggleCollapse: () => void;
    onToggle: (id: number) => void;
    onEdit: (task: Task) => void;
    onDelete: (id: number) => void;
    onDiscuss: (task: Task) => void;
    subTasksRef: React.RefObject<HTMLDivElement | null>;
}) {
    const hasChildren = subTasks.length > 0;
    const indentClass = level > 0 ? `ml-${level * 6}` : '';
    const taskRef = useRef<HTMLDivElement>(null);

    // Animate task appearance
    useGSAP(() => {
        if (taskRef.current) {
            gsap.from(taskRef.current, {
                opacity: 0,
                y: -10,
                duration: 0.3,
                ease: "power2.out"
            });
        }
    }, []);

    return (
        <div className="relative" ref={taskRef}>
            {/* Vertical line for sub-tasks */}
            {level > 0 && (
                <div className="absolute left-2 top-0 bottom-0 w-px bg-gradient-to-b from-white/20 to-transparent" />
            )}

            <div className={`group ${indentClass}`}>
                <div
                    className={`p-4 rounded-xl border transition-all ${task.status === 'completed'
                        ? 'bg-white/5 border-white/10 opacity-60'
                        : 'bg-gradient-to-br from-white/10 to-white/5 border-white/20 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10'
                        }`}
                    onMouseEnter={(e) => {
                        if (task.status !== 'completed') {
                            gsap.to(e.currentTarget, {
                                scale: 1.02,
                                duration: 0.2,
                                ease: "power2.out"
                            });
                        }
                    }}
                    onMouseLeave={(e) => {
                        gsap.to(e.currentTarget, {
                            scale: 1,
                            duration: 0.2,
                            ease: "power2.in"
                        });
                    }}
                >
                    <div className="flex items-start gap-3">
                        {/* Collapse button for parent tasks */}
                        {hasChildren && (
                            <button
                                onClick={onToggleCollapse}
                                className="p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
                                title={collapsed ? "Aufklappen" : "Zuklappen"}
                            >
                                {collapsed ? (
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                )}
                            </button>
                        )}

                        {/* Status toggle */}
                        <button
                            onClick={() => onToggle(task.id)}
                            className={`p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0 ${!hasChildren ? 'ml-5' : ''}`}
                            title="Status ändern"
                        >
                            {task.status === 'completed' ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />
                            ) : (
                                <Circle className="w-5 h-5 text-muted-foreground mt-0.5" />
                            )}
                        </button>

                        {/* Task content */}
                        <div className="flex-1 min-w-0">
                            <h4 className={`font-medium text-sm mb-1 ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''
                                }`}>
                                {task.title}
                                {task.isMilestone && (
                                    <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                                        <Trophy className="w-3 h-3" />
                                        Meilenstein
                                    </span>
                                )}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span>{task.time}</span>
                                <span className="flex items-center gap-1">
                                    <Zap className="w-3 h-3 text-yellow-400" />
                                    {task.xp} XP
                                </span>
                                {hasChildren && (
                                    <span className="text-xs text-muted-foreground">
                                        {subTasks.filter(t => t.status === 'completed').length}/{subTasks.length} Sub-Tasks
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => onDiscuss(task)}
                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                title="Mit AI besprechen"
                            >
                                <MessageSquare className="w-4 h-4 text-purple-400" />
                            </button>
                            <button
                                onClick={() => onEdit(task)}
                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                title="Bearbeiten"
                            >
                                <Pencil className="w-4 h-4 text-blue-400" />
                            </button>
                            <button
                                onClick={() => onDelete(task.id)}
                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                title="Löschen"
                            >
                                <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function HierarchicalTaskList({ tasks, onToggle, onEdit, onDelete, onDiscuss }: HierarchicalTaskListProps) {
    const [collapsedTasks, setCollapsedTasks] = useState<Set<number>>(new Set());
    const listRef = useRef<HTMLDivElement>(null);

    const toggleCollapse = (taskId: number) => {
        const subTasksRef = document.querySelector(`[data-subtasks="${taskId}"]`) as HTMLElement;

        setCollapsedTasks(prev => {
            const newSet = new Set(prev);
            const willBeCollapsed = !newSet.has(taskId);

            if (newSet.has(taskId)) {
                newSet.delete(taskId);
            } else {
                newSet.add(taskId);
            }

            // Animate collapse/expand
            if (subTasksRef) {
                if (willBeCollapsed) {
                    gsap.to(subTasksRef, {
                        height: 0,
                        opacity: 0,
                        duration: 0.3,
                        ease: "power2.inOut",
                        onComplete: () => {
                            subTasksRef.style.display = 'none';
                        }
                    });
                } else {
                    subTasksRef.style.display = 'block';
                    gsap.fromTo(subTasksRef,
                        { height: 0, opacity: 0 },
                        { height: 'auto', opacity: 1, duration: 0.3, ease: "power2.out" }
                    );
                }
            }

            return newSet;
        });
    };

    const getParentTasks = () => tasks.filter(t => !t.parentTaskId);
    const getSubTasks = (taskId: number) => tasks.filter(t => t.parentTaskId === taskId);

    // Animate list on mount
    useGSAP(() => {
        if (listRef.current) {
            const children = listRef.current.querySelectorAll('.task-item');
            gsap.from(children, {
                opacity: 0,
                y: 20,
                stagger: 0.05,
                duration: 0.4,
                ease: "power2.out"
            });
        }
    }, [tasks.length]);

    const renderTask = (task: Task, level: number = 0) => {
        const subTasks = getSubTasks(task.id);
        const collapsed = collapsedTasks.has(task.id);
        const subTasksRef = useRef<HTMLDivElement>(null);

        return (
            <div key={task.id} className="space-y-2">
                <TaskItem
                    task={task}
                    level={level}
                    subTasks={subTasks}
                    collapsed={collapsed}
                    onToggleCollapse={() => toggleCollapse(task.id)}
                    onToggle={onToggle}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onDiscuss={onDiscuss}
                    subTasksRef={subTasksRef}
                />

                {/* Render sub-tasks if not collapsed */}
                {subTasks.length > 0 && (
                    <div
                        data-subtasks={task.id}
                        className="ml-8 space-y-2 border-l-2 border-white/10 pl-4 overflow-hidden"
                        style={{ display: collapsed ? 'none' : 'block' }}
                    >
                        {subTasks.map(subTask => renderTask(subTask, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    const parentTasks = getParentTasks();
    const pendingParents = parentTasks.filter(t => t.status === 'pending');
    const completedParents = parentTasks.filter(t => t.status === 'completed');

    return (
        <div className="space-y-6" ref={listRef}>
            {/* Pending Tasks */}
            {pendingParents.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                        <Circle className="w-4 h-4" />
                        Offen ({pendingParents.length})
                    </h4>
                    <div className="space-y-3">
                        {pendingParents.map(task => (
                            <div key={task.id} className="task-item">
                                {renderTask(task)}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Completed Tasks */}
            {completedParents.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Abgeschlossen ({completedParents.length})
                    </h4>
                    <div className="space-y-3">
                        {completedParents.map(task => (
                            <div key={task.id} className="task-item">
                                {renderTask(task)}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
