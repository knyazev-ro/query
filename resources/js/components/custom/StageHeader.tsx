// @ts-nocheck
import {
    CheckIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    PencilIcon,
    PlusIcon,
    XMarkIcon,
} from '@heroicons/react/16/solid';
import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function StageHeader({ stage, idx, totalStages }) {
    const [isEditing, setIsEditing] = useState(false);
    const form = useForm({
        name: stage.name ?? '',
        order: stage.order ?? idx + 1,
    });

    const updateStage = () => {
        form.post(route('kanban.stages.update', stage.id), {
            preserveScroll: true,
            onSuccess: () => setIsEditing(false),
        });
    };

    const createProject = () => {
        router.get(route('projects.create', stage.id), {}, { preserveScroll: true });
    };

    const moveStage = (direction) => {
        router.post(route('kanban.stages.move', [stage.id, direction]), {}, {
            preserveScroll: true,
        });
    };

    return (
        <div className="relative mb-3 flex items-center justify-between rounded-md border border-white/10 bg-[#1c1c1c] px-3 py-2">
            <div className="flex min-w-0 items-center gap-2">
                {idx === 0 && (
                    <button
                        type="button"
                        onClick={createProject}
                        className="flex h-7 w-7 items-center justify-center rounded-md bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
                    >
                        <PlusIcon className="w-4" />
                    </button>
                )}

                {isEditing ? (
                    <input
                        autoFocus
                        value={form.data.name}
                        onChange={(event) => form.setData('name', event.target.value)}
                        className="w-48 rounded-md border border-white/10 bg-[#121212] px-2 py-1 text-sm font-semibold text-white outline-none focus:border-[#81b64c]"
                    />
                ) : (
                    <h3 className="truncate text-sm font-semibold tracking-wide text-white">
                        {stage.name}
                    </h3>
                )}

                {stage.projects?.length > 0 && (
                    <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-gray-400">
                        {stage.projects.length}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-1">
                {isEditing ? (
                    <>
                        <button
                            type="button"
                            onClick={updateStage}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-[#81b64c] transition hover:bg-white/10"
                        >
                            <CheckIcon className="w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            <XMarkIcon className="w-4" />
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveStage('left')}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            <ChevronLeftIcon className="w-4" />
                        </button>

                        <button
                            type="button"
                            disabled={idx >= totalStages - 1}
                            onClick={() => moveStage('right')}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition hover:bg-white/10 hover:text-white"
                        >
                            <ChevronRightIcon className="w-4" />
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition hover:bg-white/10 hover:text-white"
                        >
                            <PencilIcon className="w-4" />
                        </button>

                        <button
                            type="button"
                            onClick={createProject}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition hover:bg-white/10 hover:text-white"
                        >
                            <PlusIcon className="w-4" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
