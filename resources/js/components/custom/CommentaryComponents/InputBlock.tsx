import { JSX, useState } from 'react';

interface Tab {
    name: string;
    current: boolean;
    component: JSX.Element;
}

export default function InputBlock({ pTabs }: { pTabs: Tab[] }) {
    const [tabs, setTabs] = useState(pTabs);

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
            <div className="transition-all duration-300">
                {tabs.find((tab) => tab.current)?.component ?? null}
            </div>
        </div>
    );
}
