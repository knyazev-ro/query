import Layout from '@/components/custom/Layout';
import { router, useForm } from '@inertiajs/react';
import { ArrowDown, ArrowLeft, ArrowUp, Check, ImagePlus } from 'lucide-react';
import { FormEvent, useEffect, useMemo } from 'react';
import { route } from 'ziggy-js';
import type { ModelVersion } from '../Compressions/types';

type BenchmarkForm = {
    name: string;
    model_version_ids: number[];
    images: File[];
};

function formatBytes(bytes: number) {
    if (bytes === 0) {
        return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1,
    );

    return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export default function Create({
    modelVersions,
}: {
    modelVersions: ModelVersion[];
}) {
    const { data, setData, processing, errors } = useForm<BenchmarkForm>({
        name: '',
        model_version_ids: [],
        images: [],
    });
    const selectedVersions = data.model_version_ids
        .map((id) => modelVersions.find((version) => version.id === id))
        .filter(Boolean) as ModelVersion[];
    const totalSize = useMemo(
        () => data.images.reduce((sum, file) => sum + file.size, 0),
        [data.images],
    );
    const previews = useMemo(
        () =>
            data.images.map((file) => ({
                file,
                url: URL.createObjectURL(file),
            })),
        [data.images],
    );

    useEffect(() => {
        return () => {
            previews.forEach((preview) => URL.revokeObjectURL(preview.url));
        };
    }, [previews]);

    const toggleVersion = (id: number) => {
        setData(
            'model_version_ids',
            data.model_version_ids.includes(id)
                ? data.model_version_ids.filter((versionId) => versionId !== id)
                : [...data.model_version_ids, id],
        );
    };

    const moveVersion = (index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= data.model_version_ids.length) {
            return;
        }

        const ids = [...data.model_version_ids];
        [ids[index], ids[target]] = [ids[target], ids[index]];
        setData('model_version_ids', ids);
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.post(route('benchmarks.store'), data, {
            forceFormData: true,
        });
    };

    const fieldClass =
        'h-10 rounded border border-white/10 bg-[#101010] px-3 text-sm text-white outline-none transition placeholder:text-gray-700 focus:border-[#ff1b1c]/70';

    return (
        <Layout>
            <div className="min-h-screen bg-[#0f0f0f] p-6 text-white">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-sm font-semibold text-gray-300">
                            Create benchmark
                        </h1>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.get(route('benchmarks.index'))}
                        className="inline-flex h-10 items-center gap-2 rounded border border-white/10 px-3 text-sm font-semibold text-gray-300 transition hover:bg-white/5"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>
                </div>

                <form
                    onSubmit={submit}
                    className="grid max-w-7xl grid-cols-1 gap-6 xl:grid-cols-[420px_minmax(0,1fr)]"
                >
                    <div className="space-y-5">
                        <div className="grid gap-2">
                            <label className="text-xs font-medium text-gray-400">
                                Name
                            </label>
                            <input
                                value={data.name}
                                onChange={(event) =>
                                    setData('name', event.target.value)
                                }
                                placeholder="Automatic if empty"
                                className={fieldClass}
                            />
                            {errors.name && (
                                <div className="text-xs text-[#ff1b1c]">
                                    {errors.name}
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="mb-2 text-xs font-medium text-gray-400">
                                Ready model versions
                            </div>
                            <div className="max-h-72 overflow-auto rounded border border-white/10 bg-[#141414]">
                                {modelVersions.map((version) => (
                                    <label
                                        key={version.id}
                                        className="flex cursor-pointer items-center gap-3 border-b border-white/10 px-3 py-3 last:border-b-0 hover:bg-white/5"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={data.model_version_ids.includes(
                                                version.id,
                                            )}
                                            onChange={() =>
                                                toggleVersion(version.id)
                                            }
                                            className="h-4 w-4 accent-[#ff1b1c]"
                                        />
                                        <span className="min-w-0 text-sm text-gray-300">
                                            {version.model?.name ??
                                                'Compression model'}{' '}
                                            v{version.version_number}
                                            <span className="ml-2 text-xs text-gray-600">
                                                {version.image_resolution}x
                                                {version.image_resolution}
                                            </span>
                                        </span>
                                    </label>
                                ))}
                                {modelVersions.length === 0 && (
                                    <div className="p-4 text-sm text-gray-500">
                                        No ready model versions
                                    </div>
                                )}
                            </div>
                            {(errors.model_version_ids ||
                                errors['model_version_ids.0']) && (
                                <div className="mt-2 text-xs text-[#ff1b1c]">
                                    {errors.model_version_ids ??
                                        errors['model_version_ids.0']}
                                </div>
                            )}
                        </div>

                        {selectedVersions.length > 0 && (
                            <div>
                                <div className="mb-2 text-xs font-medium text-gray-400">
                                    Run order
                                </div>
                                <div className="space-y-2">
                                    {selectedVersions.map((version, index) => (
                                        <div
                                            key={version.id}
                                            className="flex h-11 items-center gap-3 rounded border border-white/10 bg-[#141414] px-3"
                                        >
                                            <span className="w-5 text-xs text-gray-600">
                                                {index + 1}
                                            </span>
                                            <span className="min-w-0 flex-1 truncate text-sm text-gray-300">
                                                {version.model?.name ??
                                                    'Compression model'}{' '}
                                                v{version.version_number}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    moveVersion(index, -1)
                                                }
                                                disabled={index === 0}
                                                className="grid h-7 w-7 place-items-center rounded text-gray-500 hover:bg-white/5 hover:text-white disabled:opacity-25"
                                                title="Move up"
                                            >
                                                <ArrowUp className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    moveVersion(index, 1)
                                                }
                                                disabled={
                                                    index ===
                                                    selectedVersions.length - 1
                                                }
                                                className="grid h-7 w-7 place-items-center rounded text-gray-500 hover:bg-white/5 hover:text-white disabled:opacity-25"
                                                title="Move down"
                                            >
                                                <ArrowDown className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid gap-2">
                            <label className="text-xs font-medium text-gray-400">
                                Images
                            </label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(event) =>
                                    setData(
                                        'images',
                                        Array.from(event.target.files ?? []),
                                    )
                                }
                                className="rounded border border-white/10 bg-[#101010] px-3 py-2 text-sm text-gray-300 file:mr-3 file:rounded file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-white/15"
                            />
                            {errors.images && (
                                <div className="text-xs text-[#ff1b1c]">
                                    {errors.images}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={
                                processing ||
                                data.model_version_ids.length < 2 ||
                                data.images.length === 0
                            }
                            className="inline-flex h-10 items-center gap-2 rounded bg-[#ff1b1c] px-4 text-sm font-semibold text-white transition hover:bg-[#d91617] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Check className="h-4 w-4" />
                            Start benchmark
                        </button>
                    </div>

                    <div className="min-w-0">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <span className="text-xs font-medium text-gray-400">
                                Image set
                            </span>
                            <span className="text-xs text-gray-500">
                                {data.images.length} files /{' '}
                                {formatBytes(totalSize)}
                            </span>
                        </div>
                        {previews.length === 0 ? (
                            <div className="flex min-h-96 items-center justify-center rounded border border-dashed border-white/10 bg-[#141414] text-sm text-gray-500">
                                Select images for the benchmark
                            </div>
                        ) : (
                            <div className="grid max-h-[720px] grid-cols-1 gap-3 overflow-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
                                {previews.map((preview, index) => (
                                    <div
                                        key={`${preview.file.name}-${index}`}
                                        className="rounded border border-white/10 bg-[#141414] p-3"
                                    >
                                        <div className="mb-3 flex aspect-video items-center justify-center overflow-hidden rounded bg-[#101010]">
                                            <img
                                                src={preview.url}
                                                alt={preview.file.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="flex min-w-0 items-center gap-2">
                                            <ImagePlus className="h-4 w-4 shrink-0 text-gray-500" />
                                            <div className="min-w-0">
                                                <div className="truncate text-xs font-medium text-gray-300">
                                                    {preview.file.name}
                                                </div>
                                                <div className="mt-0.5 text-[11px] text-gray-600">
                                                    {formatBytes(
                                                        preview.file.size,
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </Layout>
    );
}
