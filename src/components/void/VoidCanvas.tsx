"use client";

import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { Orb } from "@/components/void/Orb";
import { OrbEditor } from "@/components/void/OrbEditor";
import { Button } from "@/components/ui/Button";
import { Sparkles, RefreshCw } from "lucide-react";
import { useGameStore } from "@/lib/gamification";

interface Node extends d3.SimulationNodeDatum {
    id: string;
    label: string;
    tags: string[];
    r: number;
    group: number;
}

const initialData: Node[] = [
    { id: "1", label: "Video Idea: AI Agents", tags: ["video", "ai"], r: 60, group: 1 },
    { id: "2", label: "Twitter Thread: Productivity", tags: ["social", "growth"], r: 50, group: 2 },
    { id: "3", label: "Blog: Future of Work", tags: ["blog", "ai"], r: 55, group: 1 },
    { id: "4", label: "Project: Obsidian Plugin", tags: ["code", "tool"], r: 65, group: 3 },
    { id: "5", label: "Email Newsletter", tags: ["social", "marketing"], r: 45, group: 2 },
    { id: "6", label: "Podcast Guesting", tags: ["audio", "marketing"], r: 50, group: 2 },
    { id: "7", label: "Research: LLM Fine-tuning", tags: ["ai", "tech"], r: 70, group: 1 },
    { id: "8", label: "Design System Update", tags: ["design", "ui"], r: 55, group: 3 },
];

