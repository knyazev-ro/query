import { router } from '@inertiajs/react';
import { DiscIcon } from 'lucide-react';

export default function Kanban({collapsed, index}) {
    return (
        <div
            key={index}
            onClick={() => router.get(route('kanban.index'))}
            className={`flex cursor-pointer rounded-full w-12 h-12 items-center gap-3 transition hover:bg-[#ff1b1c] ${
                collapsed ? 'justify-center' : ''
            }`}
        >
            <DiscIcon className="h-5 w-5 text-[#fcfff3]" />
            {!collapsed && (
                <span className="text-sm font-medium text-[#fcfff3]">
                    {"Канбан"}
                </span>
            )}
        </div>
    );
}
