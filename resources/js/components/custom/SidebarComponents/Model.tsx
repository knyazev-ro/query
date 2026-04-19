import { BellIcon, ChatBubbleOvalLeftEllipsisIcon, NewspaperIcon } from '@heroicons/react/16/solid';
import { router } from '@inertiajs/react';
import { AirVent, BoxIcon, DiscIcon, LoaderPinwheelIcon } from 'lucide-react';

export default function Model({collapsed, index}) {
    return (
        <div
            key={index}
            onClick={() => router.get(route('img-models.index'))}
            className={`flex cursor-pointer items-center gap-3 rounded-full w-12 h-12 transition hover:bg-[#ff1b1c] ${
                collapsed ? 'justify-center' : ''
            }`}
        >
            <LoaderPinwheelIcon className="h-5 w-5 text-[#fcfff3]" />
        </div>
    );
}
