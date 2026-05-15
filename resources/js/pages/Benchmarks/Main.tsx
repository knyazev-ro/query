import Layout from '@/components/custom/Layout';
import {
    BeakerIcon,
    EyeIcon,
    PlusIcon,
    TrashIcon,
} from '@heroicons/react/16/solid';
import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';
import type { ImgBenchmark, PaginatedBenchmarks } from './types';

const statusClass: Record<string, string> = {
    queue: 'bg-white/5 text-gray-400',
    run: 'bg-amber-500/10 text-amber-300',
    ready: 'bg-emerald-500/10 text-emerald-300',
    cancel: 'bg-zinc-500/10 text-zinc-400',
    error: 'bg-[#ff1b1c]/10 text-[#ff6b6c]',
};

function formatMetric(value?: number | null, digits = 2) {
    return typeof value === 'number' ? value.toFixed(digits) : '-';
}

function formatBytes(bytes?: number | null) {
    if (!bytes) {
        return '-';
    }

    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1,
    );

    return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export default function Main({
    benchmarks,
}: {
    benchmarks: PaginatedBenchmarks;
}) {
    const items = benchmarks?.data ?? [];
    const hasActive = items.some((benchmark) =>
        ['queue', 'run'].includes(benchmark.status),
    );

    useEffect(() => {
        if (!hasActive) {
            return;
        }

        const interval = window.setInterval(() => {
            router.reload({ only: ['benchmarks'] });
        }, 5000);

        return () => window.clearInterval(interval);
    }, [hasActive]);

    const deleteBenchmark = (benchmark: ImgBenchmark) => {
        if (!confirm(`Delete benchmark "${benchmark.name}"?`)) {
            return;
        }

        router.post(
            route('benchmarks.delete', benchmark.id),
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
                            Batch benchmarks
                        </h1>
                        <div className="mt-1 text-xs text-gray-500">
                            {benchmarks?.total ?? 0} total
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.get(route('benchmarks.create'))}
                        className="inline-flex h-10 items-center gap-2 rounded bg-[#ff1b1c] px-3 text-sm font-semibold text-white transition hover:bg-[#d91617]"
                    >
                        <PlusIcon className="h-4 w-4" />
                        New benchmark
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className="flex min-h-[320px] items-center justify-center rounded border border-dashed border-white/10 bg-[#141414] text-sm text-gray-500">
                        No benchmarks yet
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-4">
                        {items.map((benchmark) => {
                            const ml = benchmark.summary?.methods?.ml;

                            return (
                                <div
                                    key={benchmark.id}
                                    className="flex min-h-72 w-80 flex-col rounded-lg border border-white/10 bg-[#141414] p-4"
                                >
                                    <div className="mb-3 flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <BeakerIcon className="h-5 w-5 shrink-0 text-gray-400" />
                                            <div className="min-w-0">
                                                <div className="truncate text-sm font-medium">
                                                    {benchmark.name}
                                                </div>
                                                <div className="mt-0.5 truncate text-[11px] text-gray-600">
                                                    {benchmark.model_version
                                                        ?.model?.name ??
                                                        'model'}{' '}
                                                    v
                                                    {benchmark.model_version
                                                        ?.version_number ??
                                                        '-'}
                                                </div>
                                            </div>
                                        </div>
                                        <span
                                            className={`rounded px-2 py-0.5 text-[10px] ${statusClass[benchmark.status]}`}
                                        >
                                            {benchmark.status}
                                        </span>
                                    </div>

                                    <div className="mb-4 grid grid-cols-3 gap-2 text-[11px]">
                                        <Metric
                                            label="done"
                                            value={`${benchmark.summary?.completed_count ?? 0}/${benchmark.summary?.images_count ?? benchmark.images_count ?? 0}`}
                                        />
                                        <Metric
                                            label="saved"
                                            value={
                                                ml?.avg_saved_percent != null
                                                    ? `${formatMetric(ml.avg_saved_percent, 1)}%`
                                                    : '-'
                                            }
                                        />
                                        <Metric
                                            label="size"
                                            value={formatBytes(ml?.avg_size)}
                                        />
                                    </div>

                                    <div className="mb-4 grid grid-cols-3 gap-1 text-[10px]">
                                        <Metric
                                            label="PSNR"
                                            value={formatMetric(
                                                ml?.avg_psnr,
                                                2,
                                            )}
                                        />
                                        <Metric
                                            label="SSIM"
                                            value={formatMetric(
                                                ml?.avg_ssim,
                                                4,
                                            )}
                                        />
                                        <Metric
                                            label="MSE"
                                            value={formatMetric(ml?.avg_mse, 6)}
                                        />
                                    </div>

                                    {benchmark.errors && (
                                        <div className="mb-4 rounded border border-[#ff1b1c]/25 bg-[#ff1b1c]/10 p-2 text-xs text-[#ff6b6c]">
                                            {benchmark.errors
                                                .replace(/\s+/g, ' ')
                                                .slice(0, 280)}
                                        </div>
                                    )}

                                    <div className="mt-auto flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                router.get(
                                                    route(
                                                        'benchmarks.show',
                                                        benchmark.id,
                                                    ),
                                                )
                                            }
                                            className="grid h-8 w-8 place-items-center rounded border border-white/10 text-gray-400 transition hover:bg-white/5 hover:text-white"
                                            title="Open"
                                        >
                                            <EyeIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                deleteBenchmark(benchmark)
                                            }
                                            className="grid h-8 w-8 place-items-center rounded border border-white/10 text-gray-500 transition hover:border-[#ff1b1c]/50 hover:bg-[#ff1b1c]/10 hover:text-[#ff1b1c]"
                                            title="Delete"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
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

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded bg-white/5 p-2 text-gray-500">
            {label}
            <div className="mt-1 truncate text-gray-300">{value}</div>
        </div>
    );
}
