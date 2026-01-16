import { ResourceGauge } from "@/components/resources/ResourceGauge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ArrowRight, Layers } from "lucide-react";

export default function ResourcesPage() {
    return (
        <div className="flex-1 p-8 pt-6 space-y-8">
            <h2 className="text-3xl font-bold tracking-tight text-gradient">Resource Contingents</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ResourceGauge label="Weekly Time" value={65} limit="40h" color="#00C2FF" />
                <ResourceGauge label="Energy Budget" value={40} limit="100pts" color="#FFD700" />
                <ResourceGauge label="Production Cost" value={25} limit="500€" color="#FF0055" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Layers className="w-5 h-5 text-primary" />
                            Active Allocations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-xl glass hover:bg-white/5 cursor-pointer transition-colors">
                                    <div>
                                        <h4 className="font-medium">Video Project #{i}</h4>
                                        <p className="text-xs text-muted-foreground">Allocated: 4h • 20pts</p>
                                    </div>
                                    <div className="flex -space-x-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-background" />
                                        <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-background" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 py-3 border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                            View All Allocations <ArrowRight className="w-4 h-4" />
                        </button>
                    </CardContent>
                </Card>

                <Card className="glass border-dashed border-2 border-white/20 flex flex-col items-center justify-center p-12 text-center text-muted-foreground hover:border-primary/50 hover:text-primary transition-all cursor-pointer">
                    <Layers className="w-12 h-12 mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Create New Contingent</h3>
                    <p className="text-sm max-w-xs">Define a new resource bucket (e.g., Freelance Budget or GPU Hours)</p>
                </Card>
            </div>
        </div>
    );
}
