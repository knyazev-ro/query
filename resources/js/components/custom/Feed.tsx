import { useState } from 'react';
import Filters from './Filters';
import InputBlock from './InputBlock';
import CommentaryMessageBlock from './CommentaryMessageBlock';

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
            <div className='flex flex-col px-2 py-4'>
                <CommentaryMessageBlock/>
            </div>
        </div>
    );
}
