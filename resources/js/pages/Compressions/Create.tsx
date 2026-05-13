import Layout from '@/components/custom/Layout';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/16/solid';
import { router, useForm } from '@inertiajs/react';
import { ImagePlusIcon } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { route } from 'ziggy-js';
import type { ModelVersion } from './types';

type CompressionForm = {
    model_version_id: number | '';
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
    const [submitting, setSubmitting] = useState(false);
    const { data, setData, processing, errors } = useForm<CompressionForm>({
        model_version_id: modelVersions[0]?.id ?? '',
        images: [],
    });

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

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitting(true);

        router.post(route('compressions.store'), data, {
            forceFormData: true,
            onSuccess: () => router.get(route('compressions.index')),
            onFinish: () => setSubmitting(false),
        });
    };

    const fieldClass =
        'h-10 rounded border border-white/10 bg-[#101010] px-3 text-sm text-white outline-none transition placeholder:text-gray-700 focus:border-[#ff1b1c]/70';
    const labelClass = 'text-xs font-medium text-gray-400';
    const disabled = processing || submitting || modelVersions.length === 0;

    return (
        <Layout>
            <div className="min-h-screen bg-[#0f0f0f] p-6 text-white">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-sm font-semibold text-gray-300">
                            Create compression
                        </h1>
                        <div className="mt-1 text-xs text-gray-500">
                            Upload up to 20 images and choose a ready model
                            version
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

                <form
                    onSubmit={submit}
                    className="grid max-w-5xl grid-cols-1 gap-5 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]"
                >
                    <div className="space-y-5">
                        <div className="grid gap-2">
                            <label className={labelClass}>Model version</label>
                            <select
                                value={data.model_version_id}
                                onChange={(event) =>
                                    setData(
                                        'model_version_id',
                                        Number(event.target.value),
                                    )
                                }
                                disabled={modelVersions.length === 0}
                                className={fieldClass}
                            >
                                {modelVersions.map((version) => (
                                    <option key={version.id} value={version.id}>
                                        {version.model?.name ??
                                            'Compression model'}{' '}
                                        v{version.version_number} ·{' '}
                                        {version.image_resolution}x
                                        {version.image_resolution}
                                    </option>
                                ))}
                            </select>
                            {errors.model_version_id && (
                                <div className="text-xs text-[#ff1b1c]">
                                    {errors.model_version_id}
                                </div>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <label className={labelClass}>Images</label>
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

                        {modelVersions.length === 0 && (
                            <div className="rounded border border-dashed border-white/10 bg-[#141414] p-4 text-sm text-gray-500">
                                No ready model versions yet. Train or mark a
                                version as ready before uploading images.
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={disabled}
                            className="inline-flex h-10 items-center gap-2 rounded bg-[#ff1b1c] px-4 text-sm font-semibold text-white transition hover:bg-[#d91617] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <CheckIcon className="h-4 w-4" />
                            Start compression
                        </button>
                    </div>

                    <div className="min-w-0">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <label className={labelClass}>Queue preview</label>
                            <span className="text-xs text-gray-500">
                                {data.images.length} files ·{' '}
                                {formatBytes(totalSize)}
                            </span>
                        </div>

                        {data.images.length === 0 ? (
                            <div className="flex min-h-[360px] items-center justify-center rounded border border-dashed border-white/10 bg-[#141414] text-sm text-gray-500">
                                Select images to preview the upload queue
                            </div>
                        ) : (
                            <div className="grid max-h-[620px] grid-cols-1 gap-3 overflow-auto pr-1 md:grid-cols-2 xl:grid-cols-3">
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
                                            <ImagePlusIcon className="h-4 w-4 shrink-0 text-gray-500" />
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
