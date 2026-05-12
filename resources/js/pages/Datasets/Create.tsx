import Layout from '@/components/custom/Layout';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/16/solid';
import { router, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

type DatasetForm = {
    name: string;
    description: string;
    dataset: File | null;
    rotation_degree: number;
    do_flip: boolean;
    image_resolution: number;
    train_split: number;
    test_split: number;
    images_count: number;
    uses_count: number;
};

export default function Create() {
    const [submitting, setSubmitting] = useState(false);
    const { data, setData, processing, errors } = useForm<DatasetForm>({
        name: '',
        description: '',
        dataset: null,
        rotation_degree: 0,
        do_flip: false,
        image_resolution: 256,
        train_split: 80,
        test_split: 20,
        images_count: 0,
        uses_count: 0,
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitting(true);

        router.post(
            route('datasets.store'),
            {
                ...data,
                do_flip: data.do_flip ? 1 : 0,
            },
            {
                forceFormData: true,
                onSuccess: () => router.get(route('datasets.index')),
                onFinish: () => setSubmitting(false),
            },
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
                            Create dataset
                        </h1>
                        <div className="mt-1 text-xs text-gray-500">
                            Upload zip archive and set preprocessing parameters
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.get(route('datasets.index'))}
                        className="inline-flex h-10 items-center gap-2 rounded border border-white/10 px-3 text-sm font-semibold text-gray-300 transition hover:bg-white/5"
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                        Back
                    </button>
                </div>

                <form
                    onSubmit={submit}
                    className="grid max-w-4xl grid-cols-1 gap-5 lg:grid-cols-2"
                >
                    <div className="space-y-5">
                        <div className="grid gap-2">
                            <label className={labelClass}>Name</label>
                            <input
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                className={fieldClass}
                                placeholder="SAT-IMG-12TB"
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
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                className="min-h-32 rounded border border-white/10 bg-[#101010] px-3 py-2 text-sm text-white transition outline-none placeholder:text-gray-700 focus:border-[#ff1b1c]/70"
                                placeholder="Short dataset description"
                            />
                            {errors.description && (
                                <div className="text-xs text-[#ff1b1c]">
                                    {errors.description}
                                </div>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <label className={labelClass}>
                                Dataset archive
                            </label>
                            <input
                                type="file"
                                accept=".zip,application/zip"
                                onChange={(e) =>
                                    setData(
                                        'dataset',
                                        e.target.files?.[0] ?? null,
                                    )
                                }
                                className="rounded border border-white/10 bg-[#101010] px-3 py-2 text-sm text-gray-300 file:mr-3 file:rounded file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-white/15"
                            />
                            {errors.dataset && (
                                <div className="text-xs text-[#ff1b1c]">
                                    {errors.dataset}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <label className={labelClass}>
                                    Rotation degree
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    max={360}
                                    value={data.rotation_degree}
                                    onChange={(e) =>
                                        setData(
                                            'rotation_degree',
                                            Number(e.target.value),
                                        )
                                    }
                                    className={fieldClass}
                                />
                                {errors.rotation_degree && (
                                    <div className="text-xs text-[#ff1b1c]">
                                        {errors.rotation_degree}
                                    </div>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <label className={labelClass}>
                                    Image resolution
                                </label>
                                <select
                                    value={data.image_resolution}
                                    onChange={(e) =>
                                        setData(
                                            'image_resolution',
                                            Number(e.target.value),
                                        )
                                    }
                                    className={fieldClass}
                                >
                                    <option value={64}>64x64</option>
                                    <option value={128}>128x128</option>
                                    <option value={256}>256x256</option>
                                    <option value={512}>512x512</option>
                                </select>
                                {errors.image_resolution && (
                                    <div className="text-xs text-[#ff1b1c]">
                                        {errors.image_resolution}
                                    </div>
                                )}
                            </div>
                        </div>

                        <label className="flex h-10 items-center gap-3 rounded border border-white/10 bg-[#101010] px-3 text-sm text-gray-300">
                            <input
                                type="checkbox"
                                checked={data.do_flip}
                                onChange={(e) =>
                                    setData('do_flip', e.target.checked)
                                }
                                className="h-4 w-4 accent-[#ff1b1c]"
                            />
                            Flip images
                        </label>
                        {errors.do_flip && (
                            <div className="text-xs text-[#ff1b1c]">
                                {errors.do_flip}
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <label className={labelClass}>
                                    Train split
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={data.train_split}
                                    onChange={(e) =>
                                        setData(
                                            'train_split',
                                            Number(e.target.value),
                                        )
                                    }
                                    className={fieldClass}
                                />
                                {errors.train_split && (
                                    <div className="text-xs text-[#ff1b1c]">
                                        {errors.train_split}
                                    </div>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <label className={labelClass}>Test split</label>
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={data.test_split}
                                    onChange={(e) =>
                                        setData(
                                            'test_split',
                                            Number(e.target.value),
                                        )
                                    }
                                    className={fieldClass}
                                />
                                {errors.test_split && (
                                    <div className="text-xs text-[#ff1b1c]">
                                        {errors.test_split}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <label className={labelClass}>
                                    Images count
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    value={data.images_count}
                                    onChange={(e) =>
                                        setData(
                                            'images_count',
                                            Number(e.target.value),
                                        )
                                    }
                                    className={fieldClass}
                                />
                                {errors.images_count && (
                                    <div className="text-xs text-[#ff1b1c]">
                                        {errors.images_count}
                                    </div>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <label className={labelClass}>Uses count</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={data.uses_count}
                                    onChange={(e) =>
                                        setData(
                                            'uses_count',
                                            Number(e.target.value),
                                        )
                                    }
                                    className={fieldClass}
                                />
                                {errors.uses_count && (
                                    <div className="text-xs text-[#ff1b1c]">
                                        {errors.uses_count}
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={processing || submitting}
                            className="inline-flex h-10 items-center gap-2 rounded bg-[#ff1b1c] px-4 text-sm font-semibold text-white transition hover:bg-[#d91617] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <CheckIcon className="h-4 w-4" />
                            Create dataset
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
}
