// @ts-nocheck
import { useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import type { ModelVersion } from './types';

const statusColor: Record<string, string> = {
    queue: '#9ca3af',
    run: '#f59e0b',
    ready: '#34d399',
    cancel: '#71717a',
    error: '#ff6b6c',
};

export default function VersionGraph({
    versions,
    selectedVersionId,
    onSelect,
}: {
    versions: ModelVersion[];
    selectedVersionId: number | null;
    onSelect: (version: ModelVersion) => void;
}) {
    const graphRef = useRef(null);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (!wrapperRef.current) {
            return;
        }

        const observer = new ResizeObserver(([entry]) => {
            setSize({
                width: entry.contentRect.width,
                height: entry.contentRect.height,
            });
        });

        observer.observe(wrapperRef.current);
        return () => observer.disconnect();
    }, []);

    const data = useMemo(() => {
        const versionById = new Map(versions.map((version) => [version.id, version]));
        const depthById = new Map<number, number>();

        const depthOf = (version: ModelVersion): number => {
            if (depthById.has(version.id)) {
                return depthById.get(version.id) ?? 0;
            }

            const parent = version.parent_version_id
                ? versionById.get(version.parent_version_id)
                : null;
            const depth = parent ? depthOf(parent) + 1 : 0;
            depthById.set(version.id, depth);
            return depth;
        };

        return {
            nodes: versions.map((version) => ({
                id: version.id,
                version,
                label: `v${version.version_number}`,
                status: version.status,
                datasets: version.datasets ?? [],
                depth: depthOf(version),
                selected: version.id === selectedVersionId,
            })),
            links: versions
                .filter((version) => version.parent_version_id)
                .map((version) => ({
                    source: version.parent_version_id,
                    target: version.id,
                })),
        };
    }, [selectedVersionId, versions]);

    return (
        <div
            ref={wrapperRef}
            className="h-[420px] overflow-hidden rounded border border-white/10 bg-[#101010]"
        >
            <ForceGraph2D
                ref={graphRef}
                width={size.width}
                height={size.height}
                graphData={data}
                dagMode="lr"
                dagLevelDistance={120}
                d3VelocityDecay={0.5}
                d3ForceX={(node) => node.depth * 170}
                d3ForceCharge={{ strength: -240 }}
                d3ForceLink={{ distance: 130, strength: 0.9 }}
                linkColor={() => 'rgba(255,255,255,0.16)'}
                nodeCanvasObject={(node, ctx, globalScale) => {
                    const label = node.label;
                    const datasets = node.datasets.slice(0, 3).map((dataset) => dataset.name);
                    const fontSize = 11 / globalScale;
                    ctx.font = `${fontSize}px Sans-Serif`;

                    const padding = 7 / globalScale;
                    const lineHeight = fontSize + 3 / globalScale;
                    const width =
                        Math.max(
                            ctx.measureText(label).width,
                            ...datasets.map((dataset) => ctx.measureText(dataset).width),
                            ctx.measureText(node.status).width,
                        ) +
                        padding * 2;
                    const height = lineHeight * (datasets.length + 2) + padding * 2;

                    ctx.fillStyle = node.selected ? '#261111' : '#141414';
                    ctx.strokeStyle = node.selected
                        ? '#ff1b1c'
                        : statusColor[node.status] ?? '#9ca3af';
                    ctx.lineWidth = node.selected ? 2 / globalScale : 1 / globalScale;
                    ctx.beginPath();
                    ctx.roundRect(node.x - width / 2, node.y - height / 2, width, height, 6);
                    ctx.fill();
                    ctx.stroke();

                    ctx.fillStyle = '#f3f4f6';
                    ctx.fillText(label, node.x - width / 2 + padding, node.y - height / 2 + padding + lineHeight);
                    ctx.fillStyle = statusColor[node.status] ?? '#9ca3af';
                    ctx.fillText(
                        node.status,
                        node.x - width / 2 + padding,
                        node.y - height / 2 + padding + lineHeight * 2,
                    );
                    ctx.fillStyle = '#9ca3af';
                    datasets.forEach((dataset, index) => {
                        ctx.fillText(
                            dataset,
                            node.x - width / 2 + padding,
                            node.y - height / 2 + padding + lineHeight * (index + 3),
                        );
                    });
                }}
                onNodeClick={(node) => onSelect(node.version)}
            />
        </div>
    );
}
