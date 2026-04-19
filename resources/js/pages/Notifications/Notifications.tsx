import Layout from '@/components/custom/Layout';
import { BellIcon } from '@heroicons/react/16/solid';

export default function Notifications() {
    const notifications = [
        {
            id: 1,
            title: 'Обучение модели завершено',
            text: 'ImageCompressor-v3 обучена на SAT-IMG-12TB и готова к инференсу.',
            time: '2 мин назад',
            unread: true,
            type: 'success',
        },
        {
            id: 2,
            title: 'Запущен инференс',
            text: 'OrbitNet-Lite обрабатывает спутниковые изображения.',
            time: '10 мин назад',
            unread: true,
            type: 'process',
        },
        {
            id: 3,
            title: 'Добавлен датасет',
            text: 'EarthSurface-v2 (3.2 TB) добавлен в training pipeline.',
            time: '25 мин назад',
            unread: true,
            type: 'data',
        },
        {
            id: 4,
            title: 'Оптимизация завершена',
            text: 'FastCompress-XL ускорена на 18% после pruning.',
            time: '3 часа назад',
            unread: false,
            type: 'success',
        },
    ];

    const getAccent = (type) => {
        switch (type) {
            case 'success':
                return 'bg-[#81b64c]';
            case 'process':
                return 'bg-[#ff7f11]';
            case 'data':
                return 'bg-[#667c5d]';
            default:
                return 'bg-[#81b64c]';
        }
    };

    return (
        <Layout>
            <div className="flex h-full flex-col gap-4 bg-[#161616] p-8 text-white">
                {/* HEADER */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-[#81b64c] shadow-[0_0_10px_#81b64c]" />
                        <BellIcon className="w-4 text-white/60" />
                        <span className="text-sm font-semibold">
                            System Feed
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-center">
                        {/* FOOTER */}
                        <div className="text-center">
                            <button className="text-xs cursor-pointer text-gray-400 transition hover:text-[#81b64c]">
                                Mark all as read
                            </button>
                        </div>
                    </div>
                </div>

                {/* LIST */}
                <div className="flex h-full flex-col gap-3 overflow-y-auto pr-1">
                    {notifications.map((n) => (
                        <div
                            key={n.id}
                            className="relative border border-white/10 bg-[#141414] p-4 transition-all duration-200 hover:border-[#81b64c]/30 hover:bg-[#1a1a1a]"
                        >
                            {/* LEFT ACCENT BAR */}
                            <div
                                className={`absolute top-0 left-0 h-full w-1 rounded-l-xl ${getAccent(n.type)}`}
                            />

                            {/* UNREAD DOT */}
                            {n.unread && (
                                <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-[#81b64c] shadow-[0_0_8px_#81b64c]" />
                            )}

                            <div className="flex flex-col gap-1 pl-2">
                                <div className="text-sm font-semibold text-white">
                                    {n.title}
                                </div>

                                <div className="text-xs leading-relaxed text-gray-400">
                                    {n.text}
                                </div>

                                <div className="text-[11px] text-[#81b64c]/70">
                                    {n.time}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}
