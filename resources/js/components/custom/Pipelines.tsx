// @ts-nocheck
import { CheckIcon, PencilIcon, PlusIcon, XMarkIcon } from '@heroicons/react/16/solid';
import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Pipelines({ pipelines, currentPipeline }) {
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const createForm = useForm({ name: '', deadline: '' });
    const editForm = useForm({ name: currentPipeline?.name ?? '', deadline: currentPipeline?.deadline ?? '' });

    const openPipeline = (id) => {
        router.get(route('kanban.show', id), {}, { preserveScroll: true });
    };

    const startEdit = (pipeline) => {
        setEditingId(pipeline.id);
        editForm.setData({
            name: pipeline.name ?? '',
            deadline: pipeline.deadline ?? '',
        });
    };

    const createPipeline = () => {
        createForm.post(route('kanban.pipelines.store'), {
            preserveScroll: true,
            onSuccess: () => {
                createForm.reset();
                setIsCreating(false);
            },
        });
    };

    const updatePipeline = (pipeline) => {
        editForm.post(route('kanban.pipelines.update', pipeline.id), {
            preserveScroll: true,
            onSuccess: () => setEditingId(null),
        });
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-2">
                <div className="text-sm font-semibold text-gray-400">Воронки</div>

                <button
                    type="button"
                    onClick={() => setIsCreating(true)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition hover:bg-white/10 hover:text-white"
                    title="Создать воронку"
                >
                    <PlusIcon className="w-4" />
                </button>
            </div>

            {isCreating && (
                <div className="flex flex-wrap items-center gap-2 rounded-md border border-white/10 bg-white/5 p-2">
                    <input
                        autoFocus
                        value={createForm.data.name}
                        onChange={(event) => createForm.setData('name', event.target.value)}
                        className="min-w-56 rounded-md border border-white/10 bg-[#121212] px-3 py-2 text-sm text-white outline-none focus:border-[#81b64c]"
                        placeholder="Название воронки"
                    />
                    <button
                        type="button"
                        onClick={createPipeline}
                        className="flex h-8 w-8 items-center justify-center rounded-md bg-[#81b64c] text-white"
                    >
                        <CheckIcon className="w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsCreating(false)}
                        className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-white"
                    >
                        <XMarkIcon className="w-4" />
                    </button>
                </div>
            )}

            <div className="flex gap-2 overflow-x-auto pb-1">
                {pipelines?.map((pipeline) => {
                    const isActive = pipeline.id === currentPipeline?.id;
                    const isEditing = editingId === pipeline.id;

                    return (
                        <div
                            key={pipeline.id}
                            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all ${
                                isActive
                                    ? 'bg-white/10 text-white shadow-sm'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            {isEditing ? (
                                <>
                                    <input
                                        autoFocus
                                        value={editForm.data.name}
                                        onChange={(event) => editForm.setData('name', event.target.value)}
                                        className="w-48 rounded-md border border-white/10 bg-[#121212] px-2 py-1 text-sm text-white outline-none focus:border-[#81b64c]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => updatePipeline(pipeline)}
                                        className="text-[#81b64c]"
                                    >
                                        <CheckIcon className="w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingId(null)}
                                        className="text-gray-400 hover:text-white"
                                    >
                                        <XMarkIcon className="w-4" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => openPipeline(pipeline.id)}
                                        className="whitespace-nowrap"
                                    >
                                        {pipeline.name}
                                    </button>
                                    <span className="rounded bg-white/5 px-1.5 py-0.5 text-[11px] text-gray-400">
                                        {pipeline.stages_count ?? 0}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => startEdit(pipeline)}
                                        className="text-gray-500 hover:text-white"
                                    >
                                        <PencilIcon className="w-3.5" />
                                    </button>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
