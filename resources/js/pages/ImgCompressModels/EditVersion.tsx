import Layout from '@/components/custom/Layout';
import {
    ArrowLeftIcon,
    ArrowPathIcon,
    CheckIcon,
    PlusIcon,
    StopIcon,
    TrashIcon,
} from '@heroicons/react/16/solid';
import { router, useForm } from '@inertiajs/react';
import { GitBranchIcon } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { Dataset, ImgCompressModel, ModelVersion } from './types';
import VersionGraph from './VersionGraph';

type VersionForm = {
    img_compress_model_id: number;
    parent_version_id: number | '';
    dataset_ids: number[];
    image_resolution: number;
    status: 'queue' | 'run' | 'ready' | 'cancel' | 'error';
    errors: string;
};

type ModelForm = {
    name: string;
    description: string;
};

function formatMetric(value?: number | null, digits = 4) {
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

function formatDuration(seconds?: number | null) {
    if (!seconds) {
        return '-';
    }

    const minutes = Math.floor(seconds / 60);
    const rest = Math.round(seconds % 60);

    return minutes > 0 ? `${minutes}m ${rest}s` : `${rest}s`;
}

function versionMetrics(version?: ModelVersion | null) {
    return (
        version?.quality_metrics ??
        version?.training_report?.quality_metrics ??
        version?.progress?.quality_metrics ??
        null
    );
}

const statusClass: Record<string, string> = {
    queue: 'bg-white/5 text-gray-400',
    run: 'bg-amber-500/10 text-amber-300',
    ready: 'bg-emerald-500/10 text-emerald-300',
    cancel: 'bg-zinc-500/10 text-zinc-400',
    error: 'bg-[#ff1b1c]/10 text-[#ff6b6c]',
};

export default function EditVersion({
    imgCompressModel,
    datasets,
}: {
    imgCompressModel: ImgCompressModel;
    datasets: Dataset[];
}) {
    const versions = imgCompressModel.versions ?? [];
    const [selectedVersionId, setSelectedVersionId] = useState<number | null>(
        versions[0]?.id ?? null,
    );

    const selectedVersion = useMemo(
        () => versions.find((version) => version.id === selectedVersionId),
        [selectedVersionId, versions],
    );
    const hasActiveTraining = versions.some((version) =>
        ['queue', 'run'].includes(version.status),
    );

    useEffect(() => {
        if (!hasActiveTraining) {
            return;
        }

        const interval = window.setInterval(() => {
            router.reload({
                only: ['imgCompressModel'],
            });
        }, 5000);

        return () => window.clearInterval(interval);
    }, [hasActiveTraining]);

    const modelForm = useForm<ModelForm>({
        name: imgCompressModel.name,
        description: imgCompressModel.description ?? '',
    });

    const createForm = useForm<VersionForm>({
        img_compress_model_id: imgCompressModel.id,
        parent_version_id: versions[versions.length - 1]?.id ?? '',
        dataset_ids: [],
        image_resolution:
            versions[versions.length - 1]?.image_resolution ?? 256,
        status: 'queue',
        errors: '',
    });

    const editForm = useForm<VersionForm>({
        img_compress_model_id: imgCompressModel.id,
        parent_version_id: selectedVersion?.parent_version_id ?? '',
        dataset_ids: selectedVersion?.datasets.map((dataset) => dataset.id) ?? [],
        image_resolution: selectedVersion?.image_resolution ?? 256,
        status: selectedVersion?.status ?? 'queue',
        errors: selectedVersion?.errors ?? '',
    });

    const selectVersion = (version: ModelVersion) => {
        setSelectedVersionId(version.id);
        editForm.setData({
            img_compress_model_id: imgCompressModel.id,
            parent_version_id: version.parent_version_id ?? '',
            dataset_ids: version.datasets.map((dataset) => dataset.id),
            image_resolution: version.image_resolution,
            status: version.status,
            errors: version.errors ?? '',
        });
    };

    const toggleDataset = (
        form: typeof createForm | typeof editForm,
        datasetId: number,
    ) => {
        form.setData(
            'dataset_ids',
            form.data.dataset_ids.includes(datasetId)
                ? form.data.dataset_ids.filter((id) => id !== datasetId)
                : [...form.data.dataset_ids, datasetId],
        );
    };

    const submitCreate = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const parentId = createForm.data.parent_version_id;
        const routeName = 'img-compress-models.versions.store';
        const url =
            parentId === ''
                ? route(routeName)
                : route(routeName, parentId);

        createForm.post(url, { preserveScroll: true });
    };

    const submitModel = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        modelForm.post(
            route('img-compress-models.update', imgCompressModel.id),
            { preserveScroll: true },
        );
    };

    const submitEdit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedVersion) {
            return;
        }

        editForm.post(
            route('img-compress-models.versions.update', selectedVersion.id),
            { preserveScroll: true },
        );
    };

    const deleteVersion = (version: ModelVersion) => {
        const active = ['queue', 'run'].includes(version.status);
        const message = active
            ? `Cancel training and delete version v${version.version_number}?`
            : `Delete version v${version.version_number}?`;

        if (!confirm(message)) {
            return;
        }

        router.post(
            route('img-compress-models.versions.delete', version.id),
            {},
            { preserveScroll: true },
        );
    };

    const retryVersion = (version: ModelVersion) => {
        router.post(
            route('img-compress-models.versions.retry', version.id),
            {},
            { preserveScroll: true },
        );
    };

    const cancelVersion = (version: ModelVersion) => {
        router.post(
            route('img-compress-models.versions.cancel', version.id),
            {},
            { preserveScroll: true },
        );
    };

    const fieldClass =
        'h-10 rounded border border-white/10 bg-[#101010] px-3 text-sm text-white outline-none transition placeholder:text-gray-700 focus:border-[#ff1b1c]/70';
    const labelClass = 'text-xs font-medium text-gray-400';

    return (
        <Layout>
            <div className="min-h-screen bg-[#0f0f0f] p-6 text-white">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-sm font-semibold text-gray-300">
                            {imgCompressModel.name}
                        </h1>
                        <div className="mt-1 text-xs text-gray-500">
                            Versions and training datasets
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            router.get(route('img-compress-models.index'))
                        }
                        className="inline-flex h-10 items-center gap-2 rounded border border-white/10 px-3 text-sm font-semibold text-gray-300 transition hover:bg-white/5"
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                        Back
                    </button>
                </div>

                <form
                    onSubmit={submitModel}
                    className="mb-5 grid grid-cols-1 gap-4 rounded border border-white/10 bg-[#141414] p-4 lg:grid-cols-[280px_minmax(0,1fr)_auto]"
                >
                    <div className="grid gap-2">
                        <label className={labelClass}>Model name</label>
                        <input
                            value={modelForm.data.name}
                            onChange={(event) =>
                                modelForm.setData('name', event.target.value)
                            }
                            className={fieldClass}
                        />
                    </div>

                    <div className="grid gap-2">
                        <label className={labelClass}>Description</label>
                        <input
                            value={modelForm.data.description}
                            onChange={(event) =>
                                modelForm.setData(
                                    'description',
                                    event.target.value,
                                )
                            }
                            className={fieldClass}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={modelForm.processing}
                        className="inline-flex h-10 items-center justify-center gap-2 self-end rounded border border-white/10 px-4 text-sm font-semibold text-gray-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <CheckIcon className="h-4 w-4" />
                        Save model
                    </button>
                </form>

                <ExperimentTable
                    versions={versions}
                    selectedVersionId={selectedVersionId}
                    onSelect={selectVersion}
                />

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[360px_minmax(0,1fr)_360px]">
                    <div>
                        <div className="mb-3 text-xs font-medium text-gray-400">
                            Versions
                        </div>

                        <div className="mb-5 space-y-2">
                            {versions.map((version) => (
                                <button
                                    key={version.id}
                                    type="button"
                                    onClick={() => selectVersion(version)}
                                    className={`w-full rounded border p-3 text-left transition ${
                                        selectedVersion?.id === version.id
                                            ? 'border-[#ff1b1c]/70 bg-[#ff1b1c]/10'
                                            : 'border-white/10 bg-[#141414] hover:bg-white/5'
                                    }`}
                                >
                                    <div className="mb-2 flex items-center justify-between gap-2">
                                        <span className="flex items-center gap-1.5 text-sm font-medium text-gray-200">
                                            <GitBranchIcon className="h-4 w-4" />
                                            v{version.version_number}
                                        </span>
                                        <span
                                            className={`rounded px-2 py-0.5 text-[10px] ${statusClass[version.status]}`}
                                        >
                                            {version.status}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <div className="text-[11px] text-gray-500">
                                                parent:{' '}
                                                {version.parent_version_id
                                                    ? `#${version.parent_version_id}`
                                                    : 'none'}
                                            </div>
                                            <div className="mt-1 text-[11px] text-gray-500">
                                                {version.datasets.length}{' '}
                                                datasets
                                            </div>
                                        </div>

                                        {['queue', 'run'].includes(
                                            version.status,
                                        ) && (
                                            <span className="grid h-8 w-8 place-items-center rounded border border-amber-500/30 text-amber-300">
                                                <StopIcon className="h-4 w-4" />
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="mb-3 text-xs font-medium text-gray-400">
                            Graph overview
                        </div>

                        <VersionGraph
                            versions={versions}
                            selectedVersionId={selectedVersionId}
                            onSelect={selectVersion}
                        />
                    </div>

                    <form onSubmit={submitEdit} className="min-w-0">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <div>
                                <div className="text-xs font-medium text-gray-400">
                                    Edit selected version
                                </div>
                                <div className="mt-1 text-xs text-gray-600">
                                    {selectedVersion
                                        ? `v${selectedVersion.version_number}`
                                        : 'No version selected'}
                                </div>
                            </div>

                            {selectedVersion && (
                                <div className="flex items-center gap-2">
                                    {['queue', 'run'].includes(
                                        selectedVersion.status,
                                    ) && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                cancelVersion(selectedVersion)
                                            }
                                            className="inline-flex h-9 items-center gap-2 rounded border border-amber-500/30 px-3 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/10"
                                        >
                                            <StopIcon className="h-4 w-4" />
                                            Cancel
                                        </button>
                                    )}

                                    {selectedVersion.status === 'error' && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                retryVersion(selectedVersion)
                                            }
                                            className="inline-flex h-9 items-center gap-2 rounded border border-amber-500/30 px-3 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/10"
                                        >
                                            <ArrowPathIcon className="h-4 w-4" />
                                            Retry
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            deleteVersion(selectedVersion)
                                        }
                                        className="inline-flex h-9 items-center gap-2 rounded border border-white/10 px-3 text-xs font-semibold text-gray-400 transition hover:border-[#ff1b1c]/50 hover:bg-[#ff1b1c]/10 hover:text-[#ff1b1c]"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>

                        {selectedVersion && (
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <label className={labelClass}>
                                            Image resolution
                                        </label>
                                        <select
                                            value={editForm.data.image_resolution}
                                            onChange={(event) =>
                                                editForm.setData(
                                                    'image_resolution',
                                                    Number(event.target.value),
                                                )
                                            }
                                            className={fieldClass}
                                        >
                                            <option value={64}>64x64</option>
                                            <option value={128}>128x128</option>
                                            <option value={256}>256x256</option>
                                            <option value={512}>512x512</option>
                                        </select>
                                    </div>

                                    <div className="grid gap-2">
                                        <label className={labelClass}>
                                            Status
                                        </label>
                                        <select
                                            value={editForm.data.status}
                                            onChange={(event) =>
                                                editForm.setData(
                                                    'status',
                                                    event.target
                                                        .value as VersionForm['status'],
                                                )
                                            }
                                            className={fieldClass}
                                        >
                                            <option value="queue">queue</option>
                                            <option value="run">run</option>
                                            <option value="ready">ready</option>
                                            <option value="cancel">cancel</option>
                                            <option value="error">error</option>
                                        </select>
                                    </div>
                                </div>

                                <DatasetPicker
                                    datasets={datasets}
                                    selectedIds={editForm.data.dataset_ids}
                                    onToggle={(datasetId) =>
                                        toggleDataset(editForm, datasetId)
                                    }
                                />

                                {versionMetrics(selectedVersion) && (
                                    <div className="rounded border border-white/10 bg-[#141414] p-4">
                                        <div className="mb-3 text-xs font-medium text-gray-400">
                                            Quality
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                            <MetricBox
                                                label="PSNR"
                                                value={formatMetric(
                                                    versionMetrics(
                                                        selectedVersion,
                                                    )?.psnr,
                                                    2,
                                                )}
                                            />
                                            <MetricBox
                                                label="SSIM"
                                                value={formatMetric(
                                                    versionMetrics(
                                                        selectedVersion,
                                                    )?.ssim,
                                                )}
                                            />
                                            <MetricBox
                                                label="MSE"
                                                value={formatMetric(
                                                    versionMetrics(
                                                        selectedVersion,
                                                    )?.mse,
                                                    6,
                                                )}
                                            />
                                        </div>
                                    </div>
                                )}

                                {selectedVersion.training_report && (
                                    <TrainingReportPanel
                                        version={selectedVersion}
                                    />
                                )}

                                {selectedVersion.status === 'error' &&
                                    selectedVersion.errors && (
                                        <div className="rounded border border-[#ff1b1c]/25 bg-[#ff1b1c]/10 p-4">
                                            <div className="mb-2 text-xs font-semibold uppercase text-[#ff8b8c]">
                                                ML error
                                            </div>
                                            <pre className="max-h-48 whitespace-pre-wrap break-words font-mono text-xs leading-5 text-[#ff6b6c]">
                                                {selectedVersion.errors
                                                    .replace(/\s+/g, ' ')
                                                    .slice(0, 1200)}
                                            </pre>
                                        </div>
                                    )}

                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="inline-flex h-10 items-center gap-2 rounded bg-[#ff1b1c] px-4 text-sm font-semibold text-white transition hover:bg-[#d91617] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <CheckIcon className="h-4 w-4" />
                                    Save version
                                </button>
                            </div>
                        )}
                    </form>

                    <form
                        onSubmit={submitCreate}
                        className="rounded border border-white/10 bg-[#141414] p-4"
                    >
                        <div className="mb-4 text-xs font-medium text-gray-400">
                            Create new version
                        </div>

                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <label className={labelClass}>
                                    Parent version
                                </label>
                                <select
                                    value={createForm.data.parent_version_id}
                                    onChange={(event) =>
                                        createForm.setData(
                                            'parent_version_id',
                                            event.target.value === ''
                                                ? ''
                                                : Number(event.target.value),
                                        )
                                    }
                                    className={fieldClass}
                                >
                                    <option value="">No parent</option>
                                    {versions.map((version) => (
                                        <option
                                            key={version.id}
                                            value={version.id}
                                        >
                                            v{version.version_number}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid gap-2">
                                <label className={labelClass}>
                                    Image resolution
                                </label>
                                <select
                                    value={createForm.data.image_resolution}
                                    onChange={(event) =>
                                        createForm.setData(
                                            'image_resolution',
                                            Number(event.target.value),
                                        )
                                    }
                                    className={fieldClass}
                                >
                                    <option value={64}>64x64</option>
                                    <option value={128}>128x128</option>
                                    <option value={256}>256x256</option>
                                    <option value={512}>512x512</option>
                                </select>
                            </div>

                            <DatasetPicker
                                datasets={datasets}
                                selectedIds={createForm.data.dataset_ids}
                                compact
                                onToggle={(datasetId) =>
                                    toggleDataset(createForm, datasetId)
                                }
                            />

                            <button
                                type="submit"
                                disabled={createForm.processing}
                                className="inline-flex h-10 items-center gap-2 rounded bg-[#ff1b1c] px-4 text-sm font-semibold text-white transition hover:bg-[#d91617] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <PlusIcon className="h-4 w-4" />
                                Create version
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}

function ExperimentTable({
    versions,
    selectedVersionId,
    onSelect,
}: {
    versions: ModelVersion[];
    selectedVersionId: number | null;
    onSelect: (version: ModelVersion) => void;
}) {
    return (
        <div className="mb-5 rounded border border-white/10 bg-[#141414]">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                <div>
                    <div className="text-xs font-medium text-gray-400">
                        Experiment comparison
                    </div>
                    <div className="mt-1 text-[11px] text-gray-600">
                        Versions, quality, compression and training report
                    </div>
                </div>
                <div className="text-[11px] text-gray-500">
                    {versions.length} versions
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs">
                    <thead className="text-gray-500">
                        <tr className="border-b border-white/10">
                            <th className="px-4 py-3 font-medium">Version</th>
                            <th className="px-4 py-3 font-medium">Datasets</th>
                            <th className="px-4 py-3 font-medium">Quality</th>
                            <th className="px-4 py-3 font-medium">Compression</th>
                            <th className="px-4 py-3 font-medium">Training</th>
                        </tr>
                    </thead>
                    <tbody>
                        {versions.map((version) => {
                            const metrics = versionMetrics(version);
                            const stats = version.compression_stats;
                            const selected = selectedVersionId === version.id;

                            return (
                                <tr
                                    key={version.id}
                                    onClick={() => onSelect(version)}
                                    className={`cursor-pointer border-b border-white/5 transition last:border-b-0 ${
                                        selected
                                            ? 'bg-[#ff1b1c]/10'
                                            : 'hover:bg-white/5'
                                    }`}
                                >
                                    <td className="px-4 py-3 align-top">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-200">
                                                v{version.version_number}
                                            </span>
                                            <span
                                                className={`rounded px-2 py-0.5 text-[10px] ${statusClass[version.status]}`}
                                            >
                                                {version.status}
                                            </span>
                                        </div>
                                        <div className="mt-1 text-gray-600">
                                            {version.image_resolution}x
                                            {version.image_resolution}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 align-top text-gray-400">
                                        <div>{version.datasets.length} linked</div>
                                        <div className="mt-1 text-gray-600">
                                            {version.datasets
                                                .map((dataset) => dataset.images_count)
                                                .reduce((sum, count) => sum + count, 0)
                                                .toLocaleString()}{' '}
                                            images
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 align-top">
                                        <div className="grid min-w-52 grid-cols-3 gap-1">
                                            <TinyMetric
                                                label="PSNR"
                                                value={formatMetric(metrics?.psnr, 2)}
                                            />
                                            <TinyMetric
                                                label="SSIM"
                                                value={formatMetric(metrics?.ssim)}
                                            />
                                            <TinyMetric
                                                label="MSE"
                                                value={formatMetric(metrics?.mse, 6)}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 align-top">
                                        <div className="text-gray-300">
                                            {stats?.saved_percent != null
                                                ? `${stats.saved_percent.toFixed(1)}% saved`
                                                : '-'}
                                        </div>
                                        <div className="mt-1 text-gray-600">
                                            {formatBytes(stats?.compressed_size)} /{' '}
                                            {formatBytes(stats?.original_size)}
                                        </div>
                                        <div className="mt-1 text-gray-600">
                                            {stats?.compressed_count ?? 0}/
                                            {stats?.images_count ?? 0} images
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 align-top">
                                        <div className="text-gray-300">
                                            {formatDuration(
                                                version.training_report
                                                    ?.duration_seconds,
                                            )}
                                        </div>
                                        <div className="mt-1 text-gray-600">
                                            {version.training_started_at
                                                ? new Date(
                                                      version.training_started_at,
                                                  ).toLocaleDateString()
                                                : '-'}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function TrainingReportPanel({ version }: { version: ModelVersion }) {
    const report = version.training_report;
    const progress = report?.latest_progress ?? version.progress;
    const metrics = versionMetrics(version);
    const mlService = report?.ml_service ?? {};
    const device = String(mlService?.device ?? '-');
    const torchVersion = String(mlService?.torch_version ?? '-');

    if (!report) {
        return null;
    }

    return (
        <div className="rounded border border-white/10 bg-[#141414] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-xs font-medium text-gray-400">
                    Training report
                </div>
                <span className={`rounded px-2 py-0.5 text-[10px] ${statusClass[version.status]}`}>
                    {version.status}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
                <ReportStat
                    label="duration"
                    value={formatDuration(report.duration_seconds)}
                />
                <ReportStat label="device" value={device} />
                <ReportStat label="torch" value={torchVersion} />
                <ReportStat
                    label="samples"
                    value={`${metrics?.samples ?? '-'}`}
                />
            </div>

            {progress && (
                <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-[11px] text-gray-500">
                        <span>{progress.message ?? 'Training progress'}</span>
                        <span>{Math.round(progress.percent ?? 0)}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded bg-white/10">
                        <div
                            className="h-full rounded bg-amber-400"
                            style={{
                                width: `${Math.min(
                                    Math.max(progress.percent ?? 0, 0),
                                    100,
                                )}%`,
                            }}
                        />
                    </div>
                </div>
            )}

            <LossChart history={report.loss_history ?? []} />

            <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
                {(report.datasets ?? []).map((dataset) => (
                    <div
                        key={dataset.id}
                        className="rounded border border-white/10 bg-[#101010] p-3"
                    >
                        <div className="truncate text-xs font-medium text-gray-300">
                            {dataset.name}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-gray-400">
                            <span className="rounded bg-white/5 px-2 py-0.5">
                                {dataset.images_count} img
                            </span>
                            <span className="rounded bg-white/5 px-2 py-0.5">
                                train {dataset.train_split ?? '-'}%
                            </span>
                            <span className="rounded bg-white/5 px-2 py-0.5">
                                test {dataset.test_split ?? '-'}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function DatasetPicker({
    datasets,
    selectedIds,
    onToggle,
    compact = false,
}: {
    datasets: Dataset[];
    selectedIds: number[];
    onToggle: (datasetId: number) => void;
    compact?: boolean;
}) {
    return (
        <div>
            <div className="mb-3 flex items-center justify-between">
                <div className="text-xs font-medium text-gray-400">
                    Datasets
                </div>
                <div className="text-xs text-gray-500">
                    {selectedIds.length} selected
                </div>
            </div>

            <div
                className={`grid gap-3 overflow-auto pr-1 ${
                    compact
                        ? 'max-h-72 grid-cols-1'
                        : 'max-h-[520px] grid-cols-1 md:grid-cols-2'
                }`}
            >
                {datasets.map((dataset) => {
                    const selected = selectedIds.includes(dataset.id);

                    return (
                        <button
                            key={dataset.id}
                            type="button"
                            onClick={() => onToggle(dataset.id)}
                            className={`min-h-24 rounded border p-3 text-left transition ${
                                selected
                                    ? 'border-[#ff1b1c]/70 bg-[#ff1b1c]/10'
                                    : 'border-white/10 bg-[#141414] hover:bg-white/5'
                            }`}
                        >
                            <div className="mb-2 truncate text-sm font-medium text-gray-200">
                                {dataset.name}
                            </div>
                            <div className="flex flex-wrap gap-1 text-[11px]">
                                <span className="rounded bg-white/10 px-2 py-0.5 text-gray-400">
                                    {dataset.image_resolution}x
                                    {dataset.image_resolution}
                                </span>
                                <span className="rounded bg-white/10 px-2 py-0.5 text-gray-400">
                                    {dataset.images_count} img
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function MetricBox({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded bg-white/5 p-2 text-gray-500">
            {label}
            <div className="mt-1 text-gray-300">{value}</div>
        </div>
    );
}

function TinyMetric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded bg-white/5 px-2 py-1 text-gray-500">
            {label}
            <div className="mt-0.5 text-gray-300">{value}</div>
        </div>
    );
}

function ReportStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded bg-white/5 p-2 text-gray-500">
            {label}
            <div className="mt-1 truncate text-gray-300">{value}</div>
        </div>
    );
}

function LossChart({
    history,
}: {
    history: Array<{
        percent?: number | null;
        losses?: Record<string, number>;
    }>;
}) {
    const points = history
        .map((point, index) => {
            const losses = point.losses ?? {};
            const value =
                losses.autoencoder ??
                losses.reconstruction ??
                Object.values(losses)[0];

            return typeof value === 'number'
                ? { x: point.percent ?? index, y: value }
                : null;
        })
        .filter(Boolean) as Array<{ x: number; y: number }>;

    if (points.length < 2) {
        return (
            <div className="mt-4 rounded border border-dashed border-white/10 p-4 text-xs text-gray-600">
                Loss history is not available yet
            </div>
        );
    }

    const width = 420;
    const height = 120;
    const padding = 12;
    const minX = Math.min(...points.map((point) => point.x));
    const maxX = Math.max(...points.map((point) => point.x));
    const minY = Math.min(...points.map((point) => point.y));
    const maxY = Math.max(...points.map((point) => point.y));
    const spanX = maxX - minX || 1;
    const spanY = maxY - minY || 1;
    const path = points
        .map((point) => {
            const x = padding + ((point.x - minX) / spanX) * (width - padding * 2);
            const y =
                height -
                padding -
                ((point.y - minY) / spanY) * (height - padding * 2);

            return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(' ');

    return (
        <div className="mt-4 rounded border border-white/10 bg-[#101010] p-3">
            <div className="mb-2 flex items-center justify-between text-[11px] text-gray-500">
                <span>loss curve</span>
                <span>{points.length} points</span>
            </div>
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="h-32 w-full overflow-visible"
                preserveAspectRatio="none"
            >
                <polyline
                    points={path}
                    fill="none"
                    stroke="#ff1b1c"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                />
            </svg>
        </div>
    );
}
