// @ts-nocheck
import { useDraggable } from '@dnd-kit/core';
import {
    BriefcaseIcon,
    ChatBubbleOvalLeftEllipsisIcon,
    CurrencyYenIcon,
    UserCircleIcon,
} from '@heroicons/react/16/solid';
import { router } from '@inertiajs/react';
import Levels from './Levels';

const formatMoney = (amount) => {
    if (!amount) {
        return '—';
    }

    return new Intl.NumberFormat('ru-RU', {
        maximumFractionDigits: 0,
    }).format(Number(amount));
};

const clientName = (client) => {
    const entity = client?.entity;

    if (!entity) {
        return 'Без клиента';
    }

    return entity.name || [entity.first_name, entity.last_name].filter(Boolean).join(' ');
};

const authorName = (author) => {
    if (!author) {
        return 'Не назначен';
    }

    return [author.name, author.last_name].filter(Boolean).join(' ') || author.email;
};

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

    const commentsCount = project.commentaries_count ?? 0;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`
                group relative flex flex-col gap-3
                rounded-md border border-white/10
                bg-[#1c1c1c] p-3
                shadow-md transition-all duration-200
                hover:bg-[#222] hover:shadow-lg
                ${isDragging ? 'opacity-0' : 'opacity-100'}
            `}
        >
            <div className="flex items-start justify-between gap-2">
                <button
                    onPointerDown={(event) => event.stopPropagation()}
                    onMouseDown={(event) => event.stopPropagation()}
                    onClick={handleShowProject}
                    className="line-clamp-2 text-left text-sm font-semibold text-white hover:underline"
                >
                    {project.name}
                </button>

                <Levels level={project.level} size={2} />
            </div>

            {project.description && (
                <div className="text-xs text-gray-400 line-clamp-2">
                    {project.description}
                </div>
            )}

            <div className="grid gap-2 text-[11px] text-gray-400">
                <div className="flex min-w-0 items-center gap-1.5">
                    <UserCircleIcon className="w-4 shrink-0 opacity-70" />
                    <span className="truncate">{authorName(project.author)}</span>
                </div>

                <div className="flex min-w-0 items-center gap-1.5">
                    <BriefcaseIcon className="w-4 shrink-0 opacity-70" />
                    <span className="truncate">{clientName(project.client)}</span>
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-2 text-xs">
                <div className="flex min-w-0 items-center gap-1 text-gray-300">
                    <CurrencyYenIcon className="w-4 shrink-0 opacity-70" />
                    <span className="truncate">{formatMoney(project.amount)}</span>
                </div>

                <div className="flex items-center gap-1 text-gray-400">
                    <ChatBubbleOvalLeftEllipsisIcon className="w-4" />
                    <span className="min-w-4 text-right">{commentsCount}</span>
                </div>
            </div>
        </div>
    );
}
