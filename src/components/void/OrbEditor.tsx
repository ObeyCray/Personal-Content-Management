"use client";

import { useState, useEffect } from "react";
import { X, Trash2, Tag, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

interface OrbEditorProps {
    node: { id: string, label: string, tags: string[], r: number };
    onClose: () => void;
    onSave: (id: string, updates: Partial<{ label: string, tags: string[], r: number }>) => void;
    onDelete: (id: string) => void;
}

export function OrbEditor({ node, onClose, onSave, onDelete }: OrbEditorProps) {
    const [label, setLabel] = useState(node.label);
    const [tags, setTags] = useState(node.tags.join(", "));

    // Reset state when node changes
    useEffect(() => {
        setLabel(node.label);
        setTags(node.tags.join(", "));
    }, [node]);

    const handleSave = () => {
        const tagArray = tags.split(",").map(t => t.trim()).filter(t => t.length > 0);
        onSave(node.id, {
            label,
            tags: tagArray
        });
        onClose();
    };

    return (
        <div className="absolute top-4 right-4 z-[60] w-80 animate-in slide-in-from-right duration-300">
            <Card className="glass border-white/10 shadow-2xl backdrop-blur-xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Edit Idea</CardTitle>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-muted-foreground hover:text-white">
                        <X className="w-4 h-4" />
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <label className="text-xs text-muted-foreground font-medium">Concept / Title</label>
                        <Input
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            className="bg-black/20 border-white/10 focus:border-purple-500/50"
                            placeholder="Enter idea name..."
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                            <Tag className="w-3 h-3" /> Tags (comma separated)
                        </label>
                        <Input
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="bg-black/20 border-white/10"
                            placeholder="ai, video, design..."
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button onClick={handleSave} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
                            <Save className="w-4 h-4 mr-2" /> Save
                        </Button>
                        <Button
                            variant="glass"
                            onClick={() => {
                                if (confirm("Delete this orb?")) {
                                    onDelete(node.id);
                                    onClose();
                                }
                            }}
                            className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
