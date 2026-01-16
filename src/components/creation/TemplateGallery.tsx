"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useCreationStore } from "@/lib/creation";
import { FileText, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export function TemplateGallery() {
    const { templates, selectedType, loadTemplate } = useCreationStore();

    const filteredTemplates = templates.filter(t => t.type === selectedType);

    return (
        <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white/70 mb-4">Templates</h3>

            <div className="space-y-2">
                {filteredTemplates.length === 0 ? (
                    <Card className="p-4 glass border-white/10 text-center">
                        <p className="text-xs text-white/50">
                            No templates available for this content type.
                        </p>
                    </Card>
                ) : (
                    filteredTemplates.map((template) => (
                        <Card
                            key={template.id}
                            className="p-3 glass border-white/10 hover:border-white/20 transition-all group cursor-pointer"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-4 h-4 text-blue-400" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-white mb-0.5">
                                        {template.name}
                                    </h4>
                                    <p className="text-xs text-white/50 line-clamp-2">
                                        {template.description}
                                    </p>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => loadTemplate(template.id)}
                                        className="mt-2 h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Eye className="w-3 h-3 mr-1" />
                                        Use Template
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
