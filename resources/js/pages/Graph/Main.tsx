import Layout from "@/components/custom/Layout";
import { useMemo, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/16/solid";

export default function Main() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [selectedNode, setSelectedNode] = useState(null);

    const model = {
        id: "model-1",
        name: "ImageCompressor-X",
        author: "Ruslan",
        createdAt: "2025-09-12",
        description:
            "Модель для сжатия спутниковых изображений с сохранением геометрии и текстурных особенностей земной поверхности.",

        stats: {
            versions: 6,
            avgTrainingTime: "18h 32m",
            activeUsers: 124,
        },
    };

    const data = useMemo(() => {
        const nodes = [
            { id: "v1", label: "v1 baseline", datasets: ["SAT-IMG"], status: "stable", depth: 0 },
            { id: "v2", label: "v2 augmented", datasets: ["SAT-IMG", "Earth-v1"], status: "stable", depth: 1 },
            { id: "v3", label: "v3 compression", datasets: ["Earth-v2"], status: "stable", depth: 2 },
            { id: "v4-exp", label: "v4 experimental fork", datasets: ["Synthetic-Noise"], status: "experimental", depth: 2 },
            { id: "v5-rollback", label: "v5 rollback", datasets: ["SAT-IMG"], status: "rollback", depth: 3 },
            { id: "v6", label: "v6 final", datasets: ["SAT-IMG", "Earth-v2", "DeepSpace"], status: "stable", depth: 4 },
        ];

        const links = [
            { source: "v1", target: "v2" },
            { source: "v2", target: "v3" },
            { source: "v3", target: "v4-exp" },
            { source: "v2", target: "v5-rollback" },
            { source: "v3", target: "v6" },
            { source: "v5-rollback", target: "v6" },
        ];

        return { nodes, links };
    }, []);

    const getColor = (node) => {
        switch (node.status) {
            case "stable":
                return "#e5e7eb";
            case "experimental":
                return "#fbbf24";
            case "rollback":
                return "#f87171";
            default:
                return "#9ca3af";
        }
    };

    return (
        <Layout>
            <div className="flex h-screen bg-[#0f0f0f] text-white">

                {/* SIDEBAR */}
                <div
                    className={`
                        relative border-r border-white/10
                        bg-[#0b0b0b]
                        transition-all duration-200
                        ${sidebarCollapsed ? "w-14" : "w-80"}
                    `}
                >
                    {/* collapse button */}
                    <button
                        onClick={() => setSidebarCollapsed((v) => !v)}
                        className="absolute -right-3 top-4 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#1a1a1a] border border-white/10"
                    >
                        {sidebarCollapsed ? (
                            <ChevronRightIcon className="w-4" />
                        ) : (
                            <ChevronLeftIcon className="w-4" />
                        )}
                    </button>

                    {/* CONTENT */}
                    {!sidebarCollapsed && (
                        <div className="p-4 text-sm flex flex-col gap-4">

                            {/* MODEL HEADER */}
                            <div>
                                <div className="text-lg font-semibold">
                                    {model.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                    by {model.author}
                                </div>
                            </div>

                            {/* DESCRIPTION */}
                            <div className="text-xs text-gray-400">
                                {model.description}
                            </div>

                            {/* STATS */}
                            <div className="grid grid-cols-2 gap-2 text-xs">

                                <div className="rounded bg-white/5 p-2">
                                    <div className="text-gray-500">versions</div>
                                    <div>{model.stats.versions}</div>
                                </div>

                                <div className="rounded bg-white/5 p-2">
                                    <div className="text-gray-500">users</div>
                                    <div>{model.stats.activeUsers}</div>
                                </div>

                                <div className="rounded bg-white/5 p-2 col-span-2">
                                    <div className="text-gray-500">avg training</div>
                                    <div>{model.stats.avgTrainingTime}</div>
                                </div>

                                <div className="rounded bg-white/5 p-2 col-span-2">
                                    <div className="text-gray-500">created</div>
                                    <div>{model.createdAt}</div>
                                </div>
                            </div>

                            {/* VERSION INFO */}
                            {selectedNode && (
                                <div className="border-t border-white/10 pt-3">
                                    <div className="text-xs text-gray-500 mb-2">
                                        selected version
                                    </div>

                                    <div className="rounded bg-white/5 p-2">
                                        <div className="font-medium">
                                            {selectedNode.label}
                                        </div>

                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {selectedNode.datasets?.map((d, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-0.5 bg-white/10 text-[10px] text-gray-300 rounded"
                                                >
                                                    {d}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* GRAPH */}
                <div className="flex-1">
                    <ForceGraph2D
                        graphData={data}

                        dagMode="lr"
                        dagLevelDistance={180}

                        d3VelocityDecay={0.35}
                        d3ForceX={(node) => node.depth * 220}
                        d3ForceCharge={{ strength: -320 }}
                        d3ForceLink={{ distance: 160, strength: 0.9 }}

                        nodeRelSize={6}
                        linkColor={() => "rgba(255,255,255,0.12)"}

                        nodeCanvasObject={(node, ctx, globalScale) => {
                            const label = node.label;
                            const datasets = node.datasets || [];

                            const fontSize = 12 / globalScale;
                            ctx.font = `${fontSize}px Sans-Serif`;

                            const padding = 8;
                            const lineHeight = fontSize + 2;

                            const width =
                                Math.max(
                                    ctx.measureText(label).width,
                                    ...datasets.map(d => ctx.measureText(d).width)
                                ) + padding * 2;

                            const height =
                                lineHeight * (datasets.length + 1) +
                                padding * 2;

                            ctx.fillStyle = "#141414";
                            ctx.strokeStyle = getColor(node);

                            ctx.beginPath();
                            ctx.roundRect(
                                node.x - width / 2,
                                node.y - height / 2,
                                width,
                                height,
                                6
                            );
                            ctx.fill();
                            ctx.stroke();

                            ctx.fillStyle = "#fff";
                            ctx.fillText(
                                label,
                                node.x - width / 2 + padding,
                                node.y - height / 2 + padding + lineHeight
                            );

                            ctx.fillStyle = "#9ca3af";
                            datasets.forEach((d, i) => {
                                ctx.fillText(
                                    `• ${d}`,
                                    node.x - width / 2 + padding,
                                    node.y -
                                        height / 2 +
                                        padding +
                                        lineHeight * (i + 2)
                                );
                            });
                        }}

                        onNodeClick={(node) => setSelectedNode(node)}
                    />
                </div>
            </div>
        </Layout>
    );
}