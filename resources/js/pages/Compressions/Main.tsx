import Layout from '@/components/custom/Layout';
import {
    ArrowDownTrayIcon,
    ArrowPathIcon,
    EyeIcon,
    PlusIcon,
    StopIcon,
    TrashIcon,
} from '@heroicons/react/16/solid';
import { router } from '@inertiajs/react';
import { ImageIcon } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';
import type { ImgMedia, PaginatedImgMedia } from './types';

const statusClass: Record<string, string> = {
    'just created': 'bg-white/5 text-gray-400',
    compressing: 'bg-amber-500/10 text-amber-300',
    compressed: 'bg-emerald-500/10 text-emerald-300',
    cancel: 'bg-zinc-500/10 text-zinc-400',
    error: 'bg-[#ff1b1c]/10 text-[#ff6b6c]',
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

function compressionRatio(image: ImgMedia) {
    if (!image.compressed_size || !image.original_size) {
        return null;
    }

    const saved = 100 - (image.compressed_size / image.original_size) * 100;

    return `${Math.max(saved, 0).toFixed(1)}% saved`;
}

function shortError(message?: string | null) {
    return (message ?? '').replace(/\s+/g, ' ').trim().slice(0, 1000);
}

function formatMetric(value?: number | null, digits = 4) {
    return typeof value === 'number' ? value.toFixed(digits) : '-';
}

function pageRange(currentPage: number, lastPage: number) {
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(lastPage, currentPage + 2);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export default function Main({ images }: { images: PaginatedImgMedia }) {
    const items = images?.data ?? [];
    const currentPage = images?.current_page ?? 1;
    const lastPage = images?.last_page ?? 1;
    const pages = pageRange(currentPage, lastPage);
    const hasActiveCompression = items.some((image) =>
        ['just created', 'compressing'].includes(image.status),
    );

    useEffect(() => {
        if (!hasActiveCompression) {
            return;
        }

        const interval = window.setInterval(() => {
            router.reload({
                only: ['images'],
            });
        }, 5000);

        return () => window.clearInterval(interval);
    }, [hasActiveCompression]);

    const deleteImage = (image: ImgMedia) => {
        if (!confirm(`Delete image "${image.original_name}"?`)) {
            return;
        }

        router.post(
            route('compressions.delete', image.id),
            {},
            { preserveScroll: true },
        );
    };

    const cancelImage = (image: ImgMedia) => {
        if (!image.model_version_id) {
            return;
        }

        router.post(
            route('compressions.cancel', image.model_version_id),
            { image_ids: [image.id] },
            { preserveScroll: true },
        );
    };

    const retryImage = (image: ImgMedia) => {
        router.post(
            route('compressions.retry', image.id),
            {},
            { preserveScroll: true },
        );
    };

    const goToPage = (page: number) => {
        if (page < 1 || page > lastPage || page === currentPage) {
            return;
        }

        router.get(
            route('compressions.index'),
            { page },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    return (
        <Layout>
            <div className="min-h-screen bg-[#0f0f0f] p-6 text-white">
                <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-sm font-semibold text-gray-300">
                            Compressions
                        </h1>
                        <div className="mt-1 text-xs text-gray-500">
                            {images?.total ?? 0} total
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.get(route('compressions.create'))}
                        className="inline-flex h-10 items-center gap-2 rounded bg-[#ff1b1c] px-3 text-sm font-semibold text-white transition hover:bg-[#d91617]"
                    >
                        <PlusIcon className="h-4 w-4" />
                        New compression
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className="flex min-h-[320px] items-center justify-center rounded border border-dashed border-white/10 bg-[#141414] text-sm text-gray-500">
                        No images queued yet
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-4">
                        {items.map((image) => {
                            const ratio = compressionRatio(image);
                            const isActive =
                                image.status === 'just created' ||
                                image.status === 'compressing';

                            return (
                                <div
                                    key={image.id}
                                    className="flex w-72 flex-col rounded-lg border border-white/10 bg-[#141414]"
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            router.get(
                                                route(
                                                    'compressions.show',
                                                    image.id,
                                                ),
                                            )
                                        }
                                        className="group relative aspect-video overflow-hidden rounded-t-lg bg-[#101010]"
                                    >
                                        <img
                                            src={route(
                                                'compressions.original',
                                                image.id,
                                            )}
                                            alt={image.original_name}
                                            className="h-full w-full object-cover opacity-80 transition group-hover:scale-105 group-hover:opacity-100"
                                        />
                                        <div className="absolute top-3 left-3 rounded bg-black/60 px-2 py-0.5 text-[10px] text-gray-200 backdrop-blur">
                                            {image.mime_type}
                                        </div>
                                    </button>

                                    <div className="flex flex-1 flex-col p-4">
                                        <div className="mb-3 flex items-start justify-between gap-3">
                                            <div className="flex min-w-0 items-center gap-2">
                                                <ImageIcon className="h-5 w-5 shrink-0 text-gray-400" />
                                                <div className="min-w-0">
                                                    <div className="truncate text-sm font-medium">
                                                        {image.original_name}
                                                    </div>
                                                    <div className="mt-0.5 truncate text-[11px] text-gray-600">
                                                        {image.model_version
                                                            ?.model?.name ??
                                                            'unknown model'}{' '}
                                                        v
                                                        {image.model_version
                                                            ?.version_number ??
                                                            '-'}
                                                    </div>
                                                </div>
                                            </div>

                                            <span
                                                className={`shrink-0 rounded px-2 py-0.5 text-[10px] ${statusClass[image.status]}`}
                                            >
                                                {image.status}
                                            </span>
                                        </div>

                                        <div className="mb-4 grid grid-cols-2 gap-2 text-[11px]">
                                            <div className="rounded bg-white/5 p-2 text-gray-500">
                                                Original
                                                <div className="mt-1 text-xs text-gray-300">
                                                    {formatBytes(
                                                        image.original_size,
                                                    )}
                                                </div>
                                            </div>
                                            <div className="rounded bg-white/5 p-2 text-gray-500">
                                                Compressed
                                                <div className="mt-1 text-xs text-gray-300">
                                                    {formatBytes(
                                                        image.compressed_size,
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {ratio && (
                                            <div className="mb-4 text-xs text-emerald-300">
                                                {ratio}
                                            </div>
                                        )}

                                        {image.quality_metrics && (
                                            <div className="mb-4 grid grid-cols-3 gap-1 text-[10px]">
                                                <div className="rounded bg-white/5 p-1.5 text-gray-500">
                                                    PSNR
                                                    <div className="mt-0.5 text-gray-300">
                                                        {formatMetric(
                                                            image
                                                                .quality_metrics
                                                                .psnr,
                                                            2,
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="rounded bg-white/5 p-1.5 text-gray-500">
                                                    SSIM
                                                    <div className="mt-0.5 text-gray-300">
                                                        {formatMetric(
                                                            image
                                                                .quality_metrics
                                                                .ssim,
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="rounded bg-white/5 p-1.5 text-gray-500">
                                                    MSE
                                                    <div className="mt-0.5 text-gray-300">
                                                        {formatMetric(
                                                            image
                                                                .quality_metrics
                                                                .mse,
                                                            6,
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {image.errors && (
                                            <div className="mb-4 rounded border border-[#ff1b1c]/25 bg-[#ff1b1c]/10 p-2">
                                                <div className="mb-1 text-[10px] font-semibold text-[#ff8b8c] uppercase">
                                                    ML error
                                                </div>
                                                <div className="line-clamp-3 text-xs break-words text-[#ff6b6c]">
                                                    {shortError(image.errors)}
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-auto flex items-center justify-between gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    router.get(
                                                        route(
                                                            'compressions.show',
                                                            image.id,
                                                        ),
                                                    )
                                                }
                                                className="grid h-8 w-8 place-items-center rounded border border-white/10 text-gray-400 transition hover:bg-white/5 hover:text-white"
                                                title="Open"
                                            >
                                                <EyeIcon className="h-4 w-4" />
                                            </button>

                                            <div className="flex items-center gap-2">
                                                {isActive && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            cancelImage(image)
                                                        }
                                                        className="grid h-8 w-8 place-items-center rounded border border-white/10 text-gray-400 transition hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-300"
                                                        title="Cancel"
                                                    >
                                                        {image.status ===
                                                        'compressing' ? (
                                                            <StopIcon className="h-4 w-4" />
                                                        ) : (
                                                            <ArrowPathIcon className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                )}

                                                {image.status === 'error' && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            retryImage(image)
                                                        }
                                                        className="grid h-8 w-8 place-items-center rounded border border-white/10 text-gray-400 transition hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-300"
                                                        title="Retry"
                                                    >
                                                        <ArrowPathIcon className="h-4 w-4" />
                                                    </button>
                                                )}

                                                {image.status ===
                                                    'compressed' && (
                                                    <a
                                                        href={route(
                                                            'compressions.decompressed',
                                                            {
                                                                imgMedia:
                                                                    image.id,
                                                                download: 1,
                                                            },
                                                        )}
                                                        className="grid h-8 w-8 place-items-center rounded border border-white/10 text-gray-400 transition hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-300"
                                                        title="Download decompressed"
                                                    >
                                                        <ArrowDownTrayIcon className="h-4 w-4" />
                                                    </a>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        deleteImage(image)
                                                    }
                                                    className="grid h-8 w-8 place-items-center rounded border border-white/10 text-gray-500 transition hover:border-[#ff1b1c]/50 hover:bg-[#ff1b1c]/10 hover:text-[#ff1b1c]"
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {lastPage > 1 && (
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                        <div className="text-xs text-gray-500">
                            Showing {images.from ?? 0}-{images.to ?? 0} of{' '}
                            {images.total}
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="h-8 rounded border border-white/10 px-3 text-xs text-gray-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Previous
                            </button>

                            {pages[0] > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => goToPage(1)}
                                        className="grid h-8 w-8 place-items-center rounded border border-white/10 text-xs text-gray-400 transition hover:bg-white/5 hover:text-white"
                                    >
                                        1
                                    </button>
                                    {pages[0] > 2 && (
                                        <span className="px-1 text-xs text-gray-600">
                                            ...
                                        </span>
                                    )}
                                </>
                            )}

                            {pages.map((page) => (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => goToPage(page)}
                                    className={`grid h-8 w-8 place-items-center rounded border text-xs transition ${
                                        page === currentPage
                                            ? 'border-[#ff1b1c] bg-[#ff1b1c] text-white'
                                            : 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}

                            {pages[pages.length - 1] < lastPage && (
                                <>
                                    {pages[pages.length - 1] < lastPage - 1 && (
                                        <span className="px-1 text-xs text-gray-600">
                                            ...
                                        </span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => goToPage(lastPage)}
                                        className="grid h-8 w-8 place-items-center rounded border border-white/10 text-xs text-gray-400 transition hover:bg-white/5 hover:text-white"
                                    >
                                        {lastPage}
                                    </button>
                                </>
                            )}

                            <button
                                type="button"
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === lastPage}
                                className="h-8 rounded border border-white/10 px-3 text-xs text-gray-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
