import Layout from '@/components/custom/Layout';
import { FolderIcon } from '@heroicons/react/16/solid';

export default function Main() {
    const datasets = [
        {
            id: 1,
            name: 'SAT-IMG-12TB',
            uses: 5,
            images: 1240000,
            normalize: {
                rotate: 15,
                flip: true,
                size: '256x256',
            },
        },
        {
            id: 2,
            name: 'EarthSurface-v2',
            uses: 3,
            images: 840000,
            normalize: {
                rotate: 0,
                flip: false,
                size: '128x128',
            },
        },
        {
            id: 3,
            name: 'CityScapes-Lite',
            uses: 8,
            images: 320000,
            normalize: {
                rotate: 5,
                flip: true,
                size: '256x256',
            },
        },
        {
            id: 4,
            name: 'DeepSpace-X',
            uses: 2,
            images: 150000,
            normalize: {
                rotate: 25,
                flip: false,
                size: '512x512',
            },
        },
                {
            id: 1,
            name: 'SAT-IMG-12TB',
            uses: 5,
            images: 1240000,
            normalize: {
                rotate: 15,
                flip: true,
                size: '256x256',
            },
        },
        {
            id: 2,
            name: 'EarthSurface-v2',
            uses: 3,
            images: 840000,
            normalize: {
                rotate: 0,
                flip: false,
                size: '128x128',
            },
        },
        {
            id: 3,
            name: 'CityScapes-Lite',
            uses: 8,
            images: 320000,
            normalize: {
                rotate: 5,
                flip: true,
                size: '256x256',
            },
        },
        {
            id: 4,
            name: 'DeepSpace-X',
            uses: 2,
            images: 150000,
            normalize: {
                rotate: 25,
                flip: false,
                size: '512x512',
            },
        },        {
            id: 1,
            name: 'SAT-IMG-12TB',
            uses: 5,
            images: 1240000,
            normalize: {
                rotate: 15,
                flip: true,
                size: '256x256',
            },
        },
        {
            id: 2,
            name: 'EarthSurface-v2',
            uses: 3,
            images: 840000,
            normalize: {
                rotate: 0,
                flip: false,
                size: '128x128',
            },
        },
        {
            id: 3,
            name: 'CityScapes-Lite',
            uses: 8,
            images: 320000,
            normalize: {
                rotate: 5,
                flip: true,
                size: '256x256',
            },
        },
        {
            id: 4,
            name: 'DeepSpace-X',
            uses: 2,
            images: 150000,
            normalize: {
                rotate: 25,
                flip: false,
                size: '512x512',
            },
        },        {
            id: 1,
            name: 'SAT-IMG-12TB',
            uses: 5,
            images: 1240000,
            normalize: {
                rotate: 15,
                flip: true,
                size: '256x256',
            },
        },
        {
            id: 2,
            name: 'EarthSurface-v2',
            uses: 3,
            images: 840000,
            normalize: {
                rotate: 0,
                flip: false,
                size: '128x128',
            },
        },
        {
            id: 3,
            name: 'CityScapes-Lite',
            uses: 8,
            images: 320000,
            normalize: {
                rotate: 5,
                flip: true,
                size: '256x256',
            },
        },
        {
            id: 4,
            name: 'DeepSpace-X',
            uses: 2,
            images: 150000,
            normalize: {
                rotate: 25,
                flip: false,
                size: '512x512',
            },
        },
    ];

    return (
        <Layout>
            <div className="min-h-screen bg-[#0f0f0f] p-6 text-white">
                {/* HEADER */}
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-sm font-semibold text-gray-300">
                        Datasets
                    </h1>

                    <span className="text-xs text-gray-500">
                        {datasets.length}
                    </span>
                </div>

                {/* GRID */}
                <div className="flex flex-wrap gap-4">
                    {datasets.map((ds) => (
                        <div
                            key={ds.id}
                            className="relative aspect-square w-64 rounded-lg border border-white/10 bg-[#141414] p-4"
                        >
                            {/* TOP */}
                            <div className="mb-3 flex items-center gap-2">
                                <FolderIcon className="w-5 text-gray-400" />

                                <div className="truncate text-sm font-medium">
                                    {ds.name}
                                </div>
                            </div>

                            {/* TAGS */}
                            <div className="flex flex-wrap gap-1 text-[11px] leading-tight">
                                <span className="rounded bg-white/5 px-2 py-0.5 text-gray-400">
                                    {ds.images.toLocaleString()} img
                                </span>

                                <span className="rounded bg-white/5 px-2 py-0.5 text-gray-400">
                                    {ds.normalize.size}
                                </span>

                                <span className="rounded bg-white/5 px-2 py-0.5 text-gray-400">
                                    rot {ds.normalize.rotate}°
                                </span>

                                {ds.normalize.flip && (
                                    <span className="rounded bg-white/5 px-2 py-0.5 text-gray-400">
                                        flip
                                    </span>
                                )}
                            </div>

                            {/* USE COUNT */}
                            <div className="absolute right-3 bottom-3 text-[11px] text-gray-500">
                                {ds.uses} uses
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}
