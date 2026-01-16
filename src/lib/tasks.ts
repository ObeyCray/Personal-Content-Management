import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Task {
    id: number;
    title: string;
    time: string;
    status: 'pending' | 'completed';
    xp: number;
    projectId?: string; // Link to Project
    isMilestone?: boolean;
    parentTaskId?: number; // For sub-tasks: references parent task ID
    scheduledDate?: string; // Format: YYYY-MM-DD - for planner integration
}

const initialTasks: Task[] = [
    { id: 1, title: "Social Media Accounts erstellen", time: "Hohe Prio", status: "pending", xp: 150, projectId: 'p1' },
    { id: 11, title: "Instagram Account anlegen", time: "Heute", status: "completed", xp: 50, projectId: 'p1', parentTaskId: 1 },
    { id: 12, title: "YouTube Channel einrichten", time: "Heute", status: "pending", xp: 50, projectId: 'p1', parentTaskId: 1 },
    { id: 13, title: "TikTok Profil erstellen", time: "Morgen", status: "pending", xp: 50, projectId: 'p1', parentTaskId: 1 },

    { id: 2, title: "Erstes Video hochladen", time: "Meilenstein", status: "pending", xp: 500, projectId: 'p1', isMilestone: true },
    { id: 21, title: "Video-Idee entwickeln", time: "Heute", status: "completed", xp: 100, projectId: 'p1', parentTaskId: 2 },
    { id: 22, title: "Equipment aufbauen", time: "Heute", status: "completed", xp: 75, projectId: 'p1', parentTaskId: 2 },
    { id: 23, title: "Video aufnehmen", time: "Diese Woche", status: "pending", xp: 150, projectId: 'p1', parentTaskId: 2 },
    { id: 24, title: "Schnitt und Bearbeitung", time: "Diese Woche", status: "pending", xp: 150, projectId: 'p1', parentTaskId: 2 },
    { id: 25, title: "Thumbnail erstellen", time: "Diese Woche", status: "pending", xp: 75, projectId: 'p1', parentTaskId: 2 },

    { id: 3, title: "Wochenplan (Content) erstellen", time: "Heute", status: "pending", xp: 100, projectId: 'p1' },
    { id: 4, title: "Analytics prüfen", time: "Morgen", status: "pending", xp: 50, projectId: 'p1' },
    { id: 5, title: "Landing Page Design", time: "Diese Woche", status: "pending", xp: 200, projectId: 'p2' },
];

interface TaskState {
    tasks: Task[];
    toggleTask: (id: number) => void; // Returns XP reward (or 0 if uncompleting)
    addTask: (task: Omit<Task, 'id' | 'status'>) => void;
    updateTask: (id: number, updates: Partial<Task>) => void;
    deleteTask: (id: number) => void;
    addSubTask: (parentId: number, task: Omit<Task, 'id' | 'status' | 'parentTaskId'>) => void;
    getSubTasks: (parentId: number) => Task[];
    getTaskWithSubtasks: (taskId: number) => Task & { subtasks: Task[] } | null;
}

export const useTaskStore = create<TaskState>()(
    persist(
        (set, get) => ({
            tasks: initialTasks,
            toggleTask: (id) => {
                const { tasks } = get();
                const task = tasks.find(t => t.id === id);
                if (!task) return 0;

                const newStatus = task.status === 'completed' ? 'pending' : 'completed';
                set({
                    tasks: tasks.map(t =>
                        t.id === id ? { ...t, status: newStatus } : t
                    )
                });

                // Return XP only when completing, not when uncompleting
                return newStatus === 'completed' ? task.xp : 0;
            },
            addTask: (task) => {
                set(state => ({
                    tasks: [...state.tasks, { ...task, id: Date.now(), status: 'pending' }]
                }));
            },
            updateTask: (id, updates) => {
                set(state => ({
                    tasks: state.tasks.map(t =>
                        t.id === id ? { ...t, ...updates } : t
                    )
                }));
            },
            deleteTask: (id) => {
                set(state => ({
                    tasks: state.tasks.filter(t => t.id !== id)
                }));
            },
            addSubTask: (parentId, task) => {
                set(state => ({
                    tasks: [...state.tasks, {
                        ...task,
                        id: Date.now(),
                        status: 'pending',
                        parentTaskId: parentId
                    }]
                }));
            },
            getSubTasks: (parentId) => {
                const { tasks } = get();
                return tasks.filter(t => t.parentTaskId === parentId);
            },
            getTaskWithSubtasks: (taskId) => {
                const { tasks } = get();
                const task = tasks.find(t => t.id === taskId);
                if (!task) return null;

                const subtasks = tasks.filter(t => t.parentTaskId === taskId);
                return { ...task, subtasks };
            }
        }),
        {
            name: 'personal-cms-tasks',
        }
    )
);
