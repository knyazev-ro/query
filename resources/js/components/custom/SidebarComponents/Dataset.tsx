import { router } from '@inertiajs/react';
import { ImageIcon, Layers3Icon } from 'lucide-react';

export default function Dataset({collapsed, index}) {
    return (
        <div
            key={index}
            onClick={() => router.get(route('datasets.index'))}
            className={`flex cursor-pointer items-center gap-3 rounded-full w-12 h-12 transition hover:bg-[#ff1b1c] ${
                collapsed ? 'justify-center' : ''
            }`}
        >
            <Layers3Icon className="h-5 w-5 text-[#fcfff3]" />
        </div>
    );
}
