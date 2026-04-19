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

        if (!over) {
            return;
        }

        const fromProjectId = active.id;
        const toStageId = over.id;

        // Если перетащили в ту же колонку — ничего не делаем
        const fromStageIndex = stages.findIndex((s) =>
            s.projects?.some((p) => p.id === fromProjectId),
        );
        const toStageIndex = stages.findIndex(
            (s) => String(s.id) === String(toStageId),
        );
        if (fromStageIndex === -1 || toStageIndex === -1) return;
        if (fromStageIndex === toStageIndex) return;

        setStages((prev) => {
            // глубокая копия минимально необходимая
            const copy = prev.map((s) => ({
                ...s,
                projects: s.projects ? [...s.projects] : [],
            }));
            // найти и удалить проект из старой стадии
            const projIndex = copy[fromStageIndex].projects.findIndex(
                (p) => p.id === fromProjectId,
            );
            if (projIndex === -1) return prev;
            const [proj] = copy[fromStageIndex].projects.splice(projIndex, 1);
            copy[toStageIndex].projects.push(proj);
            return copy;
        });

        // отправляем запрос на сервер асинхронно
        router.post(route('kanban.drop', [fromProjectId, toStageId]), {
            onError: (errors) => {
                console.error('Drop failed', errors);
            },
        });
    };

    const handleDragStart = (event) => {
        const { active } = event;
        setActiveProject(active.data.current);
        console.log(active.data.current);
    };

    const handleDragOver = (event) => {
        const { over } = event;
        setOverId(over ? over.id : null);
    };

    console.log(activeProject);

    return (
        <Layout>
            <div className="flex flex-col gap-2 py-2 bg-[#161616]">
            <div className=''>
            <Pipelines pipelines={pipelines}/>
            </div>
                <DndContext
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                >
                    <div className="flex h-full px-4 justify-start overflow-x-auto">
                        {stages?.map((stage, idx) => (
                            <Stage
                                key={stage.id}
                                stage={stage}
                                isOver={stage.id === overId}
                                idx={idx}
                                key={idx}
                            />
                        ))}
                    </div>
                    <DragOverlay>
                        {activeProject ? (
                            <div className="z-50">
                                <ProjectCard project={activeProject} />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </Layout>
    );
}
