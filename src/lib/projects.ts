import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProjectContentItem {
    id: string;
    title: string;
    content: string;
    type: 'blog' | 'video' | 'social' | 'newsletter' | 'docs' | 'podcast';
    createdAt: number;
}

export interface Project {
    id: string;
    title: string;
    description: string;
    status: 'active' | 'completed' | 'on-hold' | 'planning';
    progress: number; // 0-100
    progressMode?: 'auto' | 'manual'; // auto = calculated from tasks, manual = user-set
    createdAt: number;
    deadline?: string;
    color?: string; // For UI differentiation
    icon?: string; // Emoji
    contentItems?: ProjectContentItem[]; // Content created in Creation workspace
}

interface ProjectState {
    projects: Project[];
    addProject: (project: Omit<Project, 'id' | 'createdAt' | 'progress'>) => void;
    updateProject: (id: string, updates: Partial<Project>) => void;
    deleteProject: (id: string) => void;
    updateProgress: (id: string, progress: number) => void;
    calculateProgress: (projectId: string, completedTasks: number, totalTasks: number) => void;
    addContentToProject: (projectId: string, contentItem: Omit<ProjectContentItem, 'id' | 'createdAt'>) => void;
}

const initialProjects: Project[] = [
    {
        id: 'p1',
        title: 'YouTube Channel Launch',
        description: 'Launch strategy and initial content for the new tech channel.',
        status: 'active',
        progress: 35,
        progressMode: 'auto',
        createdAt: Date.now(),
        color: 'from-red-500 to-orange-500',
        icon: 'tv',
        deadline: '2026-03-01'
    },
    {
        id: 'p2',
        title: 'Personal Website V2',
        description: 'Complete overhaul of the portfolio with Next.js 15.',
        status: 'active',
        progress: 60,
        progressMode: 'auto',
        createdAt: Date.now(),
        color: 'from-purple-500 to-indigo-500',
        icon: 'language'
    }
];

export const useProjectStore = create<ProjectState>()(
    persist(
        (set, get) => ({
            projects: initialProjects,
            addProject: (project) => {
                set((state) => ({
                    projects: [
                        ...state.projects,
                        {
                            ...project,
                            id: crypto.randomUUID(),
                            createdAt: Date.now(),
                            progress: 0,
                            progressMode: 'auto'
                        }
                    ]
                }));
            },
            updateProject: (id, updates) => {
                set((state) => ({
                    projects: state.projects.map((p) =>
                        p.id === id ? { ...p, ...updates } : p
                    )
                }));
            },
            deleteProject: (id) => {
                set((state) => ({
                    projects: state.projects.filter((p) => p.id !== id)
                }));
            },
            updateProgress: (id, progress) => {
                set((state) => ({
                    projects: state.projects.map((p) =>
                        p.id === id ? { ...p, progress } : p
                    )
                }));
            },
            calculateProgress: (projectId, completedTasks, totalTasks) => {
                const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                set((state) => ({
                    projects: state.projects.map((p) =>
                        p.id === projectId ? { ...p, progress, progressMode: 'auto' } : p
                    )
                }));
            },
            addContentToProject: (projectId, contentItem) => {
                set((state) => ({
                    projects: state.projects.map((p) =>
                        p.id === projectId
                            ? {
                                ...p,
                                contentItems: [
                                    ...(p.contentItems || []),
                                    {
                                        ...contentItem,
                                        id: crypto.randomUUID(),
                                        createdAt: Date.now()
                                    }
                                ]
                            }
                            : p
                    )
                }));
            }
        }),
        {
            name: 'personal-cms-projects',
        }
    )
);
