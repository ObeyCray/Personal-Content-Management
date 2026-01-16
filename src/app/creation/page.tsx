"use client";

import { useState } from "react";
import { ContentEditor } from "@/components/creation/ContentEditor";
import { ContentTypeSelector } from "@/components/creation/ContentTypeSelector";
import { TemplateGallery } from "@/components/creation/TemplateGallery";
import { FloatingChat } from "@/components/creation/FloatingChat";
import { Button } from "@/components/ui/Button";
import { useCreationStore } from "@/lib/creation";
import { useProjectStore } from "@/lib/projects";
import { Download, Save, FolderKanban } from "lucide-react";
import { toast } from "sonner";
import { ProjectSelector } from "@/components/creation/ProjectSelector";
import type { ContentType } from "@/components/creation/ContentTypeSelector";

export default function CreationWorkspace() {
    const { content, selectedType, setSelectedType } = useCreationStore();
    const { addContentToProject } = useProjectStore();
    const [projectSelectorOpen, setProjectSelectorOpen] = useState(false);

    const handleExport = () => {
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedType}-${Date.now()}.md`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Content exported successfully!');
    };

    const handleSave = () => {
        localStorage.setItem(`creation-${selectedType}-draft`, content);
        toast.success('Draft saved!');
    };

    const handleSaveToProject = (projectId: string) => {
        if (!content.trim()) {
            toast.error('Cannot save empty content');
            return;
        }

        const titleMatch = content.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1] : `${selectedType} - ${new Date().toLocaleDateString()}`;

        addContentToProject(projectId, {
            title,
            content,
            type: selectedType
        });

        toast.success('Content saved to project!');
        setProjectSelectorOpen(false);
    };

    return (
        <div className="w-full h-screen bg-[#0a0a0f] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/20 backdrop-blur-sm flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white">Creation Workspace</h1>
                        <p className="text-xs text-white/50">AI-powered content creation</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSave}
                        className="glass border-white/10 hover:bg-white/10"
                        disabled={!content}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Save Draft
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setProjectSelectorOpen(true)}
                        className="glass border-white/10 hover:bg-white/10"
                        disabled={!content}
                    >
                        <FolderKanban className="w-4 h-4 mr-2" />
                        Save to Project
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        onClick={handleExport}
                        className="bg-primary hover:bg-primary/90"
                        disabled={!content}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex gap-4 p-6 overflow-hidden">
                {/* Center - Content Editor (now wider) */}
                <div className="flex-1 min-w-0">
                    <ContentEditor />
                </div>

                {/* Right Sidebar - Templates & Tools */}
                <div className="w-80 flex-shrink-0 flex flex-col gap-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <ContentTypeSelector
                        selected={selectedType}
                        onSelect={(type: ContentType) => setSelectedType(type)}
                    />
                    <TemplateGallery />
                </div>
            </div>

            {/* Floating Chat Widget */}
            <FloatingChat />

            {/* Project Selector Modal */}
            <ProjectSelector
                open={projectSelectorOpen}
                onClose={() => setProjectSelectorOpen(false)}
                onSelect={handleSaveToProject}
            />
        </div>
    );
}
