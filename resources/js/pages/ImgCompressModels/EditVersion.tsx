import Layout from '@/components/custom/Layout';
import {
    ArrowLeftIcon,
    CheckIcon,
    PlusIcon,
    TrashIcon,
} from '@heroicons/react/16/solid';
import { router, useForm } from '@inertiajs/react';
import { GitBranchIcon } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import type { Dataset, ImgCompressModel, ModelVersion } from './types';

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
        if (!confirm(`Delete version v${version.version_number}?`)) {
            return;
        }

        router.post(
            route('img-compress-models.versions.delete', version.id),
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

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
                    <div>
                        <div className="mb-3 text-xs font-medium text-gray-400">
                            Version tree
                        </div>

                        <div className="space-y-2">
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

                                    <div className="text-[11px] text-gray-500">
                                        parent:{' '}
                                        {version.parent_version_id
                                            ? `#${version.parent_version_id}`
                                            : 'none'}
                                    </div>
                                    <div className="mt-1 text-[11px] text-gray-500">
                                        {version.datasets.length} datasets
                                    </div>
                                </button>
                            ))}
                        </div>
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
                                <button
                                    type="button"
                                    onClick={() => deleteVersion(selectedVersion)}
                                    className="inline-flex h-9 items-center gap-2 rounded border border-white/10 px-3 text-xs font-semibold text-gray-400 transition hover:border-[#ff1b1c]/50 hover:bg-[#ff1b1c]/10 hover:text-[#ff1b1c]"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                    Delete
                                </button>
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
