"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Send, Sparkles, Plus, Zap, Target, Calendar, Trophy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useTaskStore } from "@/lib/tasks";
import type { Task } from "@/lib/tasks";
import type { Project } from "@/lib/projects";
import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
});

interface Message {
    id: string;
    role: 'user' | 'ai';
    content: string;
    tasks?: TaskSuggestion[];
    timestamp: number;
}

interface TaskSuggestion {
    id: string;
    title: string;
    time: string;
    xp: number;
    isMilestone?: boolean;
    isSubTask?: boolean; // NEW: indicates if this should be a sub-task
}

interface ProjectAIPlannerProps {
    project: Project;
    existingTasks: any[];
    focusedTask?: Task | null; // Optional: Task to discuss and create sub-tasks for
    onClearFocus?: () => void; // Callback to clear focused task
}

const QUICK_ACTIONS = [
    { label: "3 Tasks für heute", prompt: "Gib mir 3 konkrete Tasks die ich heute erledigen kann" },
    { label: "Nächster Meilenstein", prompt: "Was sollte der nächste große Meilenstein sein?" },
    { label: "Wochenplan", prompt: "Erstelle einen Wochenplan mit Tasks" },
    { label: "Quick Wins", prompt: "Welche schnellen Erfolge kann ich jetzt erreichen?" }
];

