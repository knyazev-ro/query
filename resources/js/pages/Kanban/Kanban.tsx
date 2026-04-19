import Layout from '@/components/custom/Layout';
import Pipelines from '@/components/custom/Pipelines';
import ProjectCard from '@/components/custom/ProjectCard';
import Stage from '@/components/custom/Stage';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { router } from '@inertiajs/react';
import { useState } from 'react';

export default function Kanban({ stages: initialStages, pipelines }) {
    const [activeProject, setActiveProject] = useState(null);
    const [stages, setStages] = useState(initialStages);
    const [overId, setOverId] = useState(null);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveProject(null);
        setOverId(null);

        if (!over) return;

        const fromProjectId = active.id;
        const toStageId = over.id;

        const fromStageIndex = stages.findIndex((s) =>
            s.projects?.some((p) => p.id === fromProjectId),
        );

        const toStageIndex = stages.findIndex(
            (s) => String(s.id) === String(toStageId),
        );

        if (fromStageIndex === -1 || toStageIndex === -1) return;
        if (fromStageIndex === toStageIndex) return;

        setStages((prev) => {
            const copy = prev.map((s) => ({
                ...s,
                projects: s.projects ? [...s.projects] : [],
            }));

            const projIndex = copy[fromStageIndex].projects.findIndex(
                (p) => p.id === fromProjectId,
            );

            if (projIndex === -1) return prev;

            const [proj] = copy[fromStageIndex].projects.splice(projIndex, 1);
            copy[toStageIndex].projects.push(proj);

            return copy;
        });

        router.post(route('kanban.drop', [fromProjectId, toStageId]), {
            onError: (errors) => {
                console.error('Drop failed', errors);
            },
        });
    };

    const handleDragStart = (event) => {
        setActiveProject(event.active.data.current);
    };

    const handleDragOver = (event) => {
        setOverId(event.over ? event.over.id : null);
    };

    return (
        <Layout>
            <div className="flex h-full flex-col gap-4 bg-[#121212] p-4">

                {/* PIPELINES BAR */}
                <div className=" border border-white/10 bg-[#181818] p-3 shadow-md">
                    <Pipelines pipelines={pipelines} />
                </div>

                {/* KANBAN */}
                <div className="flex flex-1 overflow-hidden border border-white/10 bg-[#161616] shadow-inner">

                    <DndContext
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                    >
                        {/* SCROLL AREA */}
                        <div className="flex w-full gap-4 overflow-x-auto p-4">

                            {stages?.map((stage, idx) => (
                                <div
                                    key={stage.id}
                                    className={`
                                        transition-all duration-200
                                        ${stage.id === overId ? 'scale-[1.02]' : ''}
                                    `}
                                >
                                    <Stage
                                        stage={stage}
                                        isOver={stage.id === overId}
                                        idx={idx}
                                    />
                                </div>
                            ))}

                        </div>

                        {/* DRAG OVERLAY */}
                        <DragOverlay>
                            {activeProject ? (
                                <div className="rotate-2 scale-105 opacity-90 shadow-2xl">
                                    <ProjectCard project={activeProject} />
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </div>
            </div>
        </Layout>
    );
}
