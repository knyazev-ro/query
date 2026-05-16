// @ts-nocheck
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

const emptyComment = () => ({
    content: { ops: [{ insert: '\n' }] },
    marked_notify: null,
    files: [],
});

export default function CommentaryBlock({
    sendRoute,
    onSaved,
}: {
    sendRoute: string;
    onSaved?: () => void;
}) {
    const [hotKey, setHotKey] = useState<string | null>(null);
    const { data, setData, processing, reset } = useForm(emptyComment());

    const triggerHotKey = (key: string) => {
        setHotKey(key);
        setTimeout(() => setHotKey(null), 0);
    };

    const handleClickFileAttach = (files) => {
        setData(
            'files',
            uniqBy(
                [...data.files, ...Array.from(files ?? [])],
                (file) => file?.name,
            ),
        );
    };

    const handleSubmit = (content = null) => {
        router.post(
            sendRoute,
            {
                ...data,
                content: content ?? data.content,
            },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onSaved?.();
                },
            },
        );
    };

    return (
        <div className="relative flex h-full min-h-12 w-full gap-3 rounded-md">
            <div className="flex h-full flex-col px-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#81b64c] text-center">
                    <StarIcon className="w-5 rotate-45 text-[#fcfff3]" />
                </div>
            </div>
            <div className="flex h-full w-full min-w-0 flex-col">
                <div className="flex h-full w-full items-center rounded-md bg-white/5 p-3">
                    <RichTextEditor
                        value={data.content}
                        setValue={(value) => setData('content', value)}
                        hotKeyOutside={hotKey}
                        setIsEnterOn={handleSubmit}
                    />
                </div>
                <Files
                    files={data.files}
                    setFiles={(files) => setData('files', files)}
                />
            </div>
            <div className="flex h-full flex-col justify-end">
                <div className="z-10 flex items-center gap-3 px-2 py-3">
                    <button className="relative flex cursor-pointer items-center justify-center rounded-full p-1 transition-all duration-300 hover:bg-[#ff1b1c]/30">
                        <input
                            multiple
                            type="file"
                            className="absolute z-10 h-7 w-7 cursor-pointer rounded-full opacity-0"
                            onChange={(event) =>
                                handleClickFileAttach(event.target.files)
                            }
                        />
                        <PaperClipIcon className="w-5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => triggerHotKey('mod+shift+v')}
                        className="cursor-pointer rounded-full p-1 transition-all duration-300 hover:bg-[#ff1b1c]/30"
                    >
                        <PlayCircleIcon className="w-5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => triggerHotKey('mod+b')}
                        className="cursor-pointer rounded-full p-1 transition-all duration-300 hover:bg-[#ff1b1c]/30"
                    >
                        <BoldIcon className="w-5" />
                    </button>
                    <button
                        type="button"
                        className="cursor-pointer rounded-full p-1 transition-all duration-300 hover:bg-[#ff1b1c]/30"
                    >
                        <AtSymbolIcon className="w-5" />
                    </button>
                    <button
                        type="button"
                        disabled={processing}
                        onClick={handleSubmit}
                        className="rounded-md bg-[#81b64c] px-3 py-1 text-sm font-semibold text-[#fcfff3] transition hover:bg-[#6fa13f] disabled:opacity-50"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