export function VoidCanvas() {
    const containerRef = useRef<HTMLDivElement>(null);
    const nodesRef = useRef<Node[]>(JSON.parse(JSON.stringify(initialData)));
    const simulationRef = useRef<d3.Simulation<Node, undefined> | null>(null);
    const orbsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const svgRef = useRef<SVGSVGElement>(null);

    const [magnetismActive, setMagnetismActive] = useState(false);
    const [renderTrigger, setRenderTrigger] = useState(0);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    const { incrementStat } = useGameStore();

    // --- Persistence Strategy ---
    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("void-nodes");
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        nodesRef.current = parsed;
                        setRenderTrigger(prev => prev + 1);
                    }
                } catch (e) {
                    console.error("Failed to load void nodes", e);
                }
            }
        }
    }, []);

    useEffect(() => {
        if (nodesRef.current.length > 0) {
            localStorage.setItem("void-nodes", JSON.stringify(nodesRef.current));
        }
    }, [renderTrigger]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (nodesRef.current.length > 0) {
                localStorage.setItem("void-nodes", JSON.stringify(nodesRef.current));
            }
        }, 5000);
        return () => clearInterval(interval);
    }, []);


    // --- Simulation Setup ---
    useEffect(() => {
        if (!containerRef.current) return;

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        const nodes = nodesRef.current;

        nodes.forEach(node => {
            if (typeof node.x === 'undefined') node.x = width / 2 + (Math.random() - 0.5) * 50;
            if (typeof node.y === 'undefined') node.y = height / 2 + (Math.random() - 0.5) * 50;
        });

        const simulation = d3.forceSimulation(nodes)
            .velocityDecay(0.6)
            .force("charge", d3.forceManyBody().strength(-200))
            .force("x", d3.forceX(width / 2).strength(0.08))
            .force("y", d3.forceY(height / 2).strength(0.08))
            .force("collide", d3.forceCollide().radius((d) => (d as Node).r + 20).iterations(2))
            .on("tick", () => {
                nodes.forEach((node) => {
                    const el = orbsRef.current[node.id];
                    if (el) {
                        el.style.transform = `translate3d(${node.x}px, ${node.y}px, 0)`;
                    }
                });

                if (svgRef.current) {
                    while (svgRef.current.firstChild) {
                        svgRef.current.removeChild(svgRef.current.firstChild);
                    }

                    if (magnetismActive) {
                        for (let i = 0; i < nodes.length; i++) {
                            for (let j = i + 1; j < nodes.length; j++) {
                                const nodeA = nodes[i];
                                const nodeB = nodes[j];
                                const sharedTags = nodeA.tags.filter(tag => nodeB.tags.includes(tag));

                                if (sharedTags.length > 0) {
                                    const dx = (nodeB.x || 0) - (nodeA.x || 0);
                                    const dy = (nodeB.y || 0) - (nodeA.y || 0);
                                    const dist = Math.sqrt(dx * dx + dy * dy);

                                    if (dist < 400) {
                                        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                                        line.setAttribute("x1", String(nodeA.x));
                                        line.setAttribute("y1", String(nodeA.y));
                                        line.setAttribute("x2", String(nodeB.x));
                                        line.setAttribute("y2", String(nodeB.y));
                                        line.setAttribute("stroke", "rgba(139, 92, 246, 0.3)");
                                        line.setAttribute("stroke-width", "1");
                                        line.setAttribute("stroke-dasharray", "4 4");
                                        svgRef.current.appendChild(line);
                                    }
                                }
                            }
                        }
                    }
                }
            });

        simulationRef.current = simulation;

        const drag = d3.drag<HTMLDivElement, Node>()
            .on("start", (event, d) => {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on("drag", (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on("end", (event, d) => {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            });

        const attachDrag = () => {
            Object.entries(orbsRef.current).forEach(([id, el]) => {
                if (el) {
                    const node = nodesRef.current.find(n => n.id === id);
                    if (node) {
                        d3.select(el).datum(node).call(drag as any);
                    }
                }
            });
        };
        attachDrag();

        return () => {
            simulation.stop();
        };
    }, [renderTrigger]);


    // --- Magnetism Logic ---
    useEffect(() => {
        if (!simulationRef.current) return;
        const nodes = nodesRef.current;

        if (magnetismActive) {
            const clusteringForce = (alpha: number) => {
                for (let i = 0; i < nodes.length; i++) {
                    for (let j = i + 1; j < nodes.length; j++) {
                        const nodeA = nodes[i];
                        const nodeB = nodes[j];
                        const sharedTags = nodeA.tags.filter(tag => nodeB.tags.includes(tag));

                        if (sharedTags.length > 0) {
                            const dx = (nodeB.x || 0) - (nodeA.x || 0);
                            const dy = (nodeB.y || 0) - (nodeA.y || 0);
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            const strength = 0.8 * alpha;

                            if (distance > 0) {
                                const moveX = (dx / distance) * strength * 2;
                                const moveY = (dy / distance) * strength * 2;
                                if (nodeA.vx) nodeA.vx += moveX;
                                if (nodeA.vy) nodeA.vy += moveY;
                                if (nodeB.vx) nodeB.vx -= moveX;
                                if (nodeB.vy) nodeB.vy -= moveY;
                            }
                        }
                    }
                }
            };

            simulationRef.current
                .force("charge", d3.forceManyBody().strength(-20))
                .force("cluster", clusteringForce)
                .alpha(1)
                .restart();
        } else {
            simulationRef.current
                .force("charge", d3.forceManyBody().strength(-200))
                .force("cluster", null)
                .alpha(1)
                .restart();
        }
    }, [magnetismActive, renderTrigger]);


    // --- Interaction & Editor Logic ---
    const handleDoubleClick = (e: React.MouseEvent) => {
        if (e.target !== containerRef.current && e.target !== svgRef.current) return;
        if (!simulationRef.current || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newNode: Node = {
            id: Date.now().toString(),
            label: "New Idea",
            tags: [],
            r: 40,
            group: 1,
            x: x,
            y: y
        };

        nodesRef.current.push(newNode);
        setRenderTrigger(prev => prev + 1);
        incrementStat('ideasCreated');
        setSelectedNodeId(newNode.id);
    };

    const handleOrbClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedNodeId(id);
    };

    const handleSaveNode = (id: string, updates: Partial<Node>) => {
        const node = nodesRef.current.find(n => n.id === id);
        if (node) {
            Object.assign(node, updates);
            // Resize if label grew long
            if (updates.label && updates.label.length > 20) {
                node.r = Math.min(80, 40 + (updates.label.length - 20) * 1.5);
            } else if (updates.label) {
                node.r = Math.max(40, Math.min(60, 40 + updates.label.length));
            }
            setRenderTrigger(prev => prev + 1);
            simulationRef.current?.nodes(nodesRef.current);
            simulationRef.current?.alpha(0.3).restart();
        }
    };

    const handleDeleteNode = (id: string) => {
        nodesRef.current = nodesRef.current.filter(n => n.id !== id);
        simulationRef.current?.nodes(nodesRef.current);
        simulationRef.current?.alpha(1).restart();
        setSelectedNodeId(null);
        setRenderTrigger(prev => prev + 1);
    };

    const selectedNode = selectedNodeId ? nodesRef.current.find(n => n.id === selectedNodeId) : null;

    return (
        <div
            className="relative w-full h-full overflow-hidden bg-black/95 cursor-crosshair select-none"
            ref={containerRef}
            onDoubleClick={handleDoubleClick}
            onClick={() => setSelectedNodeId(null)} // Background click deselects
        >
            {/* Starfield Background */}
            <div className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                    backgroundImage: 'radial-gradient(circle at center, #333 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />

            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-[120px]" />
            </div>

            {/* Links Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" ref={svgRef} />

            {/* UI Controls */}
            <div className="absolute top-4 right-4 z-50 flex gap-2">
                <Button
                    variant={magnetismActive ? "default" : "outline"}
                    className={magnetismActive ? "bg-purple-600 hover:bg-purple-700 shadow-[0_0_20px_rgba(147,51,234,0.5)] border-purple-500/50" : "glass border-white/10"}
                    onClick={(e) => { e.stopPropagation(); setMagnetismActive(!magnetismActive); }}
                    size="sm"
                >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {magnetismActive ? "AI Magnetism Active" : "Activate AI Clustering"}
                </Button>
                <Button variant="ghost" size="icon" className="glass hover:bg-white/10" onClick={(e) => {
                    e.stopPropagation();
                    simulationRef.current?.alpha(1).restart();
                }}>
                    <RefreshCw className="w-4 h-4" />
                </Button>
            </div>

            {/* Editor Overlay */}
            {selectedNode && (
                <div onClick={(e) => e.stopPropagation()}>
                    <OrbEditor
                        node={selectedNode}
                        onClose={() => setSelectedNodeId(null)}
                        onSave={handleSaveNode}
                        onDelete={handleDeleteNode}
                    />
                </div>
            )}

            {/* Orbs Layer */}
            {nodesRef.current.map((node) => (
                <div
                    key={node.id}
                    ref={(el) => { orbsRef.current[node.id] = el; }}
                    className="absolute will-change-transform z-10"
                    style={{ left: 0, top: 0 }}
                    onClick={(e) => handleOrbClick(node.id, e)}
                >
                    <Orb
                        id={node.id}
                        x={0} y={0} r={node.r}
                        label={node.label}
                        tags={node.tags}
                        color={node.tags.includes('ai') ? '#a855f7' : node.tags.includes('social') ? '#ec4899' : '#3b82f6'}
                    />
                    {/* Selected Highlight */}
                    {selectedNodeId === node.id && (
                        <div
                            className="absolute rounded-full border-2 border-white/50 animate-pulse pointer-events-none"
                            style={{
                                left: -5, top: -5, width: (node.r * 2) + 10, height: (node.r * 2) + 10
                            }}
                        />
                    )}
                </div>
            ))}

            <div className="absolute bottom-4 left-4 text-white/30 text-xs pointer-events-none font-mono">
                Spatial Ideation Engine v1.2.1 • Double-click to spawn • Click to edit
            </div>
        </div>
    );
}
