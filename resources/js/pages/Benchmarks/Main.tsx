import Layout from '@/components/custom/Layout';
import { router } from '@inertiajs/react';
import { Beaker, Eye, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';
import type {
    BenchmarkRun,
    BenchmarkSummaryRun,
    ImgBenchmark,
    PaginatedBenchmarks,
} from './types';

const statusClass: Record<string, string> = {
    pending: 'bg-white/5 text-gray-400',
    queue: 'bg-white/5 text-gray-400',
    run: 'bg-amber-500/10 text-amber-300',
    ready: 'bg-emerald-500/10 text-emerald-300',
    cancel: 'bg-zinc-500/10 text-zinc-400',
    error: 'bg-[#ff1b1c]/10 text-[#ff6b6c]',
};

function formatMetric(value?: number | null, digits = 2) {
    return typeof value === 'number' ? value.toFixed(digits) : '-';
}

function modelName(run: BenchmarkRun | BenchmarkSummaryRun) {
    return 'model_name' in run
        ? run.model_name
        : (run as BenchmarkRun).model_version?.model?.name;
}

function versionNumber(run: BenchmarkRun | BenchmarkSummaryRun) {
    return 'version_number' in run
        ? run.version_number
        : (run as BenchmarkRun).model_version?.version_number;
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
                            Benchmarks
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
                        <Plus className="h-4 w-4" />
                        New benchmark
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className="flex min-h-[320px] items-center justify-center rounded border border-dashed border-white/10 bg-[#141414] text-sm text-gray-500">
                        No benchmarks yet
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        {items.map((benchmark) => {
                            const runs =
                                benchmark.summary?.runs ?? benchmark.runs ?? [];
                            const current =
                                runs.find((run) =>
                                    ['queue', 'run'].includes(run.status),
                                ) ?? runs.at(-1);
                            const ml = current?.summary?.methods?.ml;
                            const modelNames = runs
                                .map((run) => {
                                    return `${modelName(run) ?? 'model'} v${versionNumber(run) ?? '-'}`;
                                })
                                .join(', ');

                            return (
                                <div
                                    key={benchmark.id}
                                    className="flex min-h-64 flex-col rounded-lg border border-white/10 bg-[#141414] p-4"
                                >
                                    <div className="mb-3 flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <Beaker className="h-5 w-5 shrink-0 text-gray-400" />
                                            <div className="min-w-0">
                                                <div className="truncate text-sm font-medium">
                                                    {benchmark.name}
                                                </div>
                                                <div className="mt-0.5 line-clamp-2 text-[11px] text-gray-600">
                                                    {modelNames}
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
                                            label="models"
                                            value={`${benchmark.summary?.completed_models_count ?? 0}/${benchmark.summary?.models_count ?? runs.length}`}
                                        />
                                        <Metric
                                            label="images"
                                            value={`${current?.summary?.completed_count ?? 0}/${benchmark.summary?.images_count ?? current?.summary?.images_count ?? 0}`}
                                        />
                                        <Metric
                                            label="saved"
                                            value={
                                                ml?.avg_saved_percent != null
                                                    ? `${formatMetric(ml.avg_saved_percent, 1)}%`
                                                    : '-'
                                            }
                                        />
                                    </div>

                                    <div className="mb-4 text-xs text-gray-500">
                                        Current:{' '}
                                        <span className="text-gray-300">
                                            {current
                                                ? `${modelName(current) ?? 'model'} v${versionNumber(current) ?? '-'}`
                                                : '-'}
                                        </span>
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
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                deleteBenchmark(benchmark)
                                            }
                                            className="grid h-8 w-8 place-items-center rounded border border-white/10 text-gray-500 transition hover:border-[#ff1b1c]/50 hover:bg-[#ff1b1c]/10 hover:text-[#ff1b1c]"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
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
