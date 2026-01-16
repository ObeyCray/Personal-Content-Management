import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Activity, Battery, Clock, TrendingUp, LucideIcon } from "lucide-react";

export interface StatItem {
    title: string;
    value: string;
    icon: LucideIcon;
    color: string;
    desc: string;
}

export const stats: StatItem[] = [
    {
        title: "Produktivität",
        value: "87%",
        icon: Activity,
        color: "text-green-400",
        desc: "+5% zur Vorwoche",
    },
    {
        title: "Energie",
        value: "Hoch",
        icon: Battery,
        color: "text-yellow-400",
        desc: "Optimal für Deep Work",
    },
    {
        title: "Zeit übrig",
        value: "4h 20m",
        icon: Clock,
        color: "text-blue-400",
        desc: "Verfügbar heute",
    },
    {
        title: "Erledigte Tasks",
        value: "12",
        icon: TrendingUp,
        color: "text-purple-400",
        desc: "3 im Review",
    },
];

export function StatCard({ stat, className }: { stat: StatItem; className?: string }) {
    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 mb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
            </CardContent>
        </Card>
    );
}

export function OverviewStats() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <StatCard key={stat.title} stat={stat} />
            ))}
        </div>
    );
}
