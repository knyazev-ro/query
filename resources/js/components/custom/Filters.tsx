import { ChevronUpIcon } from '@heroicons/react/16/solid';
import { FilterIcon } from 'lucide-react';
import { useState } from 'react';

export default function Filters() {
    const [filters, setFilters] = useState([
        'Комментарий',
        'Задачи',
        'Ивент',
        'Статистика',
    ]);
    return (
        <div className="flex flex-col">
            {/* filters */}
            <div className="flex w-full items-center py-2 text-[#acbfa4]">
                <div
                    className="flex cursor-pointer"
                    onClick={() => {
                        //
                    }}
                >
                    <FilterIcon />
                    <ChevronUpIcon className="w-5" />
                </div>
                <div className="w-full border-t-1 border-[#acbfa4]/50"></div>
            </div>
            <div className="flex gap-2">
                {filters.map((filter) => {
                    return (
                        <div className="rounded-full bg-[#81b64c] font-semibold px-6 py-2 text-white">
                            {filter}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
