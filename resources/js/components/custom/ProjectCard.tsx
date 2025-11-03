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

    const handleDeleteProject = () => {
        router.post(route('projects.delete', project.id));
    };

    const images = [
        'https://t3.ftcdn.net/jpg/16/81/25/58/360_F_1681255802_3JLKAyEmo93FKXX3rEoIGJ4cHzQkRRFU.jpg',
        // 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-iI_Nshu2x5taM7zZchxjuRSdgMu5WDo_fg&s',
        // 'https://static.demilked.com/wp-content/uploads/2018/03/5aaa1cc04ed34-funny-weird-wtf-stock-photos-19-5a3926af95d9d__700.jpg',
    ];

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`group z-10 flex flex-col rounded-md border-1 border-blue-300 bg-[#fcfff3] p-1 text-stone-950 shadow-lg backdrop-blur-md ${isDragging ? 'opacity-0' : 'opacity-100'}`}
        >
            {/* img */}
            <div
                className={`grid gap-1 grid-cols-${images.length > 1 ? 2 : 1}`}
            >
                {images.map((e) => (
                    <div>
                        <img
                            className="h-full w-full rounded-sm object-cover"
                            src={e}
                        />
                    </div>
                ))}
            </div>
            <div className="flex flex-col px-2">
                <div className="mb-1 flex items-center gap-2 py-2">
                    <div className="flex items-center gap-1">
                        <div>
                            <EllipsisVerticalIcon className="w-5 text-[#acbfa4]" />
                        </div>
                        <button
                            onPointerDown={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                                handleShowProject();
                            }}
                            className="cursor-pointer text-left text-sm font-semibold"
                        >
                            {project.name.toUpperCase()}
                        </button>
                    </div>
                    <Levels level={project.level} />
                </div>

                <div className="mb-2 text-xs text-gray-600">
                    {project.description}
                </div>

                <div className="flex items-center justify-between overflow-x-auto py-1 text-xs whitespace-nowrap">
                    <span>
                        <span className="font-semibold text-[#acbfa4]">
                            Автор:{' '}
                        </span>
                        <span className="inline-flex border-b-1 border-[#acbfa4] text-[#acbfa4]">
                            {project?.author?.name}
                        </span>
                    </span>
                    <span className="text-[#ff1b1c]">/</span>
                    <span>{new Date(project.created_at).toLocaleString()}</span>
                </div>

                <div className="grid w-full grid-cols-3 items-center justify-between py-2 text-xs">
                    <div className="flex w-full items-center justify-start gap-1">
                        <CurrencyYenIcon className="w-4 text-[#ff7f11]" />
                        <span>{'22500.00'}</span>
                    </div>
                    <div className="flex w-full items-center justify-center gap-1">
                        <BriefcaseIcon className="w-4 min-w-4 text-[#acbfa4]" />
                        <span className="whitespace-nowrap">
                            {'OOO Ростсельмаш'}
                        </span>
                    </div>

                    <div className="flex w-full items-center justify-end text-center">
                        <div className="flex h-2.5 w-2.5 translate-x-1.5 -translate-y-0.5 items-center justify-center rounded-full bg-red-500 text-center text-[6px] text-[#fcfff1]">
                            2
                        </div>
                        <ChatBubbleOvalLeftEllipsisIcon className="w-4 text-[#ff7f11]" />
                    </div>
                </div>
            </div>
        </div>
    );
}
