import {
    ChevronLeftIcon,
    ChevronRightIcon,
    PlusCircleIcon,
} from '@heroicons/react/16/solid';

export default function StageHeader({ stage, idx }) {
    return (
        <div className="relative flex w-full items-center">
           {idx === 0 && <div className="absolute left-0 -translate-x-4 -translate-y-1.5 flex cursor-pointer items-center justify-center text-[#262626] rounded-full hover:bg-[#fcfff3] bg-[#667c5d] opacity-100 z-10 transition-all hover:opacity-100">
                <PlusCircleIcon className="w-6" />
            </div>}
            <h3 className="text-md kanban-column mb-4 flex w-full justify-between bg-[#81b64c] p-3 font-semibold text-white">
                <div>{stage.name.toUpperCase()}</div>
                <div className="flex items-center gap-4 px-2">
                    <ChevronLeftIcon className="w-5 min-w-5 cursor-pointer rounded-full hover:bg-[#acbfa4] transition-colors" />
                    <ChevronRightIcon className="w-5 min-w-5 cursor-pointer rounded-full hover:bg-[#acbfa4] transition-colors" />
                </div>
            </h3>
            <div className="absolute right-0 flex translate-x-7 -translate-y-1.5 cursor-pointer items-center justify-center text-[#fcfff3] opacity-5 transition-opacity hover:opacity-100">
                <PlusCircleIcon className="w-6" />
            </div>
        </div>
    );
}
