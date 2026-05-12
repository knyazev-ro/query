import { router } from '@inertiajs/react';
import { ImageIcon } from 'lucide-react';

export default function ImgModel({collapsed, index}) {
    return (
        <div
            key={index}
            onClick={() => router.get(route('img-compress-models.index'))}
            className={`flex cursor-pointer items-center gap-3 rounded-full w-12 h-12 transition hover:bg-[#ff1b1c] ${
                collapsed ? 'justify-center' : ''
            }`}
        >
            <ImageIcon className="h-5 w-5 text-[#fcfff3]" />
        </div>
    );
}
