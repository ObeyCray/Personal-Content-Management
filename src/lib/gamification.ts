import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    xpReward: number;
    icon: string;
    condition?: {
        stat: keyof GameState['stats'];
        threshold: number;
    };
}

export const MILESTONES: Achievement[] = [
    {
        id: 'first_idea',
        title: 'Spark of Genius',
        description: 'Create your first idea in the Void.',
        xpReward: 200,
        icon: 'Lightbulb',
        condition: { stat: 'ideasCreated', threshold: 1 }
    },
    {
        id: 'ideator',
        title: 'Ideator',
        description: 'Create 10 ideas in the Void.',
        xpReward: 1000,
        icon: 'Brain',
        condition: { stat: 'ideasCreated', threshold: 10 }
    },
    {
        id: 'task_novice',
        title: 'Getting Things Done',
        description: 'Complete 5 tasks.',
        xpReward: 500,
        icon: 'CheckCircle',
        condition: { stat: 'tasksCompleted', threshold: 5 }
    },
    {
        id: 'productivity_machine',
        title: 'Productivity Machine',
        description: 'Complete 25 tasks.',
        xpReward: 2500,
        icon: 'Zap',
        condition: { stat: 'tasksCompleted', threshold: 25 }
    },
    { id: 'socials_setup', title: 'Digital Presence', description: 'Create and link all social media accounts.', xpReward: 500, icon: 'Globe' },
];

interface GameState {
    xp: number;
    level: number;
    unlockedAchievements: string[];
    stats: {
        ideasCreated: number;
        tasksCompleted: number;
    };

    addXp: (amount: number) => void;
    unlockAchievement: (id: string) => void;
    incrementStat: (stat: keyof GameState['stats']) => void;
    nextLevelXp: () => number;
}

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            xp: 0,
            level: 1,
            unlockedAchievements: [],
            stats: {
                ideasCreated: 0,
                tasksCompleted: 0,
            },

            nextLevelXp: () => get().level * 1000,

            addXp: (amount) => {
                const { xp, level, nextLevelXp } = get();
                let newXp = xp + amount;
                let newLevel = level;
                let currentNextLevelXp = nextLevelXp();

                while (newXp >= currentNextLevelXp) {
                    newXp -= currentNextLevelXp;
                    newLevel++;
                    currentNextLevelXp = newLevel * 1000;
                    toast.success(`Level Up! Du hast Level ${newLevel} erreicht!`);

                }

                set({ xp: newXp, level: newLevel });
            },

            unlockAchievement: (id) => {
                const { unlockedAchievements, addXp } = get();
                if (!unlockedAchievements.includes(id)) {
                    const achievement = MILESTONES.find(m => m.id === id);
                    if (achievement) {
                        set({ unlockedAchievements: [...unlockedAchievements, id] });
                        addXp(achievement.xpReward);
                        toast.success(`Achievement Unlocked: ${achievement.title}`, {
                            description: achievement.description,
                        });
                    }
                }
            },

            incrementStat: (stat) => {
                const state = get();
                const newStats = { ...state.stats, [stat]: state.stats[stat] + 1 };
                set({ stats: newStats });

                // Check for unlocks
                MILESTONES.forEach(milestone => {
                    if (milestone.condition && milestone.condition.stat === stat) {
                        if (newStats[stat] === milestone.condition.threshold) {
                            state.unlockAchievement(milestone.id);
                        }
                    }
                });
            }
        }),
        {
            name: 'personal-cms-game-storage',
        }
    )
);
