import { router } from '@inertiajs/react';
import { FlaskConical } from 'lucide-react';
import { route } from 'ziggy-js';

type SidebarItemProps = {
    collapsed?: boolean;
    index?: number;
};

export default function Benchmark({ collapsed, index }: SidebarItemProps) {
    return (
        <div
            key={index}
            onClick={() => router.get(route('benchmarks.index'))}
            className={`flex h-12 w-12 cursor-pointer items-center gap-3 rounded-full transition hover:bg-[#ff1b1c] ${
                collapsed ? 'justify-center' : ''
            }`}
            title="Benchmarks"
        >
            <FlaskConical className="h-5 w-5 text-[#fcfff3]" />
        </div>
    );
}
