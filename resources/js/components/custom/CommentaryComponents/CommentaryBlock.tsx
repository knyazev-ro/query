import {
    AtSymbolIcon,
    BoldIcon,
    PaperClipIcon,
    PlayCircleIcon,
    StarIcon,
} from '@heroicons/react/16/solid';
import { useForm } from '@inertiajs/react';
import RichTextEditor from './RichTextEditor';

export default function CommentaryBlock() {
    const { data, setData } = useForm({
        content: [
            {
                type: 'paragraph',
                children: [{ text: '' }],
            },
        ],
        files: [],
    });

    const handleClickVideoEmbed = () => {
        // 
    };

    const handleClickFileAttach = () => {
        //
    };

    const handleClickBoldText = () => {
        //
    };

    const handleClickMentionUser = () => {
        //
    };

    return (
        <div className="relative flex h-full min-h-11.5 w-full rounded-xs">
            <div className="flex h-full flex-col px-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#81b64c] text-center">
                    <StarIcon className="w-6 rotate-45 text-[#fcfff3]" />
                </div>
            </div>
            <div className="flex h-full w-full items-center p-2">
                <RichTextEditor
                    value={data.content}
                    setValue={(e) => setData('content', e)}
                />
            </div>
            <div className="flex h-full flex-col justify-end">
                <div className="z-10 flex gap-6 px-4 py-4">
                    <button className="cursor-pointer rounded-full p-1 transition-all duration-300 hover:bg-[#ff1b1c]/30">
                        <PaperClipIcon className="w-5" />
                    </button>
                    <button onClick={() => handleClickVideoEmbed()} className="cursor-pointer rounded-full p-1 transition-all duration-300 hover:bg-[#ff1b1c]/30">
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