export function ProjectAIPlanner({ project, existingTasks, focusedTask = null, onClearFocus }: ProjectAIPlannerProps) {
    const pendingTasks = existingTasks.filter(t => t.status === 'pending');
    const completedTasks = existingTasks.filter(t => t.status === 'completed');

    // Load messages from localStorage for this specific project
    const getStoredMessages = (): Message[] => {
        try {
            const stored = localStorage.getItem(`ai-chat-${project.id}`);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error('Failed to load chat history', e);
        }
        return [{
            id: 'welcome',
            role: 'ai',
            content: `Hey! 👋 Ich bin dein AI Assistent für **${project.title}**.\n\n📊 **Status**: ${project.progress}% abgeschlossen\n📝 **Tasks**: ${completedTasks.length}/${existingTasks.length} erledigt\n${project.deadline ? `📅 **Deadline**: ${new Date(project.deadline).toLocaleDateString('de-DE')}` : ''}\n\nWas möchtest du heute erreichen?`,
            timestamp: Date.now()
        }];
    };

    const [messages, setMessages] = useState<Message[]>(getStoredMessages());
    const [input, setInput] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [addingTaskId, setAddingTaskId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { addTask } = useTaskStore();

    // Save messages to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem(`ai-chat-${project.id}`, JSON.stringify(messages));
        } catch (e) {
            console.error('Failed to save chat history', e);
        }
    }, [messages, project.id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isGenerating]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Escape to focus input
            if (e.key === 'Escape') {
                const inputElement = document.querySelector<HTMLInputElement>(`input[placeholder*="${project.title}"]`);
                inputElement?.focus();
            }

            // Ctrl+K to clear chat
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (confirm('Chat-Verlauf wirklich löschen?')) {
                    localStorage.removeItem(`ai-chat-${project.id}`);
                    setMessages([{
                        id: 'welcome',
                        role: 'ai',
                        content: `Hey! 👋 Ich bin dein AI Assistent für **${project.title}**.\n\n📊 **Status**: ${project.progress}% abgeschlossen\n📝 **Tasks**: ${completedTasks.length}/${existingTasks.length} erledigt\n${project.deadline ? `📅 **Deadline**: ${new Date(project.deadline).toLocaleDateString('de-DE')}` : ''}\n\nWas möchtest du heute erreichen?`,
                        timestamp: Date.now()
                    }]);
                    toast.success('Chat-Verlauf gelöscht');
                }
            }

            // Ctrl+E to export
            if ((e.ctrlKey || e.metaKey) && e.key === 'e' && messages.length > 1) {
                e.preventDefault();
                const markdown = messages.map(m =>
                    `**${m.role === 'ai' ? 'AI' : 'Du'}** (${new Date(m.timestamp).toLocaleString('de-DE')})\n${m.content}\n---\n`
                ).join('\n');

                const blob = new Blob([markdown], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${project.title}-chat-${Date.now()}.md`;
                a.click();
                toast.success('Chat exportiert!');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [messages, project, completedTasks, existingTasks]);

    const handleSend = async (message?: string) => {
        const messageToSend = message || input.trim();
        if (!messageToSend || isGenerating) return;

        // Helper function to get sub-tasks for focused task
        const getSubTasksForFocused = () => {
            if (!focusedTask) return '';
            const subTasks = existingTasks.filter(t => t.parentTaskId === focusedTask.id);
            if (subTasks.length === 0) return '  (keine Sub-Tasks vorhanden)';
            return subTasks.map(t => `  - ${t.title} | ${t.status} | ${t.xp} XP`).join('\n');
        };

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: messageToSend,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsGenerating(true);

        try {
            const contextSystemPrompt = `
                Du bist ein AI Assistent für Projekt-Management (Deutsch).
                
                🎯 AKTUELLES PROJEKT:
                - **Titel**: "${project.title}"
                - **Beschreibung**: "${project.description}"
                - **Ziel/Vision**: Was soll mit diesem Projekt erreicht werden?
                - **Status**: ${project.status}
                - **Fortschritt**: ${project.progress}%
                - **Deadline**: ${project.deadline ? new Date(project.deadline).toLocaleDateString('de-DE') : 'Keine'}
                
                📋 EXISTIERENDE TASKS (${existingTasks.length} gesamt):
                Offen (${pendingTasks.length}):
                ${pendingTasks.map(t => `  - ${t.title} | ${t.time} | ${t.xp} XP${t.isMilestone ? ' 🏆' : ''}`).join('\n') || '  (keine)'}
                
                Erledigt (${completedTasks.length}):
                ${completedTasks.slice(0, 3).map(t => `  - ${t.title}`).join('\n') || '  (keine)'}
                
                🎯 DEINE HAUPTAUFGABE:
                - Verstehe das ENDZIEL des Projekts aus Titel + Beschreibung
                - Erstelle Tasks, die SYSTEMATISCH zum Projektabschluss führen
                - Berücksichtige was BEREITS erledigt ist
                - Identifiziere die NÄCHSTEN log ischen Schritte
                - Schlage Tasks vor, die das Projekt von ${project.progress}% auf 100% bringen
                
                ${focusedTask ? `
                🎯🎯🎯 FOKUSSIERTER TASK-MODUS:
                Der User möchte über diesen SPEZIFISCHEN TASK sprechen:
                - **Titel**: "${focusedTask.title}"
                - **Status**: ${focusedTask.status}
                - **XP**: ${focusedTask.xp}
                - **Priorität**: ${focusedTask.time}
                
                Existierende Sub-Tasks für diesen Task:
                ${getSubTasksForFocused()}
                
                ⚠️ WICHTIG - SUB-TASK MODUS:
                1. Wenn du Tasks erstellst, erstelle NUR Sub-Tasks für "${focusedTask.title}"
                2. Setze "isSubTask": true im JSON
                3. Sub-Tasks müssen KONKRETE Schritte sein, um "${focusedTask.title}" zu vollenden
                4. KEINE neuen Haupt-Tasks erstellen
                5. Zerlege "${focusedTask.title}" in 2-5 umsetzbare Schritte
                ` : ''}
                
                ⚠️ WICHTIGE EINSCHRÄNKUNG:
                - Du bist NUR für dieses eine Projekt "${project.title}" zuständig
                - Du kennst KEINE anderen Projekte des Users
                - Wenn nach "allen Projekten" oder "anderen Projekten" gefragt wird:
                  → Antworte: "Ich bin nur für '${project.title}' zuständig. Für eine Übersicht aller Projekte gehe bitte zur Projekte-Seite oder nutze den globalen AI Planner."
                
                💡 WICHTIGE REGELN:
                1. **Projekt-Fokus**: Alle Vorschläge müssen DIREKT zu "${project.title}" passen
                2. **Kontextbewusst**: Lese die GESAMTE Konversation und baue darauf auf - WIEDERHOLE NIE bereits vorgeschlagene Tasks!
                3. **Sei EXTREM KONKRET**: Tasks müssen eine KLARE, MESSBARE Aktion sein
                4. **Umsetzbar**: Tasks müssen in 5-60 Minuten machbar sein
                5. **Task-Generierung**: 
                   - NUR wenn User explizit nach Tasks fragt ("gib mir tasks", "erstelle aufgaben", etc.)
                   - NICHT bei Fragen, Diskussionen oder wenn User nur Ideen austauscht
                   - NICHT wiederholen was schon vorgeschlagen wurde
                6. **Menge**: 
                   - Bei "schnell"/"quick" → 1-2 sehr konkrete Tasks
                   - Bei "heute" → 2-3 spezifische Tasks
                   - Bei "Woche" → 3-5 Tasks
                   - Bei Meilenstein → 1 großer, konkreter Task
                
                🚫 ABSOLUT VERBOTENE TASK-TYPEN:
                VERWENDE NIEMALS diese Wörter in Tasks (User findet sie "nicht zielführend"):
                
                ❌ "Themenwahl" 
                ❌ "Konzeption" / "Konzept erstellen"
                ❌ "Brainstorming"
                ❌ "Planung" / "planen"
                ❌ "Drehbuch erstellen"
                ❌ "Produktionsplanung"
                ❌ "Strategie entwickeln"
                ❌ "Ideen generieren"
                ❌ "Recherche" (allgemein)
                ❌ Jede Task die nur aus 1-2 Wörtern + "für [Projekt]" besteht
                
                ✅ STATTDESSEN - SEI ULTRA-SPEZIFISCH:
                
                FALSCH: "Themenwahl für virales Video"
                RICHTIG: "5 Tech-News der letzten 2 Tage auf Reddit/r/technology checken"
                
                FALSCH: "Konzeption für virales Video"
                RICHTIG: "3-Punkte-Outline: Problem → Lösung → CTA für 8-Min-Video"
                
                FALSCH: "Drehbuch erstellen"
                RICHTIG: "Hook-Script schreiben: Erste 15 Sekunden mit 3 Fragen"
                
                FALSCH: "Produktionsplanung"
                RICHTIG: "Equipment-Checklist: Kamera, Mikro, Licht, SD-Karten"
                
                FALSCH: "Video-Editing"
                RICHTIG: "Intro schneiden: Logo-Animation + Musik (0:00-0:05)"
                
                FALSCH: "3 Ideen generieren"
                RICHTIG: "3 TikTok-Trends auf FYP analysieren und für YouTube adaptieren"
                
                7. **XP-System**: 
                   - Sehr kleine Tasks (5-15 Min): 50-75 XP
                   - Kleine Tasks (15-30 Min): 100-150 XP
                   - Mittlere Tasks (30-60 Min): 200-300 XP
                   - Große Tasks (1-2 Std): 400-600 XP
                   - Meilensteine: 800-1000 XP
                8. **Prioritäten**:
                   - Dringend/wichtig → "Hohe Prio" oder "Heute"
                   - Normal → "Diese Woche"
                   - Groß → "Nächste Woche"
                   - Meilensteine → "Meilenstein"
                
                BEISPIELE FÜR GOAL-ORIENTED TASKS (YouTube Projekt "Viraler Kanal"):
                
                📍 Phase 1 - Foundation (0-30%):
                ✅ "Nische festlegen: Top 3 profitable YouTube-Kategorien analysieren"
                ✅ "Kanal-Branding: Logo + Banner in Canva erstellen"
                ✅ "Equipment-Liste erstellen: Kamera, Mikro, Licht (Budget 500€)"
                
                📍 Phase 2 - Content Creation (30-60%):
                ✅ "Erstes Video: Hook-Script für 10 Sekunden schreiben"
                ✅ "5 Thumbnail-Varianten A/B-testen"
                ✅ "SEO: Top 20 Keywords für [Nische] finden (TubeBuddy)"
                
                📍 Phase 3 - Launch & Growth (60-100%):
                ✅ "Video hochladen + optimieren (Titel, Tags, Beschreibung)"
                ✅ "Community aufbauen: Erste 100 Abonnenten-Strategie"
                ✅ "Meilenstein: Erstes virales Video (100K Views) analysieren"
                
                BEISPIELE FÜR SCHLECHTE TASKS:
                ❌ "Brainstorming für Video-Ideen" (zu vage)
                ❌ "Drehbuch erstellen" (zu generisch)
                ❌ "Planung machen" (nicht umsetzbar)
                ❌ "Konzeption" (zu abstrakt)
                ❌ "Herausforderung auswählen" (keine konkrete Aktion)
                
                JSON Format (nur am Ende wenn Tasks erstellt werden):
                \`\`\`json
                [
                  {
                    "id": "task-unique-id",
                    "title": "Präziser Task-Titel",
                    "time": "Hohe Prio|Heute|Morgen|Diese Woche|Nächste Woche|Meilenstein",
                    "xp": 150,
                    "isMilestone": false
                  }
                ]
                \`\`\`
            `;

            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: contextSystemPrompt },
                    ...messages.map(m => ({
                        role: m.role === 'ai' ? 'assistant' : 'user',
                        content: m.content
                    })) as any,
                    { role: "user", content: messageToSend }
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.3, // Very low temperature for strict rule-following
            });

            const text = completion.choices[0]?.message?.content || "";
            let cleanText = text;
            let tasks: TaskSuggestion[] = [];

            const jsonBlock = text.match(/```json\n([\s\S]*?)\n```/);
            if (jsonBlock && jsonBlock[1]) {
                try {
                    tasks = JSON.parse(jsonBlock[1]);
                    cleanText = text.replace(jsonBlock[0], '').trim();
                } catch (e) {
                    console.error("Failed to parse JSON tasks", e);
                }
            }

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: cleanText,
                tasks,
                timestamp: Date.now()
            };

            setMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            console.error("AI Error:", error);
            let errorMessage = 'Verbindungsproblem. Bitte nochmal versuchen.';

            if (error instanceof Error) {
                if (error.message.includes('API key')) {
                    errorMessage = '❌ API-Schlüssel fehlt oder ungültig. Bitte GROQ API Key in .env setzen.';
                } else if (error.message.includes('rate limit')) {
                    errorMessage = '⏳ Rate Limit erreicht. Bitte warte kurz und versuche es erneut.';
                } else if (error.message.includes('network')) {
                    errorMessage = '🌐 Netzwerkfehler. Bitte Internetverbindung prüfen.';
                } else {
                    errorMessage = `❌ Fehler: ${error.message}`;
                }
            }

            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'ai',
                content: errorMessage,
                timestamp: Date.now()
            }]);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAddTask = (task: TaskSuggestion) => {
        setAddingTaskId(task.id);

        // Check if this should be a sub-task
        if (task.isSubTask && focusedTask) {
            // Add as sub-task using addSubTask
            const { addSubTask } = useTaskStore.getState();
            addSubTask(focusedTask.id, {
                title: task.title,
                time: task.time,
                xp: task.xp,
                projectId: project.id,
                isMilestone: task.isMilestone
            });
            toast.success(`✅ Sub-Task "${task.title}" zu "${focusedTask.title}" hinzugefügt!`);
        } else {
            // Add as regular task
            addTask({
                title: task.title,
                time: task.time,
                xp: task.xp,
                projectId: project.id,
                isMilestone: task.isMilestone
            });
            toast.success(`✅ "${task.title}" hinzugefügt!`);
        }

        // Reset loading state after animation
        setTimeout(() => {
            setAddingTaskId(null);
        }, 1000);
    };

    return (
        <div className="flex flex-col h-[550px]">
            {/* Focus Banner */}
            {focusedTask && (
                <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-l-4 border-blue-500 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold flex items-center gap-2">
                            🎯 Fokus: {focusedTask.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            AI erstellt Sub-Tasks für diesen Task ({focusedTask.xp} XP | {focusedTask.time})
                        </p>
                    </div>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (onClearFocus) {
                                onClearFocus();
                            }
                        }}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/10 rounded-lg transition-all"
                        title="Fokus beenden"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Quick Actions */}
            <div className="p-4 border-b border-white/10 bg-black/20">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground">Quick Actions:</p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                // Export chat as markdown
                                const markdown = messages.map(m =>
                                    `**${m.role === 'ai' ? 'AI' : 'Du'}** (${new Date(m.timestamp).toLocaleString('de-DE')})\n${m.content}\n---\n`
                                ).join('\n');

                                const blob = new Blob([markdown], { type: 'text/markdown' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${project.title}-chat-${Date.now()}.md`;
                                a.click();
                                toast.success('Chat exportiert!');
                            }}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                            title="Chat als Markdown exportieren"
                        >
                            💾 Export
                        </button>
                        <button
                            onClick={() => {
                                if (confirm('Chat-Verlauf wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
                                    localStorage.removeItem(`ai-chat-${project.id}`);
                                    setMessages([{
                                        id: 'welcome',
                                        role: 'ai',
                                        content: `Hey! 👋 Ich bin dein AI Assistent für **${project.title}**.\n\n📊 **Status**: ${project.progress}% abgeschlossen\n📝 **Tasks**: ${completedTasks.length}/${existingTasks.length} erledigt\n${project.deadline ? `📅 **Deadline**: ${new Date(project.deadline).toLocaleDateString('de-DE')}` : ''}\n\nWas möchtest du heute erreichen?`,
                                        timestamp: Date.now()
                                    }]);
                                    toast.success('Chat-Verlauf gelöscht');
                                }
                            }}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                            title="Chat-Verlauf löschen"
                        >
                            🗑️ Löschen
                        </button>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {QUICK_ACTIONS.map((action) => (
                        <button
                            key={action.label}
                            onClick={() => handleSend(action.prompt)}
                            disabled={isGenerating}
                            className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Messages */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto space-y-4 p-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
            >
                {messages.map((m) => (
                    <div key={m.id} className={`flex flex-col ${m.role === 'ai' ? 'items-start' : 'items-end'} group`}>
                        <div className={`max-w-[90%] p-4 rounded-xl shadow-lg relative ${m.role === 'ai'
                            ? 'bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-tl-none'
                            : 'bg-gradient-to-br from-primary/90 to-primary text-primary-foreground rounded-tr-none'
                            }`}>
                            {m.role === 'ai' && (
                                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-purple-300">
                                    <Sparkles className="w-4 h-4" />
                                    AI Projekt-Assistent
                                </div>
                            )}
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>

                            {/* Message Actions */}
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(m.content);
                                        toast.success('In Zwischenablage kopiert!');
                                    }}
                                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                                    title="Kopieren"
                                >
                                    📋 Kopieren
                                </button>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(m.timestamp).toLocaleTimeString('de-DE', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        </div>

                        {/* Enhanced Task Suggestions */}
                        {m.tasks && m.tasks.length > 0 && (
                            <div className="mt-3 space-y-2 w-full max-w-[90%]">
                                <p className="text-xs text-muted-foreground px-1">
                                    💡 {m.tasks.length} Task{m.tasks.length > 1 ? 's' : ''} vorgeschlagen:
                                </p>
                                {m.tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="group relative p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-primary/40 hover:from-white/10 hover:to-white/5 transition-all"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Target className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                                    <h4 className="font-medium text-sm truncate">{task.title}</h4>
                                                    {task.isMilestone && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full whitespace-nowrap">
                                                            <Trophy className="w-3 h-3" />
                                                            Meilenstein
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {task.time}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Zap className="w-3 h-3 text-yellow-400" />
                                                        {task.xp} XP
                                                    </span>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                className={`flex-shrink-0 gap-1.5 transition-all ${addingTaskId === task.id
                                                    ? 'bg-emerald-500 hover:bg-emerald-600 scale-95'
                                                    : ''
                                                    }`}
                                                onClick={() => handleAddTask(task)}
                                                disabled={addingTaskId === task.id}
                                            >
                                                {addingTaskId === task.id ? (
                                                    <>
                                                        <CheckCircle2 className="w-4 h-4 animate-in zoom-in" />
                                                        Hinzugefügt!
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className="w-4 h-4" />
                                                        Hinzufügen
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {isGenerating && (
                    <div className="flex items-start">
                        <div className="bg-purple-500/10 border border-purple-500/20 px-4 py-3 rounded-xl rounded-tl-none flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-4 bg-gradient-to-t from-black/40 to-black/20 backdrop-blur-md border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                            {messages.length} Nachricht{messages.length !== 1 ? 'en' : ''} im Verlauf
                        </p>
                        <div className="group relative">
                            <button className="text-xs text-muted-foreground hover:text-primary transition-colors">
                                ⌨️
                            </button>
                            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-black/90 text-white text-xs rounded-lg p-2 whitespace-nowrap z-50">
                                <div className="font-semibold mb-1">Keyboard Shortcuts:</div>
                                <div>Esc - Focus input</div>
                                <div>Ctrl+K - Clear chat</div>
                                <div>Ctrl+E - Export chat</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {input.length > 0 && (
                            <span className={`text-xs ${input.length > 400 ? 'text-red-400' :
                                input.length > 300 ? 'text-orange-400' :
                                    'text-muted-foreground'
                                }`}>
                                {input.length}/500
                            </span>
                        )}
                        {isGenerating && (
                            <p className="text-xs text-purple-400 animate-pulse">AI denkt nach...</p>
                        )}
                    </div>
                </div>
                <div className="flex gap-2 relative">
                    <Input
                        placeholder={`Frag mich über "${project.title}"...`}
                        value={input}
                        onChange={(e) => setInput(e.target.value.slice(0, 500))}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        className="bg-white/5 border-white/10 focus-visible:ring-primary/50 pr-12 h-11"
                        disabled={isGenerating}
                    />
                    <Button
                        onClick={() => handleSend()}
                        disabled={isGenerating || !input.trim()}
                        size="icon"
                        className="absolute right-1 top-1 h-9 w-9 bg-gradient-to-br from-primary to-primary/80 hover:from-primary hover:to-primary shadow-lg"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
