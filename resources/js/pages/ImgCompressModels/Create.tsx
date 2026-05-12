import Layout from '@/components/custom/Layout';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/16/solid';
import { router, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import type { Dataset } from './types';

type ModelForm = {
    name: string;
    description: string;
    dataset_ids: number[];
    image_resolution: number;
    status: 'queue' | 'training' | 'ready' | 'cancel' | 'error';
    errors: string;
};

export default function Create({ datasets }: { datasets: Dataset[] }) {
    const { data, setData, processing, errors } = useForm<ModelForm>({
        name: '',
        description: '',
        dataset_ids: [],
        image_resolution: 256,
        status: 'queue',
        errors: '',
    });

    const toggleDataset = (datasetId: number) => {
        setData(
            'dataset_ids',
            data.dataset_ids.includes(datasetId)
                ? data.dataset_ids.filter((id) => id !== datasetId)
                : [...data.dataset_ids, datasetId],
        );
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.post(route('img-compress-models.store'), data, {
            onSuccess: () => router.get(route('img-compress-models.index')),
        });
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
                            Create compression model
                        </h1>
                        <div className="mt-1 text-xs text-gray-500">
                            Model container and the first trainable version
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
                    onSubmit={submit}
                    className="grid max-w-6xl grid-cols-1 gap-5 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]"
                >
                    <div className="space-y-5">
                        <div className="grid gap-2">
                            <label className={labelClass}>Name</label>
                            <input
                                value={data.name}
                                onChange={(event) =>
                                    setData('name', event.target.value)
                                }
                                className={fieldClass}
                                placeholder="ImageCompressor"
                            />
                            {errors.name && (
                                <div className="text-xs text-[#ff1b1c]">
                                    {errors.name}
                                </div>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <label className={labelClass}>Description</label>
                            <textarea
                                value={data.description}
                                onChange={(event) =>
                                    setData('description', event.target.value)
                                }
                                className="min-h-32 rounded border border-white/10 bg-[#101010] px-3 py-2 text-sm text-white transition outline-none placeholder:text-gray-700 focus:border-[#ff1b1c]/70"
                                placeholder="Short model description"
                            />
                            {errors.description && (
                                <div className="text-xs text-[#ff1b1c]">
                                    {errors.description}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <label className={labelClass}>
                                    Image resolution
                                </label>
                                <select
                                    value={data.image_resolution}
                                    onChange={(event) =>
                                        setData(
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
                                <label className={labelClass}>Status</label>
                                <select
                                    value={data.status}
                                    onChange={(event) =>
                                        setData(
                                            'status',
                                            event.target.value as ModelForm['status'],
                                        )
                                    }
                                    className={fieldClass}
                                >
                                    <option value="queue">queue</option>
                                    <option value="training">training</option>
                                    <option value="ready">ready</option>
                                    <option value="cancel">cancel</option>
                                    <option value="error">error</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex h-10 items-center gap-2 rounded bg-[#ff1b1c] px-4 text-sm font-semibold text-white transition hover:bg-[#d91617] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <CheckIcon className="h-4 w-4" />
                            Create model
                        </button>
                    </div>

                    <div className="min-w-0">
                        <div className="mb-3 flex items-center justify-between">
                            <label className={labelClass}>
                                Training datasets
                            </label>
                            <span className="text-xs text-gray-500">
                                {data.dataset_ids.length} selected
                            </span>
                        </div>

                        {errors.dataset_ids && (
                            <div className="mb-3 text-xs text-[#ff1b1c]">
                                {errors.dataset_ids}
                            </div>
                        )}

                        <div className="grid max-h-[620px] grid-cols-1 gap-3 overflow-auto pr-1 md:grid-cols-2 xl:grid-cols-3">
                            {datasets.map((dataset) => {
                                const selected = data.dataset_ids.includes(
                                    dataset.id,
                                );

                                return (
                                    <button
                                        key={dataset.id}
                                        type="button"
                                        onClick={() =>
                                            toggleDataset(dataset.id)
                                        }
                                        className={`min-h-28 rounded border p-3 text-left transition ${
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
                </form>
            </div>
        </Layout>
    );
}
