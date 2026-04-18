import {
    AtSymbolIcon,
    BoldIcon,
    PaperClipIcon,
    PlayCircleIcon,
    StarIcon,
} from '@heroicons/react/16/solid';
import { router, useForm } from '@inertiajs/react';
import { uniqBy } from 'lodash';
import { useState } from 'react';
import Files from './Files';
import RichTextEditor from './RichTextEditor';

export default function CommentaryBlock({ sendRoute }: { sendRoute: string }) {
    const [isEnterOn, setIsEnterOn] = useState(false);
    const [hotKey, setHotKey] = useState<string | null>(null);

    const { data, setData } = useForm({
        content: [
            {
                type: 'paragraph',
                children: [{ text: '' }],
            },
        ],
        master_type: 'App\\Models\\User',
        master_id: 1,
        marked_notify: null,
        files: [],
    });

    const handleClickVideoEmbed = () => {
        setHotKey('mod+shift+v');
        setTimeout(() => setHotKey(null), 0);
    };

    const handleClickFileAttach = (files) => {
        setData(
            'files',
            uniqBy([...data.files, ...files], (file) => file?.name),
        );
    };

    const handleClickBoldText = () => {
        setHotKey('mod+b');
        setTimeout(() => setHotKey(null), 0);
    };

    const handleClickMentionUser = () => {
        setHotKey(null);
        setTimeout(() => setHotKey(null), 0);
    };

    if (isEnterOn) {
        router.post(sendRoute, data, {
            onSuccess: () => {
                setData({
                    content: [
                        {
                            type: 'paragraph',
                            children: [{ text: '' }],
                        },
                    ],
                    files: [],
                });
            }
        })
        setIsEnterOn(false);
    }

    return (
        <div className="relative flex h-full min-h-11.5 w-full rounded-xs">
            <div className="flex h-full flex-col px-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#81b64c] text-center">
                    <StarIcon className="w-6 rotate-45 text-[#fcfff3]" />
                </div>
            </div>
            <div className="flex h-full w-full flex-col">
                <div className="flex h-full w-full items-center p-2">
                    <RichTextEditor
                        value={data.content}
                        setValue={(e) => setData('content', e)}
                        hotKeyOutside={hotKey}
                        setIsEnterOn={setIsEnterOn}
                    />
                </div>
                <Files
                    files={data.files}
                    setFiles={(f) => setData('files', f)}
                />
            </div>
            <div className="flex h-full flex-col justify-end">
                <div className="z-10 flex gap-6 px-4 py-4">
                    <button className="flex cursor-pointer items-center justify-center rounded-full p-1 transition-all duration-300 hover:bg-[#ff1b1c]/30">
                        <input
                            multiple
                            type="file"
                            className="absolute z-10 h-7 w-7 rounded-full opacity-0"
                            onChange={(e) =>
                                handleClickFileAttach(e.target.files)
                            }
                        ></input>
                        <PaperClipIcon className="w-5" />
                    </button>
                    <button
                        onClick={() => handleClickVideoEmbed()}
                        className="cursor-pointer rounded-full p-1 transition-all duration-300 hover:bg-[#ff1b1c]/30"
                    >
                        <PlayCircleIcon className="w-5" />
                    </button>
                    <button
                        onClick={() => handleClickBoldText()}
                        className="cursor-pointer rounded-full p-1 transition-all duration-300 hover:bg-[#ff1b1c]/30"
                    >
                        <BoldIcon className="w-5" />
                    </button>
                    <button className="transitio</button>n-all cursor-pointer rounded-full p-1 duration-300 hover:bg-[#ff1b1c]/30">
                        <AtSymbolIcon className="w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
