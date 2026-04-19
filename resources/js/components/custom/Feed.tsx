import { FeedType } from '@/enums/FeedType';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { sortBy, uniqBy } from 'lodash';
import { useEffect, useState } from 'react';
import CommentaryBlock from './CommentaryComponents/CommentaryBlock';
import CommentaryMessageBlock from './CommentaryComponents/CommentaryMessageBlock';
import EventFeed from './EventFeed';
import Filters from './Filters';
import TaskFeed from './TaskFeed';

export default function Feed({ entityId }: { entityId: number }) {
    const perPage = 15;
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [feedElements, setFeedElements] = useState([]);

    const [activeTab, setActiveTab] = useState(0);

    const tabs = [
        {
            name: 'Комментарий',
            component: (
                <CommentaryBlock
                    sendRoute={route(
                        'projects.feed.write.commentary',
                        entityId,
                    )}
                />
            ),
        },
        { name: 'Задача', component: <div /> },
        { name: 'Ивент', component: <div /> },
        { name: 'Статистика', component: <div /> },
    ];

    const fetchFeed = async (page: number) => {
        const query = `?page=${page}&per_page=${perPage}`;
        const response = await axios.get(
            route('projects.show.feed', entityId) + query,
        );

        const totalRes = response?.data?.total ?? 0;
        const lastPageRes = response?.data?.last_page ?? 1;
        const data = response?.data?.data ?? [];

        setLastPage(lastPageRes);
        setTotal(totalRes);

        setFeedElements((prev) =>
            sortBy(
                uniqBy([...data, ...prev], (e) => e.id),
                (e) => e.updated_at,
            ).reverse(),
        );
    };

    const nextPage = () => {
        if (page < lastPage && total - feedElements.length > 0) {
            setPage((p) => p + 1);
        }
    };

    const reload = () => setPage(1);

    useEffect(() => {
        fetchFeed(page);
    }, [page]);

    return (
        <div className="flex h-full flex-col rounded-2xl">
            {/* HEADER */}
            <div className="flex flex-col gap-3 border-b border-white/10 p-4">
                {/* Tabs */}
                <div className="flex gap-2">
                    {tabs.map((tab, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveTab(i)}
                            className={`rounded-lg px-3 py-1.5 text-sm transition-all ${
                                activeTab === i
                                    ? 'bg-white/10 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            } `}
                        >
                            {tab.name}
                        </button>
                    ))}
                </div>

                {/* Input */}
                <div className="rounded-xl bg-white/5 p-3 backdrop-blur">
                    {tabs[activeTab].component}
                </div>
            </div>

            {/* FILTERS */}
            <div className="border-b border-white/10 px-4 py-3">
                <Filters />
            </div>

            {/* FEED */}
            <div className="flex flex-1 flex-col gap-3 p-4">
                {feedElements.map((feed) => {
                    const onEdit = async (data) => {
                        router.post(
                            route('projects.feed.edit.commentary', [
                                entityId,
                                feed?.resource?.id ?? null,
                            ]),
                            data,
                            {
                                onFinish: reload,
                                preserveState: true,
                                preserveScroll: true,
                            },
                        );
                    };

                    return (
                        <div key={feed.id} className="">
                            {(() => {
                                switch (feed.resource_type) {
                                    case FeedType.COMMENTARY:
                                        return (
                                            <CommentaryMessageBlock
                                                commentary={feed.resource}
                                                onEdit={onEdit}
                                            />
                                        );
                                    case FeedType.EVENT:
                                        return <EventFeed />;
                                    case FeedType.TASK:
                                        return <TaskFeed />;
                                    case FeedType.STAT:
                                        return (
                                            <div className="text-gray-400">
                                                Статистика...
                                            </div>
                                        );
                                    default:
                                        return null;
                                }
                            })()}
                        </div>
                    );
                })}

                {/* LOAD MORE */}
                {page < lastPage && (
                    <button
                        onClick={nextPage}
                        className="mt-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white"
                    >
                        Загрузить ещё
                    </button>
                )}
            </div>
        </div>
    );
}
