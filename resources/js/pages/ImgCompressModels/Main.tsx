import Layout from '@/components/custom/Layout';
import {
    ArrowPathIcon,
    Cog6ToothIcon,
    CubeIcon,
    PlusIcon,
    TrashIcon,
} from '@heroicons/react/16/solid';
import { router } from '@inertiajs/react';
import { DatabaseIcon, GitBranchIcon } from 'lucide-react';
import { useEffect } from 'react';
import type { ImgCompressModel, PaginatedModels } from './types';

const statusClass: Record<string, string> = {
    queue: 'bg-white/5 text-gray-400',
    run: 'bg-amber-500/10 text-amber-300',
    ready: 'bg-emerald-500/10 text-emerald-300',
    cancel: 'bg-zinc-500/10 text-zinc-400',
    error: 'bg-[#ff1b1c]/10 text-[#ff6b6c]',
};

function formatMetric(value?: number | null, digits = 4) {
    return typeof value === 'number' ? value.toFixed(digits) : '-';
}

export default function Main({ models }: { models: PaginatedModels }) {
    const items = models?.data ?? [];
    const hasActiveTraining = items.some((model) =>
        ['queue', 'run'].includes(model.latest_version?.status ?? ''),
    );

    useEffect(() => {
        if (!hasActiveTraining) {
            return;
        }

        const interval = window.setInterval(() => {
            router.reload({
                only: ['models'],
            });
        }, 5000);

        return () => window.clearInterval(interval);
    }, [hasActiveTraining]);

    const deleteModel = (model: ImgCompressModel) => {
        if (!confirm(`Delete model "${model.name}" with all versions?`)) {
            return;
        }

        router.post(
            route('img-compress-models.delete', model.id),
            {},
            { preserveScroll: true },
        );
    };

    const retryVersion = (versionId: number) => {
        router.post(
            route('img-compress-models.versions.retry', versionId),
            {},
            { preserveScroll: true },
        );
    };

    return (
        <Layout>
            <div className="min-h-screen bg-[#0f0f0f] p-6 text-white">
                <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-sm font-semibold text-gray-300">
                            Compression models
                        </h1>
                        <div className="mt-1 text-xs text-gray-500">
                            {models?.total ?? 0} total
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            router.get(route('img-compress-models.create'))
                        }
                        className="inline-flex h-10 items-center gap-2 rounded bg-[#ff1b1c] px-3 text-sm font-semibold text-white transition hover:bg-[#d91617]"
                    >
                        <PlusIcon className="h-4 w-4" />
                        New model
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className="flex min-h-[320px] items-center justify-center rounded border border-dashed border-white/10 bg-[#141414] text-sm text-gray-500">
                        No compression models yet
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-4">
                        {items.map((model) => {
                            const version = model.latest_version;

                            return (
                                <div
                                    key={model.id}
                                    className="relative flex min-h-72 w-72 flex-col rounded-lg border border-white/10 bg-[#141414] p-4"
                                >
                                    <div className="mb-3 flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <CubeIcon className="h-5 w-5 shrink-0 text-gray-400" />

                                            <div className="min-w-0">
                                                <div className="truncate text-sm font-medium">
                                                    {model.name}
                                                </div>
                                                <div className="mt-0.5 truncate text-[11px] text-gray-600">
                                                    by{' '}
                                                    {model.author?.name ??
                                                        'unknown'}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => deleteModel(model)}
                                            className="grid h-8 w-8 shrink-0 place-items-center rounded border border-white/10 text-gray-500 transition hover:border-[#ff1b1c]/50 hover:bg-[#ff1b1c]/10 hover:text-[#ff1b1c]"
                                            title="Delete model"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {model.description && (
                                        <p className="mb-3 line-clamp-3 text-xs leading-5 text-gray-500">
                                            {model.description}
                                        </p>
                                    )}

                                    {version ? (
                                        <div className="mb-4 rounded bg-white/5 p-3">
                                            <div className="mb-2 flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-300">
                                                    <GitBranchIcon className="h-3.5 w-3.5" />
                                                    v{version.version_number}
                                                </div>

                                                <span
                                                    className={`rounded px-2 py-0.5 text-[10px] ${statusClass[version.status]}`}
                                                >
                                                    {version.status}
                                                </span>
                                            </div>

                                            <div className="mb-2 text-[11px] text-gray-500">
                                                {version.image_resolution}x
                                                {version.image_resolution}
                                            </div>

                                            {['queue', 'run'].includes(
                                                version.status,
                                            ) && (
                                                <div className="mb-3">
                                                    <div className="mb-1 flex items-center justify-between gap-2 text-[10px] text-gray-500">
                                                        <span className="truncate">
                                                            {version.progress
                                                                ?.message ??
                                                                'Waiting for training'}
                                                        </span>
                                                        <span className="shrink-0 text-gray-400">
                                                            {Math.round(
                                                                version
                                                                    .progress
                                                                    ?.percent ??
                                                                    0,
                                                            )}
                                                            %
                                                        </span>
                                                    </div>

                                                    <div className="h-1.5 overflow-hidden rounded bg-white/10">
                                                        <div
                                                            className="h-full rounded bg-amber-400 transition-all"
                                                            style={{
                                                                width: `${Math.min(
                                                                    Math.max(
                                                                        version
                                                                            .progress
                                                                            ?.percent ??
                                                                            0,
                                                                        0,
                                                                    ),
                                                                    100,
                                                                )}%`,
                                                            }}
                                                        />
                                                    </div>

                                                    {version.progress
                                                        ?.total_iterations ? (
                                                        <div className="mt-1 text-[10px] text-gray-600">
                                                            {
                                                                version.progress
                                                                    .completed_steps
                                                            }
                                                            /
                                                            {
                                                                version.progress
                                                                    .total_iterations
                                                            }{' '}
                                                            iterations
                                                        </div>
                                                    ) : null}
                                                </div>
                                            )}

                                            <div className="flex flex-wrap gap-1">
                                                {version.datasets
                                                    .slice(0, 4)
                                                    .map((dataset) => (
                                                        <span
                                                            key={dataset.id}
                                                            className="max-w-28 truncate rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-gray-400"
                                                        >
                                                            {dataset.name}
                                                        </span>
                                                    ))}
                                            </div>

                                            {(version.quality_metrics ??
                                                version.progress
                                                    ?.quality_metrics) && (
                                                <div className="mt-3 grid grid-cols-3 gap-1 text-[10px]">
                                                    {[
                                                        ['PSNR', 'psnr', 2],
                                                        ['SSIM', 'ssim', 4],
                                                        ['MSE', 'mse', 6],
                                                    ].map(
                                                        ([
                                                            label,
                                                            key,
                                                            digits,
                                                        ]) => {
                                                            const metrics =
                                                                version.quality_metrics ??
                                                                version
                                                                    .progress
                                                                    ?.quality_metrics;

                                                            return (
                                                                <div
                                                                    key={key}
                                                                    className="rounded bg-white/5 p-1.5 text-gray-500"
                                                                >
                                                                    {label}
                                                                    <div className="mt-0.5 text-gray-300">
                                                                        {formatMetric(
                                                                            metrics?.[
                                                                                key as keyof typeof metrics
                                                                            ] as
                                                                                | number
                                                                                | null
                                                                                | undefined,
                                                                            digits as number,
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            )}

                                            {version.status === 'error' &&
                                                version.errors && (
                                                    <div className="mt-3 rounded border border-[#ff1b1c]/25 bg-[#ff1b1c]/10 p-2">
                                                        <div className="mb-1 text-[10px] font-semibold uppercase text-[#ff8b8c]">
                                                            ML error
                                                        </div>
                                                        <div className="line-clamp-3 break-words text-xs text-[#ff6b6c]">
                                                            {version.errors
                                                                .replace(
                                                                    /\s+/g,
                                                                    ' ',
                                                                )
                                                                .slice(
                                                                    0,
                                                                    1000,
                                                                )}
                                                        </div>
                                                    </div>
                                                )}
                                        </div>
                                    ) : (
                                        <div className="mb-4 rounded border border-dashed border-white/10 p-3 text-xs text-gray-500">
                                            No versions
                                        </div>
                                    )}

                                    <div className="mt-auto flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                                            <DatabaseIcon className="h-3.5 w-3.5" />
                                            {model.versions_count ?? 0} versions
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                router.get(
                                                    route(
                                                        'img-compress-models.versions.edit',
                                                        model.id,
                                                    ),
                                                )
                                            }
                                            className="inline-flex h-8 items-center gap-1.5 rounded border border-white/10 px-2 text-xs font-semibold text-gray-300 transition hover:bg-white/5"
                                        >
                                            <Cog6ToothIcon className="h-3.5 w-3.5" />
                                            Versions
                                        </button>

                                        {version?.status === 'error' && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    retryVersion(version.id)
                                                }
                                                className="grid h-8 w-8 place-items-center rounded border border-amber-500/30 text-amber-300 transition hover:bg-amber-500/10"
                                                title="Retry training"
                                            >
                                                <ArrowPathIcon className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Layout>
    );
}
