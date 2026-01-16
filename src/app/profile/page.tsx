"use client";

import { useGameStore, MILESTONES } from "@/lib/gamification";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { StatsRadarChart } from "@/components/gamification/StatsRadarChart";
import { Trophy, Lock, Medal, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
    const { xp, level, unlockedAchievements, stats } = useGameStore();

    const nextLevelXp = level * 1000;
    const progress = (xp % 1000) / 1000 * 100;

    return (
        <div className="space-y-8 p-8 max-w-7xl mx-auto animate-in fade-in duration-500">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start glass p-8 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />

                <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-purple-500 to-blue-600 p-[2px]">
                        <div className="w-full h-full rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                            <span className="text-4xl font-bold">U</span>
                        </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 glass px-3 py-1 rounded-full text-sm font-bold border border-white/10">
                        Lvl {level}
                    </div>
                </div>

                <div className="flex-1 space-y-4 w-full text-center md:text-left">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>
                        <p className="text-muted-foreground">Architect & Creator</p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Experience</span>
                            <span className="font-mono text-primary">{xp} XP</span>
                        </div>
                        <div className="h-4 bg-secondary/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                            <div
                                className="h-full bg-gradient-to-r from-purple-600 to-blue-600 relative overflow-hidden"
                                style={{ width: `${progress}%` }}
                            >
                                <div className="absolute inset-0 w-full h-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground text-right w-full">Next Level: {nextLevelXp} XP</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="glass p-4 rounded-xl flex flex-col items-center justify-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <span className="text-2xl font-bold">{unlockedAchievements.length}</span>
                        <span className="text-xs text-muted-foreground">Trophies</span>
                    </div>
                    <div className="glass p-4 rounded-xl flex flex-col items-center justify-center gap-2">
                        <Zap className="w-5 h-5 text-blue-500" />
                        <span className="text-2xl font-bold">12</span>
                        <span className="text-xs text-muted-foreground">Streak</span>
                    </div>
                    <div className="glass p-4 rounded-xl flex flex-col items-center justify-center gap-2">
                        <Star className="w-5 h-5 text-purple-500" />
                        <span className="text-2xl font-bold">Top 1%</span>
                        <span className="text-xs text-muted-foreground">Rank</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Stats Column */}
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Medal className="w-5 h-5 text-primary" />
                            Character Stats
                        </CardTitle>
                        <CardDescription>Visual representation of your attributes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <StatsRadarChart />
                        <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-sm py-2 border-b border-border/50">
                                <span className="text-muted-foreground">Focus</span>
                                <span className="font-bold">80%</span>
                            </div>
                            <div className="flex justify-between text-sm py-2 border-b border-border/50">
                                <span className="text-muted-foreground">Consistency</span>
                                <span className="font-bold">65%</span>
                            </div>
                            <div className="flex justify-between text-sm py-2 border-b border-border/50">
                                <span className="text-muted-foreground">Innovation</span>
                                <span className="font-bold">57%</span>
                            </div>
                            <div className="flex justify-between text-sm py-2 border-b border-border/50">
                                <span className="text-muted-foreground">Ideas Created</span>
                                <span className="font-bold text-purple-400">{stats.ideasCreated}</span>
                            </div>
                            <div className="flex justify-between text-sm py-2">
                                <span className="text-muted-foreground">Tasks Done</span>
                                <span className="font-bold text-green-400">{stats.tasksCompleted}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Achievements Column */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            Milestones & Achievements
                        </CardTitle>
                        <CardDescription>Showcase of your professional journey</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {MILESTONES.map((achievement) => {
                                const isUnlocked = unlockedAchievements.includes(achievement.id);
                                return (
                                    <div
                                        key={achievement.id}
                                        className={cn(
                                            "relative group p-4 rounded-xl border transition-all duration-300",
                                            isUnlocked
                                                ? "bg-gradient-to-br from-primary/10 to-transparent border-primary/20 hover:border-primary/50"
                                                : "bg-secondary/20 border-white/5 opacity-60 grayscale"
                                        )}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-lg flex items-center justify-center shrink-0 shadow-lg",
                                                isUnlocked ? "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 text-yellow-500" : "bg-black/40 text-muted-foreground"
                                            )}>
                                                {isUnlocked ? <Trophy className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className={cn("font-semibold leading-none", isUnlocked ? "text-foreground" : "text-muted-foreground")}>
                                                    {achievement.title}
                                                </h4>
                                                <p className="text-xs text-muted-foreground line-clamp-2">
                                                    {achievement.description}
                                                </p>
                                                <div className="pt-2 flex items-center gap-2">
                                                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-mono text-primary/80 border border-primary/20">
                                                        +{achievement.xpReward} XP
                                                    </span>
                                                    {isUnlocked && (
                                                        <span className="text-[10px] text-green-500 font-medium animate-in fade-in">
                                                            Unlocked
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {isUnlocked && (
                                            <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
