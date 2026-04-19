import Layout from '@/components/custom/Layout';
import { CubeIcon } from '@heroicons/react/16/solid';
import { Layers2Icon } from 'lucide-react';

export default function Models() {
    const models = [
        {
            id: 1,
            name: 'ImageCompressor',
            author: 'Ruslan',
            versions: [
                {
                    version: 'v3',
                    datasets: ['SAT-IMG-12TB', 'EarthSurface-v2'],
                },
                {
                    version: 'v2',
                    datasets: ['CityScapes-Lite'],
                },
            ],
        },
        {
            id: 2,
            name: 'OrbitNet',
            author: 'Anna',
            versions: [
                {
                    version: 'v1',
                    datasets: ['DeepSpace-X', 'SAT-IMG-12TB'],
                },
            ],
        },
        {
            id: 3,
            name: 'GeoCompress',
            author: 'Ruslan',
            versions: [
                {
                    version: 'v5',
                    datasets: ['EarthSurface-v2'],
                },
                {
                    version: 'v4',
                    datasets: ['CityScapes-Lite', 'SAT-IMG-12TB'],
                },
            ],
        },
                {
            id: 1,
            name: 'ImageCompressor',
            author: 'Ruslan',
            versions: [
                {
                    version: 'v3',
                    datasets: ['SAT-IMG-12TB', 'EarthSurface-v2'],
                },
                {
                    version: 'v2',
                    datasets: ['CityScapes-Lite'],
                },
            ],
        },
        {
            id: 2,
            name: 'OrbitNet',
            author: 'Anna',
            versions: [
                {
                    version: 'v1',
                    datasets: ['DeepSpace-X', 'SAT-IMG-12TB'],
                },
            ],
        },
        {
            id: 3,
            name: 'GeoCompress',
            author: 'Ruslan',
            versions: [
                {
                    version: 'v5',
                    datasets: ['EarthSurface-v2'],
                },
                {
                    version: 'v4',
                    datasets: ['CityScapes-Lite', 'SAT-IMG-12TB'],
                },
            ],
        },        {
            id: 1,
            name: 'ImageCompressor',
            author: 'Ruslan',
            versions: [
                {
                    version: 'v3',
                    datasets: ['SAT-IMG-12TB', 'EarthSurface-v2'],
                },
                {
                    version: 'v2',
                    datasets: ['CityScapes-Lite'],
                },
            ],
        },
        {
            id: 2,
            name: 'OrbitNet',
            author: 'Anna',
            versions: [
                {
                    version: 'v1',
                    datasets: ['DeepSpace-X', 'SAT-IMG-12TB'],
                },
            ],
        },
        {
            id: 3,
            name: 'GeoCompress',
            author: 'Ruslan',
            versions: [
                {
                    version: 'v5',
                    datasets: ['EarthSurface-v2'],
                },
                {
                    version: 'v4',
                    datasets: ['CityScapes-Lite', 'SAT-IMG-12TB'],
                },
            ],
        },
    ];

    return (
        <Layout>
        <div className="min-h-screen bg-[#0f0f0f] p-6 text-white">
            {/* HEADER */}
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-sm font-semibold text-gray-300">Models</h1>

                <span className="text-xs text-gray-500">{models.length}</span>
            </div>

            {/* GRID */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {models.map((model) => (
                    <div
                        key={model.id}
                        className="relative aspect-square rounded-lg border border-white/10 bg-[#141414] p-4"
                    >
                        {/* HEADER */}
                        <div className="mb-3 flex items-center gap-2">
                            <CubeIcon className="w-5 text-gray-400" />

                            <div className="truncate text-sm font-medium">
                                {model.name}
                            </div>
                        </div>

                        {/* AUTHOR */}
                        <div className="mb-3 text-[11px] text-gray-500">
                            by {model.author}
                        </div>

                        {/* VERSIONS */}
                        <div className="flex flex-col gap-2 text-[11px]">
                            {model.versions.slice(0, 2).map((v, idx) => (
                                <div
                                    key={idx}
                                    className="rounded bg-white/5 p-2"
                                >
                                    <div className="mb-1 flex items-center gap-1 text-gray-300">
                                        <Layers2Icon className="w-3" />
                                        {v.version}
                                    </div>

                                    {/* DATASETS TAGS */}
                                    <div className="flex flex-wrap gap-1">
                                        {v.datasets.slice(0, 3).map((ds, i) => (
                                            <span
                                                key={i}
                                                className="truncate rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-gray-400"
                                            >
                                                {ds}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* FOOTER */}
                        <div className="absolute right-3 bottom-3 text-[10px] text-gray-500">
                            {model.versions.length} v
                        </div>
                    </div>
                ))}
            </div>
        </div>
        </Layout>
    );
}
