import { useDraggable } from '@dnd-kit/core';
import {
    BriefcaseIcon,
    ChatBubbleOvalLeftEllipsisIcon,
    CurrencyYenIcon,
    EllipsisVerticalIcon,
} from '@heroicons/react/16/solid';
import { router } from '@inertiajs/react';
import Levels from './Levels';

export default function ProjectCard({ project }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({
            id: project.id,
            data: { ...project },
        });

    const style = transform
        ? {
              transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
          }
        : undefined;

    const handleShowProject = () => {
        router.get(route('projects.show', project.id));
    };

    const images = [
        'https://t3.ftcdn.net/jpg/16/81/25/58/360_F_1681255802_3JLKAyEmo93FKXX3rEoIGJ4cHzQkRRFU.jpg',
    ];

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`
                group relative flex flex-col gap-2
                rounded-xl border border-white/10
                bg-[#1c1c1c] p-2
                shadow-md transition-all duration-200
                hover:bg-[#222] hover:shadow-lg
                ${isDragging ? 'opacity-0' : 'opacity-100'}
            `}
        >
            {/* IMAGE */}
            {images.length > 0 && (
                <div className="overflow-hidden rounded-lg">
                    <img
                        className="h-28 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        src={images[0]}
                    />
                </div>
            )}

            {/* HEADER */}
            <div className="flex items-start justify-between gap-2 px-1">

                <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={handleShowProject}
                    className="text-left text-sm font-medium text-white hover:underline"
                >
                    {project.name}
                </button>

                <Levels level={project.level} size={2} />
            </div>

            {/* DESCRIPTION */}
            {project.description && (
                <div className="px-1 text-xs text-gray-400 line-clamp-2">
                    {project.description}
                </div>
            )}

            {/* META */}
            <div className="flex items-center justify-between px-1 text-[11px] text-gray-500">

                <span className="truncate">
                    {project?.author?.name || '—'}
                </span>

                <span className="opacity-60">
                    {new Date(project.created_at).toLocaleDateString()}
                </span>
            </div>

            {/* FOOTER */}
            <div className="flex items-center justify-between border-t border-white/5 pt-2 px-1 text-xs">

                {/* AMOUNT */}
                <div className="flex items-center gap-1 text-gray-300">
                    <CurrencyYenIcon className="w-4 opacity-70" />
                    <span>{project.amount || '—'}</span>
                </div>

                {/* COMPANY */}
                <div className="flex items-center gap-1 text-gray-400 truncate">
                    <BriefcaseIcon className="w-4 opacity-60" />
                    <span className="truncate max-w-[80px]">
                        OOO Ростсельмаш
                    </span>
                </div>

                {/* COMMENTS */}
                <div className="relative flex items-center gap-1 text-gray-400">
                    <ChatBubbleOvalLeftEllipsisIcon className="w-4" />

                    <div className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] text-white">
                        2
                    </div>
                </div>
            </div>
        </div>
    );
}
