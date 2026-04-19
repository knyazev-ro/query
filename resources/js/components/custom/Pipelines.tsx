import { PlusIcon } from "@heroicons/react/16/solid";
import { useState } from "react";

export default function Pipelines({ pipelines }) {
    const [activeId, setActiveId] = useState(pipelines?.[0]?.id ?? null);

    const handleEditPipeline = (id) => {
        setActiveId(id);
        // логика перехода
    };

    const handleAddPipeline = () => {
        // логика добавления
    };

    return (
        <div className="flex flex-col gap-2">

            {/* HEADER */}
            <div className="flex items-center justify-between px-2">
                <div className="text-sm font-semibold text-gray-400">
                    Потоки
                </div>

                <button
                    onClick={handleAddPipeline}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white/10 hover:text-white"
                >
                    <PlusIcon className="w-4" />
                </button>
            </div>

            {/* LIST */}
            <div className="flex gap-2 overflow-x-auto pb-1">

                {pipelines?.map((e) => {
                    const isActive = e.id === activeId;

                    return (
                        <button
                            key={e.id}
                            onClick={() => handleEditPipeline(e.id)}
                            className={`
                                whitespace-nowrap rounded-lg px-4 py-2 text-sm transition-all
                                ${isActive
                                    ? 'bg-white/10 text-white shadow-sm'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                            `}
                        >
                            {e.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}