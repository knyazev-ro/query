// @ts-nocheck
import { EllipsisVerticalIcon, PencilIcon, StarIcon } from '@heroicons/react/16/solid';
import { useForm } from '@inertiajs/react';
import { HeartIcon } from 'lucide-react';
import { useState } from 'react';
import Files from './Files';
import RichTextEditor from './RichTextEditor';

const normalizeContent = (content) => {
    if (content?.ops) {
        return content;
    }

    return { ops: [{ insert: '\n' }] };
};

const authorName = (commentary) => {
    const master = commentary?.master;

    if (!master) {
        return 'Unknown author';
    }

    return [master.name, master.last_name].filter(Boolean).join(' ') || master.email;
};

export default function CommentaryMessageBlock({ commentary, onEdit }) {
    const [isEditing, setIsEditing] = useState(false);
    const [hotKey, setHotKey] = useState<string | null>(null);
    const { data, setData, processing } = useForm({
        content: normalizeContent(commentary?.content),
        marked_notify: null,
        files: commentary?.file_locations ?? [],
    });

    const handleSave = () => {
        onEdit(data, () => setIsEditing(false));
    };

    const triggerHotKey = (key: string) => {
        setHotKey(key);
        setTimeout(() => setHotKey(null), 0);
    };

    return (
        <div className="flex justify-between gap-4 border-b border-[#81b64c]/70 bg-[#acbfa4]/10 px-3 py-4">
            <div className="h-full">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#81b64c] text-center">
                    <StarIcon className="w-5 rotate-45 text-[#fcfff3]" />
                </div>
            </div>
            <div className="flex w-full min-w-0 flex-col text-sm">
                <div className="font-medium text-white">{authorName(commentary)}</div>
                <div className="text-sm text-gray-400">
                    {new Date(commentary?.updated_at ?? commentary?.created_at).toLocaleString()}
                </div>
                <div className="mt-4 flex flex-col gap-2">
                    <div className="rounded-md bg-white/5 p-3">
                        <RichTextEditor
                            value={data.content}
                            setValue={(value) => setData('content', value)}
                            hotKeyOutside={hotKey}
                            setIsEnterOn={handleSave}
                            readOnly={!isEditing}
                        />

                        <Files
                            files={data.files}
                            setFiles={(files) => setData('files', files)}
                            readOnly={!isEditing}
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            className="flex cursor-pointer items-center justify-center rounded-full bg-[#acbfa4] px-2 py-1"
                        >
                            <HeartIcon className="w-4 text-[#262626]" />
                        </button>
                        <button
                            type="button"
                            className="flex cursor-pointer items-center justify-center rounded-full bg-[#acbfa4] px-3 py-1 font-semibold text-[#262626]"
                        >
                            Reply
                        </button>
                        {commentary?.can_edit && !isEditing && (
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="flex cursor-pointer items-center gap-1 rounded-full bg-white/10 px-3 py-1 font-semibold text-white transition hover:bg-white/15"
                            >
                                <PencilIcon className="w-3.5" />
                                Edit
                            </button>
                        )}
                        {isEditing && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => triggerHotKey('mod+b')}
                                    className="rounded-full bg-white/10 px-3 py-1 font-semibold text-white transition hover:bg-white/15"
                                >
                                    Bold
                                </button>
                                <button
                                    type="button"
                                    onClick={() => triggerHotKey('mod+shift+v')}
                                    className="rounded-full bg-white/10 px-3 py-1 font-semibold text-white transition hover:bg-white/15"
                                >
                                    Video
                                </button>
                                <button
                                    type="button"
                                    disabled={processing}
                                    onClick={handleSave}
                                    className="rounded-full bg-[#81b64c] px-3 py-1 font-semibold text-[#fcfff3] transition hover:bg-[#6fa13f] disabled:opacity-50"
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="rounded-full bg-white/10 px-3 py-1 font-semibold text-white transition hover:bg-white/15"
                                >
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex h-full flex-col py-1">
                <button type="button" className="cursor-pointer text-gray-400 hover:text-white">
                    <EllipsisVerticalIcon className="w-5" />
                </button>
            </div>
        </div>
    );
}
