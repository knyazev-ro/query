import { BellIcon, ChatBubbleOvalLeftEllipsisIcon, NewspaperIcon } from '@heroicons/react/16/solid';
import { router } from '@inertiajs/react';
import { BoxIcon, DiscIcon } from 'lucide-react';

export default function Feed({collapsed, index}) {
    return (
        <div
            key={index}
            onClick={() => router.get(route('kanban.index'))}
            className={`flex cursor-pointer items-center gap-3 px-4 py-4 transition hover:bg-[#ff1b1c] ${
                collapsed ? 'justify-center' : ''
            }`}
        >
            <NewspaperIcon className="h-5 w-5 text-[#fcfff3]" />
            {!collapsed && (
                <span className="text-sm font-medium text-[#fcfff3]">
                    {"Лента"}
                </span>
            )}
        </div>
    );
}
