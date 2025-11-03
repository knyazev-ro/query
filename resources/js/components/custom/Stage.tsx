
import { useDroppable } from '@dnd-kit/core';
import ProjectCard from './ProjectCard';
import { PlusCircleIcon } from 'lucide-react';

export default function Stage({ stage, isOver }) {
    const { setNodeRef } = useDroppable({
        id: stage.id,
    });
    const style = {
        backgroundColor: isOver ? '#262126' : undefined,
    };

    const handleCreateNewProject = () => {
        // 
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            key={stage.id}
            className={`w-96 flex-shrink-0 min-h-[400px] border-gray-200 p-4 text-stone-950`}
        >
            <h3 className="text-md kanban-column mb-4 bg-[#5d9948] p-3 font-semibold text-white">
                {stage.name.toUpperCase()}
            </h3>
            <div className="space-y-3">
                {stage?.projects?.map((project) => (
                    <ProjectCard project={project} />
                ))}
                <button
                onClick={() => handleCreateNewProject()} 
                className='w-full opacity-10 border-dashed cursor-pointer text-gray-600 hover:opacity-100 transition-all items-center flex justify-center py-9 border'>
                    <PlusCircleIcon/>
                </button>
            </div>
        </div>
    );
}
