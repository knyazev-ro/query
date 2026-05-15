import Layout from '@/components/custom/Layout';
import { FolderIcon, PlusIcon, TrashIcon } from '@heroicons/react/16/solid';
import { router } from '@inertiajs/react';

type Dataset = {
    id: number;
    name: string;
    description?: string | null;
    rotation_degree: number;
    do_flip: boolean;
    image_resolution: number;
    train_split: number;
    test_split: number;
    images_count: number;
    uses_count: number;
    original_filename?: string | null;
    profile?: DatasetProfile | null;
};

type DatasetProfile = {
    supported_files_count?: number;
    broken_files_count?: number;
    empty_directories_count?: number;
    min_width?: number | null;
    min_height?: number | null;
    max_width?: number | null;
    max_height?: number | null;
    avg_width?: number | null;
    avg_height?: number | null;
    format_counts?: Record<string, number>;
    size_buckets?: Record<string, number>;
    resolutions?: string[];
};

type PaginatedDatasets = {
    data: Dataset[];
    total: number;
};

function formatResolution(width?: number | null, height?: number | null) {
    return width && height ? `${Math.round(width)}x${Math.round(height)}` : '-';
}

function topFormats(profile?: DatasetProfile | null) {
    return Object.entries(profile?.format_counts ?? {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
}

export default function Main({ datasets }: { datasets: PaginatedDatasets }) {
    const items = datasets?.data ?? [];

    const deleteDataset = (dataset: Dataset) => {
        if (!confirm(`Delete dataset "${dataset.name}"?`)) {
            return;
        }

        router.post(
            route('datasets.delete', dataset.id),
            {},
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <Layout>
            <div className="min-h-screen bg-[#0f0f0f] p-6 text-white">
                <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-sm font-semibold text-gray-300">
                            Datasets
                        </h1>
                        <div className="mt-1 text-xs text-gray-500">
                            {datasets?.total ?? 0} total
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.get(route('datasets.create'))}
                        className="inline-flex h-10 items-center gap-2 rounded bg-[#ff1b1c] px-3 text-sm font-semibold text-white transition hover:bg-[#d91617]"
                    >
                        <PlusIcon className="h-4 w-4" />
                        New dataset
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className="flex min-h-[320px] items-center justify-center rounded border border-dashed border-white/10 bg-[#141414] text-sm text-gray-500">
                        No datasets yet
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-4">
                        {items.map((ds) => (
                            <div
                                key={ds.id}
                                className="relative flex min-h-96 w-72 flex-col rounded-lg border border-white/10 bg-[#141414] p-4"
                            >
                                <div className="mb-3 flex items-start justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <FolderIcon className="h-5 w-5 shrink-0 text-gray-400" />

                                        <div className="min-w-0">
                                            <div className="truncate text-sm font-medium">
                                                {ds.name}
                                            </div>
                                            {ds.original_filename && (
                                                <div className="mt-0.5 truncate text-[11px] text-gray-600">
                                                    {ds.original_filename}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => deleteDataset(ds)}
                                        className="grid h-8 w-8 shrink-0 place-items-center rounded border border-white/10 text-gray-500 transition hover:border-[#ff1b1c]/50 hover:bg-[#ff1b1c]/10 hover:text-[#ff1b1c]"
                                        title="Delete dataset"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>

                                {ds.description && (
                                    <p className="mb-3 line-clamp-3 text-xs leading-5 text-gray-500">
                                        {ds.description}
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-1 text-[11px] leading-tight">
                                    <span className="rounded bg-white/5 px-2 py-0.5 text-gray-400">
                                        {ds.images_count.toLocaleString()} img
                                    </span>

                                    <span className="rounded bg-white/5 px-2 py-0.5 text-gray-400">
                                        {ds.image_resolution}x
                                        {ds.image_resolution}
                                    </span>

                                    <span className="rounded bg-white/5 px-2 py-0.5 text-gray-400">
                                        rot {ds.rotation_degree} deg
                                    </span>

                                    {ds.do_flip && (
                                        <span className="rounded bg-white/5 px-2 py-0.5 text-gray-400">
                                            flip
                                        </span>
                                    )}

                                    <span className="rounded bg-white/5 px-2 py-0.5 text-gray-400">
                                        train {ds.train_split}%
                                    </span>

                                    <span className="rounded bg-white/5 px-2 py-0.5 text-gray-400">
                                        test {ds.test_split}%
                                    </span>
                                </div>

                                {ds.profile && (
                                    <div className="mt-4 space-y-3 rounded border border-white/10 bg-[#101010] p-3">
                                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                                            <ProfileValue
                                                label="min"
                                                value={formatResolution(
                                                    ds.profile.min_width,
                                                    ds.profile.min_height,
                                                )}
                                            />
                                            <ProfileValue
                                                label="max"
                                                value={formatResolution(
                                                    ds.profile.max_width,
                                                    ds.profile.max_height,
                                                )}
                                            />
                                            <ProfileValue
                                                label="avg"
                                                value={formatResolution(
                                                    ds.profile.avg_width,
                                                    ds.profile.avg_height,
                                                )}
                                            />
                                            <ProfileValue
                                                label="files"
                                                value={`${ds.profile.supported_files_count ?? ds.images_count}`}
                                            />
                                        </div>

                                        <div className="flex flex-wrap gap-1">
                                            {topFormats(ds.profile).map(
                                                ([format, count]) => (
                                                    <span
                                                        key={format}
                                                        className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-gray-400"
                                                    >
                                                        {format} {count}
                                                    </span>
                                                ),
                                            )}
                                        </div>

                                        <SizeBuckets
                                            buckets={ds.profile.size_buckets}
                                        />

                                        {((ds.profile.broken_files_count ??
                                            0) > 0 ||
                                            (ds.profile
                                                .empty_directories_count ??
                                                0) > 0) && (
                                            <div className="rounded border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[10px] text-amber-300">
                                                broken{' '}
                                                {ds.profile
                                                    .broken_files_count ?? 0}
                                                , empty folders{' '}
                                                {ds.profile
                                                    .empty_directories_count ??
                                                    0}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="mt-auto pt-4 text-right text-[11px] text-gray-500">
                                    {ds.uses_count} uses
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}

function ProfileValue({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded bg-white/5 p-2">
            <div className="text-gray-600">{label}</div>
            <div className="mt-0.5 truncate text-gray-300">{value}</div>
        </div>
    );
}

function SizeBuckets({ buckets }: { buckets?: Record<string, number> }) {
    const entries = Object.entries(buckets ?? {}).filter(([, count]) => count > 0);
    const total = entries.reduce((sum, [, count]) => sum + count, 0);

    if (entries.length === 0 || total === 0) {
        return null;
    }

    return (
        <div className="space-y-1.5">
            {entries.map(([label, count]) => (
                <div key={label}>
                    <div className="mb-1 flex justify-between text-[10px] text-gray-500">
                        <span>{label}</span>
                        <span>{count}</span>
                    </div>
                    <div className="h-1 overflow-hidden rounded bg-white/10">
                        <div
                            className="h-full rounded bg-[#ff1b1c]"
                            style={{ width: `${(count / total) * 100}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
