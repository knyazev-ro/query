import { EllipsisVerticalIcon, StarIcon } from '@heroicons/react/16/solid';
import { router, useForm } from '@inertiajs/react';
import { HeartIcon } from 'lucide-react';
import { useState } from 'react';
import Files from './Files';
import RichTextEditor from './RichTextEditor';

const normalizeSlateNodes = (nodes) => {
    return nodes.map((node) => {
        if (node.text !== undefined) {
            return { ...node, text: node.text || '' }; // "" вместо null
        }

        if (Array.isArray(node.children)) {
            return {
                ...node,
                children: node.children.map((child) => ({
                    ...child,
                    text: child.text || '', // исправление здесь
                })),
            };
        }

        return node;
    });
};

export default function CommentaryMessageBlock({ commentary, onEdit }) {
    const [isEnterOn, setIsEnterOn] = useState(false);
    const [hotKey, setHotKey] = useState<string | null>(null);
    const { data, setData } = useForm({
        content: normalizeSlateNodes(commentary?.content ?? []),
        master_type: 'App\\Models\\User',
        master_id: 1,
        marked_notify: null,
        files: commentary?.file_locations ?? [],
    });

    if (isEnterOn) {
        onEdit(data);
        setIsEnterOn(false);
    }
    return (
        <div className="flex justify-between gap-4 border-b-1 border-[#81b64c] bg-[#acbfa4]/10 px-2 py-4">
            <div className="h-full">
                <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#81b64c] text-center">
                    <StarIcon className="w-5" />
                </div>
            </div>
            <div className="flex w-full flex-col text-sm">
                <div className="font-medium">{'knyazevseven@gmail.com'}</div>
                <div className="text-sm">{'Сегодня, 12:22'}</div>
                <div className="mt-4 flex flex-col gap-2">
                    <div className="py-1">
                        <RichTextEditor
                            value={data.content}
                            setValue={(e) => setData('content', e)}
                            hotKeyOutside={hotKey}
                            setIsEnterOn={setIsEnterOn}
                        />

                        <Files
                            files={data.files}
                            setFiles={(f) => setData('files', f)}
                        />
                    </div>

                    <div className="flex gap-2">
                        <div className="flex cursor-pointer items-center justify-center rounded-full bg-[#acbfa4] px-2 py-1">
                            <HeartIcon className="w-4 text-[#262626]" />
                        </div>
                        <div className="flex cursor-pointer items-center justify-center rounded-full bg-[#acbfa4] px-3 py-1 font-semibold text-[#262626]">
                            {'Ответить'}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex h-full flex-col py-1">
                <div className="cursor-pointer">
                    <EllipsisVerticalIcon className="w-5" />
                </div>
            </div>
        </div>
    );
}
