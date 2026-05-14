// @ts-nocheck
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
    const [reloadKey, setReloadKey] = useState(0);
    const [activeTab, setActiveTab] = useState(0);

    const reload = () => {
        setFeedElements([]);
        setPage(1);
        setReloadKey((key) => key + 1);
    };

    const tabs = [
        {
            name: 'Комментарий',
            component: (
                <CommentaryBlock
                    sendRoute={route('projects.feed.write.commentary', entityId)}
                    onSaved={reload}
                />
            ),
        },
        { name: 'Задача', component: <div /> },
        { name: 'Ивент', component: <div /> },
        { name: 'Статистика', component: <div /> },
    ];

    const fetchFeed = async (nextPage: number) => {
        const response = await axios.get(route('projects.show.feed', entityId), {
            params: { page: nextPage, per_page: perPage },
        });

        const totalRes = response?.data?.total ?? 0;
        const lastPageRes = response?.data?.last_page ?? 1;
        const data = response?.data?.data ?? [];

        setLastPage(lastPageRes);
        setTotal(totalRes);
        setFeedElements((prev) => {
            const source = nextPage === 1 ? data : [...prev, ...data];

            return sortBy(uniqBy(source, (element) => element.id), (element) => element.updated_at).reverse();
        });
    };

    const nextPage = () => {
        if (page < lastPage && total - feedElements.length > 0) {
            setPage((currentPage) => currentPage + 1);
        }
    };

    useEffect(() => {
        fetchFeed(page);
    }, [page, reloadKey, entityId]);

    return (
        <div className="flex h-full flex-col rounded-md">
            <div className="flex flex-col gap-3 border-b border-white/10 p-4">
                <div className="flex gap-2">
                    {tabs.map((tab, i) => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(i)}
                            className={`rounded-md px-3 py-1.5 text-sm transition-all ${
                                activeTab === i
                                    ? 'bg-white/10 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            } `}
                        >
                            {tab.name}
                        </button>
                    ))}
                </div>

                <div className="rounded-md bg-white/5 p-3 backdrop-blur">
                    {tabs[activeTab].component}
                </div>
            </div>

            <div className="border-b border-white/10 px-4 py-3">
                <Filters />
            </div>

            <div className="flex flex-1 flex-col gap-3 p-4">
                {feedElements.map((feed) => {
                    const onEdit = async (data, done) => {
                        router.post(
                            route('projects.feed.edit.commentary', [
                                entityId,
                                feed?.resource?.id ?? null,
                            ]),
                            data,
                            {
                                forceFormData: true,
                                preserveState: true,
                                preserveScroll: true,
                                onSuccess: () => {
                                    done?.();
                                    reload();
                                },
                            },
                        );
                    };

                    return (
                        <div key={feed.id}>
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

                {page < lastPage && (
                    <button
                        onClick={nextPage}
                        className="mt-2 rounded-md border border-white/10 px-4 py-2 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white"
                    >
                        Загрузить ещё
                    </button>
                )}
            </div>
        </div>
    );
}
