"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const data = [
    { subject: 'Focus', A: 120, fullMark: 150 },
    { subject: 'Consistency', A: 98, fullMark: 150 },
    { subject: 'Innovation', A: 86, fullMark: 150 },
    { subject: 'Speed', A: 99, fullMark: 150 },
    { subject: 'Quality', A: 85, fullMark: 150 },
    { subject: 'Strategy', A: 65, fullMark: 150 },
];

export function StatsRadarChart() {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                    <Radar
                        name="Mike"
                        dataKey="A"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fill="#8b5cf6"
                        fillOpacity={0.3}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
