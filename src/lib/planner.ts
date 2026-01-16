
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useTaskStore } from './tasks';
import { useGameStore } from './gamification';
import { useProjectStore } from './projects';
import { toLocalDateString } from '@/lib/utils';

// Initialize Groq
import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
    dangerouslyAllowBrowser: true // Client-side usage
});

export type TimeBlockType = 'work' | 'admin' | 'break' | 'meeting' | 'creative';

export interface Suggestion {
    id: string;
    title: string;
    time: string;
    type: TimeBlockType;
    description?: string;
    taskId?: number;
}

// ... (skipping to addToTimeline)



export interface Message {
    id: string;
    role: 'user' | 'ai';
    content: string;
    suggestions?: Suggestion[];
    timestamp: number;
}

export interface TimelineItem {
    id: string;
    time: string;
    title: string;
    type: TimeBlockType;
    status: 'planned' | 'completed';
    date?: string; // Format: YYYY-MM-DD
    taskId?: number; // Linked Task ID (optional)
}

// ...



interface PlannerState {
    messages: Message[];
    timeline: TimelineItem[];
    isGenerating: boolean;
    selectedDate: Date;

    sendMessage: (content: string) => Promise<void>;
    addToTimeline: (suggestion: Suggestion) => void;
    removeFromTimeline: (id: string) => void;
    setSelectedDate: (date: Date) => void;
}

export const usePlannerStore = create<PlannerState>()(
    persist(
        (set, get) => ({
            messages: [
                {
                    id: 'welcome',
                    role: 'ai',
                    content: "Hallo! Ich bin dein AI Consultant. Ich kenne deine Projekte und Aufgaben. Lass uns planen!",
                    timestamp: Date.now()
                }
            ],
            timeline: [
                { id: '1', time: "09:00", title: "Morgen Review", type: "admin", status: 'planned', date: new Date().toISOString().split('T')[0] }
            ],
            isGenerating: false,
            selectedDate: new Date(),

            sendMessage: async (content: string) => {
                const { messages } = get();

                // 1. Add User Message
                const userMsg: Message = {
                    id: Date.now().toString(),
                    role: 'user',
                    content,
                    timestamp: Date.now()
                };

                set({ messages: [...messages, userMsg], isGenerating: true });

                try {
                    const { stats } = useGameStore.getState();
                    const { tasks } = useTaskStore.getState();
                    const { projects } = useProjectStore.getState();

                    const activeProjects = projects.filter(p => p.status === 'active');

                    // 2. Build Context
                    const contextSystemPrompt = `
                        Current Context:
                        - Stats: ${JSON.stringify(stats)}
                        - Active Projects: ${JSON.stringify(activeProjects.map(p => ({ id: p.id, title: p.title, desc: p.description, progress: p.progress })))}
                        - Open Tasks: ${JSON.stringify(tasks.filter(t => t.status === 'pending').map(t => ({
                        title: t.title,
                        project: t.projectId ? activeProjects.find(p => p.id === t.projectId)?.title : 'No Project',
                        priority: t.time
                    })))}
                        - Timeline: ${JSON.stringify(get().timeline)}
                        
                        You are a friendly productivity companion (German speaking).
                        
                        IMPORTANT RULES:
                        1. **Project-Aware**: You see the user's projects. Suggest tasks that move these projects forward.
                        2. **Conversation first**: Answer naturally.
                        3. **On-Demand Planning**: ONLY generate JSON if asked to "plan", "schedule", "suggest", "create", or "add".
                        4. **Quantity Control**: 
                           - If user asks for ONE thing -> 1 suggestion.
                           - If vague ("Plan my day") -> Up to 3 suggestions.
                        5. **Content Depth**: Description MUST be detailed.
                        
                        JSON Format (at end of response):
                        \`\`\`json
                        [
                          { "id": "...", "title": "...", "time": "HH:MM", "type": "work|admin|break|meeting|creative", "description": "Why this matters..." }
                        ]
                        \`\`\`
                    `;

                    // 3. Call Groq API
                    const completion = await groq.chat.completions.create({
                        messages: [
                            { role: "system", content: contextSystemPrompt },
                            ...messages.map(m => ({
                                role: m.role === 'ai' ? 'assistant' : 'user',
                                content: m.content
                            })) as any,
                            { role: "user", content: content }
                        ],
                        model: "llama-3.3-70b-versatile",
                    });

                    const text = completion.choices[0]?.message?.content || "";

                    // 4. Parse Response & Suggestions
                    let cleanText = text;
                    let suggestions: Suggestion[] = [];

                    const jsonBlock = text.match(/```json\n([\s\S]*?)\n```/);
                    if (jsonBlock && jsonBlock[1]) {
                        try {
                            suggestions = JSON.parse(jsonBlock[1]);
                            cleanText = text.replace(jsonBlock[0], '').trim();
                        } catch (e) {
                            console.error("Failed to parse JSON suggestions", e);
                        }
                    }

                    const aiMsg: Message = {
                        id: (Date.now() + 1).toString(),
                        role: 'ai',
                        content: cleanText,
                        suggestions,
                        timestamp: Date.now()
                    };

                    set(state => ({
                        messages: [...state.messages, aiMsg],
                        isGenerating: false
                    }));

                } catch (error) {
                    console.error("AI Error:", error);
                    let errorMessage = "Fehler bei der Verbindung.";
                    if (error instanceof Error) errorMessage = error.message;

                    set(state => ({
                        messages: [...state.messages, {
                            id: Date.now().toString(),
                            role: 'ai',
                            content: `Fehler: ${errorMessage}`,
                            timestamp: Date.now()
                        }],
                        isGenerating: false
                    }));
                }
            },

            addToTimeline: (suggestion) => {
                const { timeline, selectedDate } = get();
                // Ensure selectedDate is a Date object
                const date = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);
                const newItem: TimelineItem = {
                    id: Date.now().toString(),
                    time: suggestion.time,
                    title: suggestion.title,
                    type: suggestion.type,
                    status: 'planned',
                    date: toLocalDateString(date), // Format: YYYY-MM-DD
                    taskId: suggestion.taskId
                };
                // Simple sort by time
                const newTimeline = [...timeline, newItem].sort((a, b) => a.time.localeCompare(b.time));
                set({ timeline: newTimeline });
            },

            removeFromTimeline: (id) => {
                const { timeline } = get();
                const item = timeline.find(t => t.id === id);

                // If it's linked to a task, unschedule the task
                if (item?.taskId) {
                    const { updateTask } = useTaskStore.getState();
                    updateTask(item.taskId, { scheduledDate: undefined });
                }

                set(state => ({
                    timeline: state.timeline.filter(t => t.id !== id)
                }));
            },

            setSelectedDate: (date) => {
                set({ selectedDate: date });
            }
        }),
        {
            name: 'personal-cms-planner-storage',
            storage: {
                getItem: (name) => {
                    const str = localStorage.getItem(name);
                    if (!str) return null;
                    const data = JSON.parse(str);
                    // Convert selectedDate string back to Date object
                    if (data.state?.selectedDate) {
                        data.state.selectedDate = new Date(data.state.selectedDate);
                    }
                    return data;
                },
                setItem: (name, value) => {
                    localStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name) => {
                    localStorage.removeItem(name);
                }
            }
        }
    )
);
