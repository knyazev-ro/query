import Icon from '@/assets/Icon';
import IconDetailed from '@/assets/IconDetailed';
import { CogIcon, UserCircleIcon } from '@heroicons/react/16/solid';
import { router } from '@inertiajs/react';
import { BoxIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import Kanban from './SidebarComponents/Kanban';
import User from './SidebarComponents/User';
import Settings from './SidebarComponents/Settings';

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(
        localStorage.getItem('bar') === '1' ? true : false,
    );

    const menuItems = [
        { name: 'Канбан', component: Kanban },
        //     { name: 'Дешборд', href: route('board.index'), icon: ChartBarIcon },
        //     { name: 'Отчеты', href: route('reports.index'), icon: PaperClipIcon },
        //     { name: 'Проекты', href: route('projects.index'), icon: GitBranchPlus },
        //     { name: 'Пользователи', href: route('users.index'), icon: UserRoundCog },
        //     { name: 'Ассистент', href: route('chat.chat'), icon: BotIcon },
    ];

    const bottomItems = [
        { name: 'Канбан', component: User, icon: UserCircleIcon },
        { name: 'Настройки', component: Settings, icon: CogIcon },
        //     { name: 'Дешборд', href: route('board.index'), icon: ChartBarIcon },
        //     { name: 'Отчеты', href: route('reports.index'), icon: PaperClipIcon },
        //     { name: 'Проекты', href: route('projects.index'), icon: GitBranchPlus },
        //     { name: 'Пользователи', href: route('users.index'), icon: UserRoundCog },
        //     { name: 'Ассистент', href: route('chat.chat'), icon: BotIcon },
    ];

    return (
        <div
            className={`flex h-screen flex-col border-r-2 border-[#1e1d1d] bg-[#262626] text-[#fcfff3] shadow-lg transition-all duration-300 ${
                collapsed ? 'w-28' : 'w-96'
            }`}
        >
            <div className="flex w-full py-2 items-center justify-center">
                {collapsed ? <Icon /> : <IconDetailed />}
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
            <div className="flex h-full flex-col justify-between">
                <nav className="space-y-1">
                    {menuItems.map((item, index) => (
                        <item.component collapsed={collapsed} index={index} />
                    ))}
                </nav>
                <nav className="bg-[#1e1d1d]">
                    {bottomItems.map((item, index) => (
                        <item.component collapsed={collapsed} index={index} />
                    ))}
                </nav>
            </div>
        </div>
    );
}
