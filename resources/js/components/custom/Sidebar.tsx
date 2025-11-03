import Icon from '@/assets/Icon';
import IconDetailed from '@/assets/IconDetailed';
import { router } from '@inertiajs/react';
import { BoxIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(
        localStorage.getItem('bar') === '1' ? true : false,
    );

    const menuItems = [
        { name: 'Канбан', href: route('kanban.index'), icon: BoxIcon },
        //     { name: 'Дешборд', href: route('board.index'), icon: ChartBarIcon },
        //     { name: 'Отчеты', href: route('reports.index'), icon: PaperClipIcon },
        //     { name: 'Проекты', href: route('projects.index'), icon: GitBranchPlus },
        //     { name: 'Пользователи', href: route('users.index'), icon: UserRoundCog },
        //     { name: 'Ассистент', href: route('chat.chat'), icon: BotIcon },
    ];

    return (
        <div
            className={`flex h-screen flex-col border-r border-white bg-[#262626] py-4 text-[#fcfff3] shadow-lg transition-all duration-300 ${
                collapsed ? 'w-28' : 'w-96'
            }`}
        >
            <div className="flex w-full items-center justify-center">
                {collapsed ? <Icon/> : <IconDetailed/>}
            </div>
            {/* Кнопка сворачивания */}
            <button
                onClick={() => {
                    setCollapsed((c) => {
                        localStorage.setItem('bar', !c ? '1' : '0');
                        return !c;
                    });
                }}
                className="mb-6 flex items-center justify-center transition hover:text-stone-800"
            >
                {collapsed ? (
                    <ChevronRight className="h-5 w-5" />
                ) : (
                    <ChevronLeft className="h-5 w-5" />
                )}
            </button>

            {/* Навигация */}
            <nav className="space-y-1">
                {menuItems.map((item, index) => (
                    <div
                        key={index}
                        onClick={() => router.get(item.href)}
                        className={`flex cursor-pointer items-center gap-3 px-4 py-4 transition hover:bg-[#ff1b1c] ${
                            collapsed ? 'justify-center' : ''
                        }`}
                    >
                        <item.icon className="h-5 w-5 text-[#fcfff3]" />
                        {!collapsed && (
                            <span className="text-sm font-medium text-[#fcfff3]">
                                {item.name}
                            </span>
                        )}
                    </div>
                ))}
            </nav>
        </div>
    );
}
