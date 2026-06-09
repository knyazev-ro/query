import Layout from '@/components/custom/Layout';
import { router } from '@inertiajs/react';
import { ArrowLeft, Download, ExternalLink } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';
import type {
    BenchmarkMethodMetrics,
    BenchmarkRun,
    ImgBenchmark,
} from './types';

const statusClass: Record<string, string> = {
    pending: 'bg-white/5 text-gray-500',
    queue: 'bg-white/5 text-gray-400',
    run: 'bg-amber-500/10 text-amber-300',
    ready: 'bg-emerald-500/10 text-emerald-300',
    cancel: 'bg-zinc-500/10 text-zinc-400',
    error: 'bg-[#ff1b1c]/10 text-[#ff6b6c]',
};

function formatBytes(bytes?: number | null) {
    if (bytes == null) {
        return '-';
    }

    const units = ['B', 'KB', 'MB', 'GB'];
    const index =
        bytes > 0
            ? Math.min(
                  Math.floor(Math.log(bytes) / Math.log(1024)),
                  units.length - 1,
              )
            : 0;

    return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatMetric(value?: number | null, digits = 4) {
    return typeof value === 'number' ? value.toFixed(digits) : '-';
}

export default function Show({ benchmark }: { benchmark: ImgBenchmark }) {
    const active = ['queue', 'run'].includes(benchmark.status);

    useEffect(() => {
        if (!active) {
            return;
        }

        const interval = window.setInterval(() => {
            router.reload({ only: ['benchmark'] });
        }, 5000);

        return () => window.clearInterval(interval);
    }, [active]);

    return (
        <Layout>
            <div className="min-h-screen bg-[#0f0f0f] p-6 pb-24 text-white">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <h1 className="text-sm font-semibold text-gray-300">
                                {benchmark.name}
                            </h1>
                            <span
                                className={`rounded px-2 py-0.5 text-[10px] ${statusClass[benchmark.status]}`}
                            >
                                {benchmark.status}
                            </span>
                        </div>
                        <div className="text-xs text-gray-500">
                            {benchmark.summary?.completed_models_count ?? 0}/
                            {benchmark.summary?.models_count ??
                                benchmark.runs.length}{' '}
                            models / {benchmark.summary?.images_count ?? 0}{' '}
                            images
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={route('benchmarks.export', benchmark.id)}
                            className="inline-flex h-10 items-center gap-2 rounded border border-white/10 px-3 text-sm font-semibold text-gray-300 transition hover:bg-white/5"
                        >
                            <Download className="h-4 w-4" />
                            CSV
                        </a>
                        <button
                            type="button"
                            onClick={() =>
                                router.get(route('benchmarks.index'))
                            }
                            className="inline-flex h-10 items-center gap-2 rounded border border-white/10 px-3 text-sm font-semibold text-gray-300 transition hover:bg-white/5"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </button>
                    </div>
                </div>

                <div className="mb-6 overflow-x-auto rounded border border-white/10 bg-[#141414]">
                    <table className="w-full min-w-[980px] text-left text-xs">
                        <thead className="bg-white/5 text-gray-500">
                            <tr>
                                <th className="px-3 py-3 font-medium">Model</th>
                                <th className="px-3 py-3 font-medium">
                                    Status
                                </th>
                                <th className="px-3 py-3 font-medium">Done</th>
                                <th className="px-3 py-3 font-medium">
                                    ML saved
                                </th>
                                <th className="px-3 py-3 font-medium">
                                    ML PSNR
                                </th>
                                <th className="px-3 py-3 font-medium">
                                    JPEG PSNR
                                </th>
                                <th className="px-3 py-3 font-medium">
                                    WebP PSNR
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {benchmark.runs.map((run) => (
                                <tr
                                    key={run.id}
                                    className="border-t border-white/10 text-gray-300"
                                >
                                    <td className="px-3 py-3">
                                        {run.position}.{' '}
                                        {run.model_version?.model?.name ??
                                            'Deleted model'}{' '}
                                        v
                                        {run.model_version?.version_number ??
                                            '-'}
                                    </td>
                                    <td className="px-3 py-3">
                                        <span
                                            className={`rounded px-2 py-0.5 text-[10px] ${statusClass[run.status]}`}
                                        >
                                            {run.status}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3">
                                        {run.summary?.completed_count ?? 0}/
                                        {run.summary?.images_count ??
                                            run.images.length}
                                    </td>
                                    <td className="px-3 py-3">
                                        {run.summary?.methods.ml
                                            .avg_saved_percent != null
                                            ? `${formatMetric(run.summary.methods.ml.avg_saved_percent, 2)}%`
                                            : '-'}
                                    </td>
                                    <td className="px-3 py-3">
                                        {formatMetric(
                                            run.summary?.methods.ml.avg_psnr,
                                            2,
                                        )}
                                    </td>
                                    <td className="px-3 py-3">
                                        {formatMetric(
                                            run.summary?.methods.jpeg.avg_psnr,
                                            2,
                                        )}
                                    </td>
                                    <td className="px-3 py-3">
                                        {formatMetric(
                                            run.summary?.methods.webp.avg_psnr,
                                            2,
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="space-y-6">
                    {benchmark.runs.map((run) => (
                        <RunDetails key={run.id} run={run} />
                    ))}
                </div>
            </div>
        </Layout>
    );
}

function RunDetails({ run }: { run: BenchmarkRun }) {
    const methods = ['ml', 'jpeg', 'webp'] as const;

    return (
        <section className="border-t border-white/10 pt-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-sm font-semibold text-gray-300">
                        {run.position}.{' '}
                        {run.model_version?.model?.name ?? 'Deleted model'} v
                        {run.model_version?.version_number ?? '-'}
                    </h2>
                    <div className="mt-1 text-xs text-gray-600">
                        {run.model_version?.image_resolution ?? '-'}x
                        {run.model_version?.image_resolution ?? '-'}
                    </div>
                </div>
                <span
                    className={`rounded px-2 py-1 text-[10px] ${statusClass[run.status]}`}
                >
                    {run.status}
                </span>
            </div>

            <div className="mb-4 overflow-x-auto rounded border border-white/10 bg-[#141414]">
                <table className="w-full min-w-[760px] text-left text-xs">
                    <thead className="bg-white/5 text-gray-500">
                        <tr>
                            <th className="px-3 py-3 font-medium">Method</th>
                            <th className="px-3 py-3 font-medium">
                                Average size
                            </th>
                            <th className="px-3 py-3 font-medium">Saved</th>
                            <th className="px-3 py-3 font-medium">PSNR</th>
                            <th className="px-3 py-3 font-medium">SSIM</th>
                            <th className="px-3 py-3 font-medium">MSE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {methods.map((method) => {
                            const summary = run.summary?.methods[method];

                            return (
                                <tr
                                    key={method}
                                    className="border-t border-white/10 text-gray-300"
                                >
                                    <td className="px-3 py-3 uppercase">
                                        {method}
                                    </td>
                                    <td className="px-3 py-3">
                                        {formatBytes(summary?.avg_size)}
                                    </td>
                                    <td className="px-3 py-3">
                                        {summary?.avg_saved_percent != null
                                            ? `${formatMetric(summary.avg_saved_percent, 2)}%`
                                            : '-'}
                                    </td>
                                    <td className="px-3 py-3">
                                        {formatMetric(summary?.avg_psnr, 2)}
                                    </td>
                                    <td className="px-3 py-3">
                                        {formatMetric(summary?.avg_ssim)}
                                    </td>
                                    <td className="px-3 py-3">
                                        {formatMetric(summary?.avg_mse, 6)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="overflow-x-auto rounded border border-white/10 bg-[#141414]">
                <table className="w-full min-w-[1080px] text-left text-xs">
                    <thead className="bg-white/5 text-gray-500">
                        <tr>
                            <th className="px-3 py-3 font-medium">Image</th>
                            <th className="px-3 py-3 font-medium">Status</th>
                            <th className="px-3 py-3 font-medium">Method</th>
                            <th className="px-3 py-3 font-medium">Original</th>
                            <th className="px-3 py-3 font-medium">Result</th>
                            <th className="px-3 py-3 font-medium">Saved</th>
                            <th className="px-3 py-3 font-medium">PSNR</th>
                            <th className="px-3 py-3 font-medium">SSIM</th>
                            <th className="px-3 py-3 font-medium">MSE</th>
                            <th className="px-3 py-3 font-medium">Quality</th>
                        </tr>
                    </thead>
                    <tbody>
                        {run.images.flatMap((image) =>
                            methods.map((method, methodIndex) => {
                                const metrics =
                                    image.benchmark_methods?.[method] ?? null;

                                return (
                                    <tr
                                        key={`${image.id}-${method}`}
                                        className="border-t border-white/10 text-gray-300"
                                    >
                                        <td className="px-3 py-3">
                                            {methodIndex === 0 ? (
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
                                                    className="inline-flex max-w-64 items-center gap-2 text-left text-gray-300 hover:text-white"
                                                >
                                                    <span className="truncate">
                                                        {image.original_name}
                                                    </span>
                                                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                                                </button>
                                            ) : null}
                                        </td>
                                        <td className="px-3 py-3">
                                            {methodIndex === 0
                                                ? image.status
                                                : null}
                                        </td>
                                        <td className="px-3 py-3 text-gray-500 uppercase">
                                            {method}
                                        </td>
                                        <td className="px-3 py-3">
                                            {formatBytes(image.original_size)}
                                        </td>
                                        <MethodCells metrics={metrics} />
                                    </tr>
                                );
                            }),
                        )}
                    </tbody>
                </table>
            </div>

            {run.errors && (
                <div className="mt-3 rounded border border-[#ff1b1c]/25 bg-[#ff1b1c]/10 p-3 text-xs text-[#ff6b6c]">
                    {run.errors}
                </div>
            )}
        </section>
    );
}

function MethodCells({ metrics }: { metrics: BenchmarkMethodMetrics | null }) {
    return (
        <>
            <td className="px-3 py-3">{formatBytes(metrics?.size)}</td>
            <td className="px-3 py-3">
                {metrics?.saved_percent != null
                    ? `${formatMetric(metrics.saved_percent, 2)}%`
                    : '-'}
            </td>
            <td className="px-3 py-3">{formatMetric(metrics?.psnr, 2)}</td>
            <td className="px-3 py-3">{formatMetric(metrics?.ssim)}</td>
            <td className="px-3 py-3">{formatMetric(metrics?.mse, 6)}</td>
            <td className="px-3 py-3">
                {metrics?.quality != null ? `q${metrics.quality}` : '-'}
            </td>
        </>
    );
}
