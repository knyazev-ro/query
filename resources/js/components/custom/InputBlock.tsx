import { useState } from 'react';
import CommentaryInputBlock from './CommentaryBlock';

export default function InputBlock() {
    const [tabs, setTabs] = useState([
        {
            name: 'Комментарий',
            current: true,
            component: <div></div>,
        },
        {
            name: 'Создать задачу',
            current: false,
            component: <div></div>,
        },
        {
            name: 'Ивент',
            current: false,
            component: <div></div>,
        },
        {
            name: 'Статистика',
            current: false,
            component: <div></div>,
        },
    ]);

    const handlePickTab = (idx: number) => {
        setTabs((tabs) =>
            tabs.map((e, i) => ({ ...e, current: i === idx ? true : false })),
        );
    };

    return (
        <div className="flex w-full flex-col bg-[#fcfff3] text-[#262626]">
            <div className="flex gap-1 px-3 py-2 font-semibold">
                {tabs.map((tab, idx) => (
                    <div
                        key={idx}
                        onClick={() => handlePickTab(idx)}
                        className={`cursor-pointer border-[#ff7f11] px-3 py-1 transition-all hover:bg-[#acbfa4]/20 ${tab.current ? 'border-b-2' : ''}`}
                    >
                        {tab.name}
                    </div>
                ))}
            </div>
            <CommentaryInputBlock />
        </div>
    );
}
