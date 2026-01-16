"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, X } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";

interface DeleteConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    projectTitle: string;
}

export function DeleteConfirmDialog({ open, onClose, onConfirm, projectTitle }: DeleteConfirmDialogProps) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (open && contentRef.current) {
            gsap.from(contentRef.current, {
                scale: 0.9,
                opacity: 0,
                duration: 0.3,
                ease: "power2.out"
            });
        }
    }, { dependencies: [open], scope: dialogRef });

    const handleConfirm = () => {
        onConfirm();
        handleClose();
    };

    const handleClose = () => {
        if (contentRef.current) {
            gsap.to(contentRef.current, {
                scale: 0.9,
                opacity: 0,
                duration: 0.2,
                ease: "power2.in",
                onComplete: onClose
            });
        } else {
            onClose();
        }
    };

    if (!open) return null;

    return (
        <div
            ref={dialogRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
        >
            <div
                ref={contentRef}
                className="relative w-full max-w-md bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-red-500/30 rounded-2xl shadow-2xl backdrop-blur-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Projekt löschen?</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <p className="text-muted-foreground">
                        Bist du sicher, dass du das Projekt <span className="font-bold text-foreground">"{projectTitle}"</span> löschen möchtest?
                    </p>
                    <p className="text-sm text-red-400">
                        Diese Aktion kann nicht rückgängig gemacht werden. Alle zugehörigen Tasks bleiben erhalten.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-6 pt-0">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleClose}
                        className="flex-1"
                    >
                        Abbrechen
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirm}
                        className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                    >
                        Ja, löschen
                    </Button>
                </div>
            </div>
        </div>
    );
}
