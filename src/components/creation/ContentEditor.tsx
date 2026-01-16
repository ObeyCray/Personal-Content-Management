"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useCreationStore } from "@/lib/creation";
import { cn } from "@/lib/utils";

export function ContentEditor() {
    const { content, setContent } = useCreationStore();
    const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

    const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;
    const charCount = content.length;

    return (
        <Card className="flex flex-col h-full glass border-white/10 overflow-hidden">
            {/* Header with tabs */}
            <div className="p-3 border-b border-white/10 bg-black/20 flex items-center justify-between flex-shrink-0">
                <div className="inline-flex h-9 items-center justify-center rounded-lg bg-white/5 p-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab('edit')}
                        className={cn(
                            "text-xs px-3 py-1.5 rounded-md h-auto",
                            activeTab === 'edit'
                                ? "bg-primary text-primary-foreground shadow"
                                : "text-white/70 hover:text-white hover:bg-transparent"
                        )}
                    >
                        Editor
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab('preview')}
                        className={cn(
                            "text-xs px-3 py-1.5 rounded-md h-auto",
                            activeTab === 'preview'
                                ? "bg-primary text-primary-foreground shadow"
                                : "text-white/70 hover:text-white hover:bg-transparent"
                        )}
                    >
                        Preview
                    </Button>
                </div>

                <div className="flex gap-4 text-xs text-white/50">
                    <span>{wordCount} Wörter</span>
                    <span>{charCount} Zeichen</span>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">
                {/* Editor Tab */}
                {activeTab === 'edit' && (
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Beginne hier mit dem Schreiben...

Du kannst Markdown verwenden:
# Überschrift
## Unterüberschrift
- Listenpunkt
**fett** *kursiv*
[Link](url)"
                        className={cn(
                            "w-full h-full p-6 bg-transparent text-white/90",
                            "resize-none outline-none font-mono text-sm leading-relaxed",
                            "placeholder:text-white/30",
                            "scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                        )}
                    />
                )}

                {/* Preview Tab */}
                {activeTab === 'preview' && (
                    <div className="w-full h-full overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {content ? (
                            <div className="prose prose-invert prose-sm max-w-none">
                                <MarkdownPreview content={content} />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-white/30 text-sm">
                                Noch nichts zu zeigen. Fang an zu schreiben!
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}

// Simple markdown preview component
function MarkdownPreview({ content }: { content: string }) {
    const lines = content.split('\n');

    return (
        <>
            {lines.map((line, i) => {
                // Headings
                if (line.startsWith('### ')) {
                    return <h3 key={i} className="text-lg font-semibold mt-4 mb-2">{line.replace('### ', '')}</h3>;
                }
                if (line.startsWith('## ')) {
                    return <h2 key={i} className="text-xl font-bold mt-6 mb-3">{line.replace('## ', '')}</h2>;
                }
                if (line.startsWith('# ')) {
                    return <h1 key={i} className="text-2xl font-bold mt-8 mb-4">{line.replace('# ', '')}</h1>;
                }

                // Lists
                if (line.startsWith('- ') || line.startsWith('* ')) {
                    return <li key={i} className="ml-4">{formatInline(line.substring(2))}</li>;
                }

                // Code blocks
                if (line.startsWith('```')) {
                    return null; // Simple preview, skip code blocks for now
                }

                // Empty lines
                if (line.trim() === '') {
                    return <br key={i} />;
                }

                // Regular paragraphs
                return <p key={i} className="mb-3">{formatInline(line)}</p>;
            })}
        </>
    );
}

function formatInline(text: string): React.ReactNode {
    let result = text;

    // Bold
    result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic
    result = result.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Links
    result = result.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>');

    return <span dangerouslySetInnerHTML={{ __html: result }} />;
}
