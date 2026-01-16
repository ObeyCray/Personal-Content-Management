import { create } from 'zustand';
import type { ContentType } from '@/components/creation/ContentTypeSelector';
import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
});

interface Message {
    id: string;
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
}

interface Template {
    id: string;
    name: string;
    type: ContentType;
    content: string;
    description: string;
}

interface CreationState {
    messages: Message[];
    content: string;
    selectedType: ContentType;
    isGenerating: boolean;
    templates: Template[];

    setContent: (content: string) => void;
    setSelectedType: (type: ContentType) => void;
    sendMessage: (message: string) => Promise<void>;
    loadTemplate: (templateId: string) => void;
    clearChat: () => void;
}

// Default templates
const defaultTemplates: Template[] = [
    {
        id: 'blog-how-to',
        name: 'How-To Article',
        type: 'blog',
        description: 'Step-by-step guide template',
        content: `# How To [Title]

## Introduction
Brief introduction to what readers will learn and why it matters.

## Prerequisites
- Requirement 1
- Requirement 2

## Step 1: [First Step]
Detailed explanation...

## Step 2: [Second Step]
Detailed explanation...

## Conclusion
Summary of what was covered and next steps.
`
    },
    {
        id: 'video-tutorial',
        name: 'Tutorial Video',
        type: 'video',
        description: 'Educational video script',
        content: `# [Video Title]

## Hook (0:00-0:15)
Attention-grabbing opening

## Intro (0:15-0:30)
- Welcome
- What viewers will learn
- Subscribe CTA

## Main Content (0:30-5:00)
### Section 1
Content...

### Section 2
Content...

## Outro (5:00-5:30)
- Summary
- Next video teaser
- CTA
`
    },
    {
        id: 'social-thread',
        name: 'Twitter Thread',
        type: 'social',
        description: 'Engaging thread structure',
        content: `1/ [Hook Tweet]
Start with a bold statement or question that stops the scroll.

2/ [Context]
Provide background or set up the problem.

3/ [Main Point 1]
First key insight with value.

4/ [Main Point 2]
Second key insight.

5/ [Main Point 3]
Third key insight.

6/ [Conclusion]
Wrap it up with a CTA or question for engagement.
`
    },
    {
        id: 'newsletter-weekly',
        name: 'Weekly Newsletter',
        type: 'newsletter',
        description: 'Regular update format',
        content: `Subject: [Catchy Subject Line]

Hey [Name],

## This Week's Highlight
Main story or update...

## What I'm Working On
- Update 1
- Update 2

## Quick Tips
3 actionable tips...

## Worth Checking Out
- Link 1
- Link 2

Until next time,
[Your Name]
`
    },
    {
        id: 'docs-api',
        name: 'API Documentation',
        type: 'docs',
        description: 'Technical API docs',
        content: `# API Documentation

## Overview
Brief description of the API...

## Authentication
\`\`\`
Authorization: Bearer YOUR_API_KEY
\`\`\`

## Endpoints

### GET /endpoint
Description...

**Parameters:**
- \`param1\` (string): Description
- \`param2\` (number): Description

**Response:**
\`\`\`json
{
  "success": true,
  "data": {}
}
\`\`\`

## Rate Limits
Information about rate limits...
`
    },
    {
        id: 'podcast-episode',
        name: 'Episode Outline',
        type: 'podcast',
        description: 'Podcast structure',
        content: `# Episode [Number]: [Title]

## Pre-Show (5 min)
- Intro music
- Welcome
- Episode overview

## Segment 1: [Topic] (15 min)
Main points:
- Point 1
- Point 2

## Segment 2: [Topic] (15 min)
Main points:
- Point 1
- Point 2

## Q&A / Discussion (10 min)
Questions to address...

## Outro (5 min)
- Summary
- Next episode teaser
- Where to find us
`
    }
];

