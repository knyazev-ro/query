import { useDroppable } from '@dnd-kit/core';
import { PlusCircleIcon } from 'lucide-react';
import ProjectCard from './ProjectCard';
import StageHeader from './StageHeader';

export default function Stage({ stage, isOver, idx }) {
    const { setNodeRef } = useDroppable({
        id: stage.id,
    });
    const style = {
        backgroundColor: isOver ? '#262126' : undefined,
    };

    const handleCreateNewProject = () => {
        //
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            key={stage.id}
            className={`min-h-[400px] w-96 flex-shrink-0 border-gray-200 p-4 text-stone-950`}
        >
            <StageHeader stage={stage} idx={idx}/>
            <div className="space-y-3">
                {stage?.projects?.map((project) => (
                    <ProjectCard project={project} />
                ))}
                <button
                    onClick={() => handleCreateNewProject()}
                    className="flex w-full cursor-pointer items-center justify-center border border-dashed py-9 text-gray-600 opacity-10 transition-all hover:opacity-100"
                >
                    <PlusCircleIcon />
                </button>
            </div>
        </div>
    );
}
