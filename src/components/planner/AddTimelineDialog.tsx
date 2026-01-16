"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { usePlannerStore, TimeBlockType } from "@/lib/planner";
import { toast } from "sonner";

interface AddTimelineDialogProps {
    selectedDate: Date;
}

export function AddTimelineDialog({ selectedDate }: AddTimelineDialogProps) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [time, setTime] = useState("09:00");
    const [type, setType] = useState<TimeBlockType>("work");

    const addToTimeline = usePlannerStore(state => state.addToTimeline);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error("Bitte gib einen Titel ein");
            return;
        }

        // Add to timeline using the existing function
        addToTimeline({
            id: Date.now().toString(),
            title,
            time,
            type,
            description: ""
        });

        toast.success(`"${title}" zur Timeline hinzugefügt`);

        // Reset form
        setTitle("");
        setTime("09:00");
        setType("work");
        setOpen(false);
    };

    const typeOptions: { value: TimeBlockType; label: string; color: string }[] = [
        { value: "work", label: "Arbeit", color: "bg-blue-500" },
        { value: "creative", label: "Kreativ", color: "bg-purple-500" },
        { value: "admin", label: "Admin", color: "bg-gray-500" },
        { value: "meeting", label: "Meeting", color: "bg-green-500" },
        { value: "break", label: "Pause", color: "bg-orange-500" },
    ];

    const formatDate = (date: Date) => {
        const days = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
        const months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
        return `${days[date.getDay()]}, ${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="default" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Neuer Eintrag
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] glass border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-gradient">Timeline-Eintrag hinzufügen</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        {formatDate(selectedDate)}
                    </p>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Titel</Label>
                        <Input
                            id="title"
                            placeholder="z.B. Video-Editing Session"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-white/5 border-white/10"
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="time">Uhrzeit</Label>
                            <Input
                                id="time"
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="bg-white/5 border-white/10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Typ</Label>
                            <select
                                id="type"
                                value={type}
                                onChange={(e) => setType(e.target.value as TimeBlockType)}
                                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                {typeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Type Preview */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                        <div className={`w-3 h-3 rounded-full ${typeOptions.find(t => t.value === type)?.color}`} />
                        <div className="text-sm">
                            <p className="font-medium text-white">{title || "Beispiel-Titel"}</p>
                            <p className="text-xs text-muted-foreground">{time} • {typeOptions.find(t => t.value === type)?.label}</p>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className="flex-1"
                        >
                            Abbrechen
                        </Button>
                        <Button type="submit" className="flex-1">
                            Hinzufügen
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
