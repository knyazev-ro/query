import Layout from '@/components/custom/Layout';
import {
    ArrowDownTrayIcon,
    ArrowLeftIcon,
    CheckIcon,
    StopIcon,
    TrashIcon,
} from '@heroicons/react/16/solid';
import { router, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { route } from 'ziggy-js';
import type { ImgMedia } from './types';

const statusClass: Record<string, string> = {
    'just created': 'bg-white/5 text-gray-400',
    compressing: 'bg-amber-500/10 text-amber-300',
    compressed: 'bg-emerald-500/10 text-emerald-300',
    cancel: 'bg-zinc-500/10 text-zinc-400',
    error: 'bg-[#ff1b1c]/10 text-[#ff6b6c]',
};

type ImageForm = {
    original_name: string;
};

function formatBytes(bytes?: number | null) {
    if (!bytes) {
        return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1,
    );

    return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function percentSaved(image: ImgMedia) {
    if (!image.compressed_size || !image.original_size) {
        return null;
    }

    return Math.max(
        100 - (image.compressed_size / image.original_size) * 100,
        0,
    ).toFixed(1);
}

export default function Show({ imgMedia }: { imgMedia: ImgMedia }) {
    const { data, setData, processing, errors } = useForm<ImageForm>({
        original_name: imgMedia.original_name,
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.post(route('compressions.update', imgMedia.id), data, {
            preserveScroll: true,
        });
    };

    const deleteImage = () => {
        if (!confirm(`Delete image "${imgMedia.original_name}"?`)) {
            return;
        }

        router.post(
            route('compressions.delete', imgMedia.id),
            {},
            { onSuccess: () => router.get(route('compressions.index')) },
        );
    };

    const cancelImage = () => {
        if (!imgMedia.model_version_id) {
            return;
        }

        router.post(
            route('compressions.cancel', imgMedia.model_version_id),
            { image_ids: [imgMedia.id] },
            { preserveScroll: true },
        );
    };

    const saved = percentSaved(imgMedia);
    const isActive =
        imgMedia.status === 'just created' || imgMedia.status === 'compressing';
    const fieldClass =
        'h-10 rounded border border-white/10 bg-[#101010] px-3 text-sm text-white outline-none transition placeholder:text-gray-700 focus:border-[#ff1b1c]/70';

    return (
        <Layout>
            <div className="min-h-screen bg-[#0f0f0f] p-6 text-white">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <h1 className="max-w-[52rem] truncate text-sm font-semibold text-gray-300">
                                {imgMedia.original_name}
                            </h1>
                            <span
                                className={`rounded px-2 py-0.5 text-[10px] ${statusClass[imgMedia.status]}`}
                            >
                                {imgMedia.status}
                            </span>
                        </div>
                        <div className="text-xs text-gray-500">
                            {imgMedia.model_version?.model?.name ??
                                'unknown model'}{' '}
                            v{imgMedia.model_version?.version_number ?? '-'}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.get(route('compressions.index'))}
                        className="inline-flex h-10 items-center gap-2 rounded border border-white/10 px-3 text-sm font-semibold text-gray-300 transition hover:bg-white/5"
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                        Back
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        <div className="rounded-lg border border-white/10 bg-[#141414]">
                            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                                <div className="text-xs font-medium text-gray-400">
                                    Original
                                </div>
                                <a
                                    href={route(
                                        'compressions.original',
                                        imgMedia.id,
                                    )}
                                    className="grid h-8 w-8 place-items-center rounded border border-white/10 text-gray-400 transition hover:bg-white/5 hover:text-white"
                                    title="Download original"
                                >
                                    <ArrowDownTrayIcon className="h-4 w-4" />
                                </a>
                            </div>
                            <div className="flex min-h-[420px] items-center justify-center bg-[#101010]">
                                <img
                                    src={route(
                                        'compressions.original',
                                        imgMedia.id,
                                    )}
                                    alt={imgMedia.original_name}
                                    className="max-h-[70vh] max-w-full object-contain"
                                />
                            </div>
                        </div>

                        <div className="rounded-lg border border-white/10 bg-[#141414]">
                            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                                <div className="text-xs font-medium text-gray-400">
                                    Decompressed
                                </div>
                                {imgMedia.compressed_img_path && (
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={route(
                                                'compressions.compressed',
                                                imgMedia.id,
                                            )}
                                            className="grid h-8 w-8 place-items-center rounded border border-white/10 text-gray-500 transition hover:bg-white/5 hover:text-white"
                                            title="Download compressed artifact"
                                        >
                                            <ArrowDownTrayIcon className="h-4 w-4" />
                                        </a>

                                        {imgMedia.status === 'compressed' && (
                                            <a
                                                href={route(
                                                    'compressions.decompressed',
                                                    {
                                                        imgMedia: imgMedia.id,
                                                        download: 1,
                                                    },
                                                )}
                                                className="grid h-8 w-8 place-items-center rounded border border-white/10 text-gray-400 transition hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-300"
                                                title="Download decompressed"
                                            >
                                                <ArrowDownTrayIcon className="h-4 w-4" />
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex min-h-[420px] items-center justify-center bg-[#101010]">
                                {imgMedia.status === 'compressed' ? (
                                    <img
                                        src={route(
                                            'compressions.decompressed',
                                            imgMedia.id,
                                        )}
                                        alt={`${imgMedia.original_name} decompressed`}
                                        className="max-h-[70vh] max-w-full object-contain"
                                    />
                                ) : (
                                    <div className="px-6 text-center text-sm text-gray-500">
                                        Decompressed preview is not available yet
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <form
                            onSubmit={submit}
                            className="rounded-lg border border-white/10 bg-[#141414] p-4"
                        >
                            <label className="mb-2 block text-xs font-medium text-gray-400">
                                File name
                            </label>
                            <input
                                value={data.original_name}
                                onChange={(event) =>
                                    setData('original_name', event.target.value)
                                }
                                className={fieldClass}
                            />
                            {errors.original_name && (
                                <div className="mt-2 text-xs text-[#ff1b1c]">
                                    {errors.original_name}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={processing}
                                className="mt-4 inline-flex h-10 items-center gap-2 rounded bg-[#ff1b1c] px-4 text-sm font-semibold text-white transition hover:bg-[#d91617] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <CheckIcon className="h-4 w-4" />
                                Save
                            </button>
                        </form>

                        <div className="rounded-lg border border-white/10 bg-[#141414] p-4">
                            <div className="mb-3 text-xs font-medium text-gray-400">
                                Details
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between gap-4">
                                    <span className="text-gray-500">
                                        Original size
                                    </span>
                                    <span className="text-gray-300">
                                        {formatBytes(imgMedia.original_size)}
                                    </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span className="text-gray-500">
                                        Compressed size
                                    </span>
                                    <span className="text-gray-300">
                                        {formatBytes(imgMedia.compressed_size)}
                                    </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span className="text-gray-500">
                                        Saved
                                    </span>
                                    <span className="text-gray-300">
                                        {saved ? `${saved}%` : '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span className="text-gray-500">MIME</span>
                                    <span className="text-gray-300">
                                        {imgMedia.mime_type}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {imgMedia.errors && (
                            <div className="rounded-lg border border-[#ff1b1c]/20 bg-[#ff1b1c]/10 p-4 text-sm text-[#ff6b6c]">
                                {imgMedia.errors}
                            </div>
                        )}

                        <div className="flex gap-3">
                            {isActive && (
                                <button
                                    type="button"
                                    onClick={cancelImage}
                                    className="inline-flex h-10 items-center gap-2 rounded border border-amber-500/30 px-3 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/10"
                                >
                                    <StopIcon className="h-4 w-4" />
                                    Cancel
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={deleteImage}
                                className="inline-flex h-10 items-center gap-2 rounded border border-[#ff1b1c]/40 px-3 text-sm font-semibold text-[#ff6b6c] transition hover:bg-[#ff1b1c]/10"
                            >
                                <TrashIcon className="h-4 w-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