export const useCreationStore = create<CreationState>((set, get) => ({
    messages: [],
    content: '',
    selectedType: 'blog',
    isGenerating: false,
    templates: defaultTemplates,

    setContent: (content) => set({ content }),

    setSelectedType: (type) => {
        set({ selectedType: type });
        // Optionally filter templates or provide suggestions
    },

    sendMessage: async (message: string) => {
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: message,
            timestamp: new Date()
        };

        set((state) => ({
            messages: [...state.messages, userMessage],
            isGenerating: true
        }));

        try {
            const currentType = get().selectedType;
            const currentContent = get().content;

            // Build context for AI
            const systemPrompt = `Du bist ein hilfreicher Content Creation Assistent. 
Der Benutzer erstellt gerade ${currentType} Content.

Deine Aufgaben:
1. Hilf beim Brainstorming von Ideen
2. Unterstütze bei der Strukturierung
3. Gib Feedback zu bestehendem Content
4. Schlage Verbesserungen vor
5. Antworte immer auf Deutsch

Aktueller Content-Typ: ${currentType}
${currentContent ? `Bisheriger Content:\n${currentContent}` : 'Noch kein Content erstellt.'}

Sei kreativ, hilfreich und konkret in deinen Vorschlägen.`;

            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    ...get().messages.map(m => ({
                        role: m.role === 'ai' ? 'assistant' : 'user',
                        content: m.content
                    })) as any,
                    { role: "user", content: message }
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.7,
            });

            const aiResponse = completion.choices[0]?.message?.content || 'Ich kann dir helfen, großartigen Content zu erstellen! Woran möchtest du arbeiten?';

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: aiResponse,
                timestamp: new Date()
            };

            set((state) => ({
                messages: [...state.messages, aiMessage],
                isGenerating: false
            }));

        } catch (error) {
            console.error('Chat error:', error);

            // Fallback response
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: getFallbackResponse(message, get().selectedType),
                timestamp: new Date()
            };

            set((state) => ({
                messages: [...state.messages, aiMessage],
                isGenerating: false
            }));
        }
    },

    loadTemplate: (templateId: string) => {
        const template = get().templates.find(t => t.id === templateId);
        if (template) {
            set({
                content: template.content,
                selectedType: template.type
            });
        }
    },

    clearChat: () => set({ messages: [] })
}));

// Fallback responses for when API is not available
function getFallbackResponse(userMessage: string, contentType: ContentType): string {
    const lower = userMessage.toLowerCase();

    if (lower.includes('hilfe') || lower.includes('help') || lower.includes('start')) {
        return `Super! Lass uns zusammen ${contentType === 'blog' ? 'einen' : 'ein'} ${contentType} erstellen. Ich kann dir helfen bei:

• Ideen und Themen entwickeln
• Content strukturieren
• Überzeugenden Text schreiben
• Für deine Zielgruppe optimieren

Womit möchtest du anfangen?`;
    }

    if (lower.includes('template') || lower.includes('vorlage')) {
        return `Ich habe mehrere Templates für ${contentType}. Schau in der Template-Galerie rechts, um alle Optionen zu sehen. Soll ich dir das beste Template für deine Bedürfnisse vorschlagen?`;
    }

    if (lower.includes('idee') || lower.includes('idea') || lower.includes('thema') || lower.includes('topic')) {
        const suggestions = {
            blog: '• "10 Lektionen, die ich gelernt habe..."\n• "Der komplette Guide zu..."\n• "Warum [Thema] alles verändert..."',
            video: '• Tutorial: "Wie man..."\n• "X vs Y: Was ist besser?"\n• "Mein Prozess für..."',
            social: '• "Thread: Alles über..."\n• "Heiße Meinung:..."\n• "Was dir niemand über... sagt"',
            newsletter: '• "Diese Woche in [Deine Nische]"\n• "5 Ressourcen, die du brauchst"\n• "Behind the Scenes: Meine Woche"',
            docs: '• "Einstiegs-Guide"\n• "API-Referenz"\n• "Best Practices"',
            podcast: '• "Interview mit..."\n• "Deep Dive: [Thema]"\n• "Q&A Episode"'
        };

        return `Hier sind einige ${contentType} Ideen:\n\n${suggestions[contentType] || suggestions.blog}\n\nWelche Richtung interessiert dich am meisten?`;
    }

    return `Ich bin hier, um dir bei der Erstellung von großartigem ${contentType}-Content zu helfen! Ich kann dich beim Brainstorming, Strukturieren, Schreiben und Optimieren unterstützen. Woran möchtest du arbeiten?`;
}
