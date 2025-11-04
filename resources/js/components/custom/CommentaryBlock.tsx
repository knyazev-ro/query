import {
    AtSymbolIcon,
    BoldIcon,
    PaperClipIcon,
    PlayCircleIcon,
    StarIcon,
} from '@heroicons/react/16/solid';
import { useForm } from '@inertiajs/react';
import TextareaAutosize from '@mui/material/TextareaAutosize';

export default function CommentaryBlock() {
    const { data, setData } = useForm({
        message: '',
        files: [],
    });

    return (
        <div className="relative flex min-h-11.5 w-full items-center rounded-xs">
            <div className="flex h-full flex-col px-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#81b64c] text-center">
                    <StarIcon className="w-6 rotate-45 text-[#fcfff3]" />
                </div>
            </div>
            <div className="flex h-full w-full items-center p-2">
                <TextareaAutosize
                    aria-label="empty textarea"
                    placeholder="Введите комментарий..."
                    value={data.message}
                    onChange={(e) => setData('message', e.target.value)}
                    className="focus:ring-none w-full resize-none font-medium text-[#262626]/80 transition-all outline-none focus:border-none focus:outline-none"
                />
            </div>
            <div className="flex h-full flex-col justify-end">
                <div className="z-10 flex gap-6 px-4 py-4">
                    <button className="cursor-pointer rounded-full p-1 transition-all duration-300 hover:bg-[#ff1b1c]/30">
                        <PaperClipIcon className="w-5" />
                    </button>
                    <button className="cursor-pointer rounded-full p-1 transition-all duration-300 hover:bg-[#ff1b1c]/30">
                        <PlayCircleIcon className="w-5" />
                    </button>
                    <button className="cursor-pointer rounded-full p-1 transition-all duration-300 hover:bg-[#ff1b1c]/30">
                        <BoldIcon className="w-5" />
                    </button>
                    <button className="cursor-pointer rounded-full p-1 transition-all duration-300 hover:bg-[#ff1b1c]/30">
                        <AtSymbolIcon className="w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
