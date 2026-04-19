import {
    ChevronLeftIcon,
    ChevronRightIcon,
    PlusIcon,
} from '@heroicons/react/16/solid';

export default function StageHeader({ stage, idx }) {
    return (
        <div className="relative flex items-center justify-between rounded-xl border border-white/10 bg-[#1c1c1c] px-3 py-2 mb-3">

            {/* LEFT */}
            <div className="flex items-center gap-2">

                {/* ADD BUTTON (только у первой колонки) */}
                {idx === 0 && (
                    <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white">
                        <PlusIcon className="w-4" />
                    </button>
                )}

                {/* TITLE */}
                <h3 className="text-sm font-semibold text-white tracking-wide">
                    {stage.name}
                </h3>

                {/* COUNT (если есть проекты — рекомендую добавить) */}
                {stage.projects?.length > 0 && (
                    <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-gray-400">
                        {stage.projects.length}
                    </span>
                )}
            </div>

            {/* RIGHT ACTIONS */}
            <div className="flex items-center gap-1">

                <button className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white/10 hover:text-white">
                    <ChevronLeftIcon className="w-4" />
                </button>

                <button className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white/10 hover:text-white">
                    <ChevronRightIcon className="w-4" />
                </button>

                {/* ADD */}
                <button className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white/10 hover:text-white">
                    <PlusIcon className="w-4" />
                </button>

            </div>
        </div>
    );
}