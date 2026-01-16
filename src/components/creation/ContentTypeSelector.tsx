"use client";

import { FileText, Video, MessageSquare, Mail, BookOpen, Mic2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ContentType = 'blog' | 'video' | 'social' | 'newsletter' | 'docs' | 'podcast';

interface ContentTypeOption {
    id: ContentType;
    label: string;
    description: string;
    icon: typeof FileText;
    color: string;
}

const contentTypes: ContentTypeOption[] = [
    {
        id: 'blog',
        label: 'Blog Post',
        description: 'Langer Artikel',
        icon: FileText,
        color: 'from-blue-500 to-cyan-500'
    },
    {
        id: 'video',
        label: 'Video Script',
        description: 'YouTube/Video content',
        icon: Video,
        color: 'from-red-500 to-pink-500'
    },
    {
        id: 'social',
        label: 'Social Media',
        description: 'Thread oder Posts',
        icon: MessageSquare,
        color: 'from-purple-500 to-pink-500'
    },
    {
        id: 'newsletter',
        label: 'Newsletter',
        description: 'Email-Kampagne',
        icon: Mail,
        color: 'from-orange-500 to-yellow-500'
    },
    {
        id: 'docs',
        label: 'Documentation',
        description: 'Technische Guides',
        icon: BookOpen,
        color: 'from-green-500 to-emerald-500'
    },
    {
        id: 'podcast',
        label: 'Podcast Notes',
        description: 'Episode Outline',
        icon: Mic2,
        color: 'from-indigo-500 to-blue-500'
    }
];

interface ContentTypeSelectorProps {
    selected: ContentType;
    onSelect: (type: ContentType) => void;
}

export function ContentTypeSelector({ selected, onSelect }: ContentTypeSelectorProps) {
    return (
        <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white/70 mb-4">Content Type</h3>
            <div className="grid grid-cols-2 gap-2">
                {contentTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selected === type.id;

                    return (
                        <button
                            key={type.id}
                            onClick={() => onSelect(type.id)}
                            className={cn(
                                "group relative p-3 rounded-xl transition-all text-left",
                                "border backdrop-blur-sm",
                                isSelected
                                    ? "bg-white/10 border-white/20 shadow-lg"
                                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/15"
                            )}
                        >
                            <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center mb-2",
                                "bg-gradient-to-br",
                                type.color,
                                isSelected ? "opacity-100" : "opacity-70 group-hover:opacity-90"
                            )}>
                                <Icon className="w-4 h-4 text-white" />
                            </div>
                            <div className="text-xs font-medium text-white mb-0.5">
                                {type.label}
                            </div>
                            <div className="text-[10px] text-white/50">
                                {type.description}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
