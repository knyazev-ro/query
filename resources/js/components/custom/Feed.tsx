import { useState } from 'react';
import CommentaryMessageBlock from './CommentaryMessageBlock';
import EventFeed from './EventFeed';
import Filters from './Filters';
import InputBlock from './InputBlock';
import TaskBlock from './TaskBlock';
import TaskFeed from './TaskFeed';

export default function Feed() {
    const [filters, setFilters] = useState([
        'Комментарий',
        'Задачи',
        'Ивент',
        'Статистика',
    ]);

    return (
        <div className="flex flex-col">
            <InputBlock />
            <Filters />
            {/* Feed */}
            <div className="flex flex-col h-full px-2 gap-3 py-4">
                <EventFeed />
                <TaskFeed/>
                <CommentaryMessageBlock />
                <EventFeed />
            </div>
        </div>
    );
}
