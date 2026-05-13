import { router } from '@inertiajs/react';
import { Minimize2Icon } from 'lucide-react';
import { route } from 'ziggy-js';

type SidebarItemProps = {
    collapsed?: boolean;
    index?: number;
};

export default function Compression({ collapsed, index }: SidebarItemProps) {
    return (
        <div
            key={index}
            onClick={() => router.get(route('compressions.index'))}
            className={`flex h-12 w-12 cursor-pointer items-center gap-3 rounded-full transition hover:bg-[#ff1b1c] ${
                collapsed ? 'justify-center' : ''
            }`}
        >
            <Minimize2Icon className="h-5 w-5 text-[#fcfff3]" />
        </div>
    );
}
