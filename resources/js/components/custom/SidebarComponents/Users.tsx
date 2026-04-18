import { BellIcon, ChatBubbleOvalLeftEllipsisIcon, NewspaperIcon, PhoneArrowUpRightIcon, UsersIcon } from '@heroicons/react/16/solid';
import { router } from '@inertiajs/react';
import { BoxIcon, DiscIcon } from 'lucide-react';

export default function Users({collapsed, index}) {
    return (
        <div
            key={index}
            onClick={() => router.get(route('kanban.index'))}
            className={`flex cursor-pointer items-center gap-3 rounded-full w-12 h-12 transition hover:bg-[#ff1b1c] ${
                collapsed ? 'justify-center' : ''
            }`}
        >
            <UsersIcon className="h-5 w-5 text-[#fcfff3]" />
            {!collapsed && (
                <span className="text-sm font-medium text-[#fcfff3]">
                    {"Пользователи"}
                </span>
            )}
        </div>
    );
}
