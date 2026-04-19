import {
    ChevronUpIcon,
    CogIcon,
    UserCircleIcon,
} from '@heroicons/react/16/solid';
import { useState } from 'react';
import Clients from './SidebarComponents/Clients';
import Contacts from './SidebarComponents/Contacts';
import Feed from './SidebarComponents/Feed';
import Kanban from './SidebarComponents/Kanban';
import Media from './SidebarComponents/Media';
import Messages from './SidebarComponents/Messages';
import Notifications from './SidebarComponents/Notifications';
import Settings from './SidebarComponents/Settings';
import User from './SidebarComponents/User';
import Users from './SidebarComponents/Users';

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(
        localStorage.getItem('bar') === '1' ? true : false,
    );

    const menuItems = [
        { name: 'Канбан', component: Kanban },
        { name: 'Уведомления', component: Notifications },
        { name: 'Сообщения', component: Messages },
        { name: 'Лента', component: Feed },
        { name: 'Клиенты', component: Clients },
        { name: 'Контакты', component: Contacts },
        { name: 'Пользователи', component: Users },
        { name: 'Медиа', component: Media },
    ];

    const bottomItems = [
        { name: 'Канбан', component: User, icon: UserCircleIcon },
        { name: 'Настройки', component: Settings, icon: CogIcon },
    ];

    // return (
    //     <div
    //         className={`flex w-screen flex-col border-r-2 border-[#1e1d1d] bg-[#262626] text-[#fcfff3] shadow-lg transition-all duration-300 ${
    //             collapsed ? 'w-28' : 'w-96'
    //         }`}
    //     >
    //         <div className="flex w-full py-2 items-center justify-center">
    //             {collapsed ? <Icon /> : <IconDetailed />}
    //         </div>
    //         {/* Кнопка сворачивания */}
    //         <button
    //             onClick={() => {
    //                 setCollapsed((c) => {
    //                     localStorage.setItem('bar', !c ? '1' : '0');
    //                     return !c;
    //                 });
    //             }}
    //             className="mb-6 flex items-center justify-center transition hover:text-stone-800"
    //         >
    //             {collapsed ? (
    //                 <ChevronRight className="h-5 w-5" />
    //             ) : (
    //                 <ChevronLeft className="h-5 w-5" />
    //             )}
    //         </button>

    //         {/* Навигация */}
    //         <div className="flex justify-between">
    //             <nav className="flex space-y-1">
    //                 {menuItems.map((item, index) => (
    //                     <item.component collapsed={collapsed} index={index} />
    //                 ))}
    //             </nav>
    //             <nav className="bg-[#1e1d1d]">
    //                 {bottomItems.map((item, index) => (
    //                     <item.component collapsed={collapsed} index={index} />
    //                 ))}
    //             </nav>
    //         </div>
    //     </div>
    // );

    const [hovered, setHovered] = useState(false);

    return (
        <div className="relative flex w-full items-center justify-center border">
            {/* Панель */}
            <div
                onMouseLeave={() => setHovered(false)}
                className={`absolute bottom-0 flex h-24 w-full items-center justify-center transition-all duration-300 ${hovered ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-20 opacity-0'} `}
            >
                <div className="flex h-18 w-128 justify-between items-center rounded-3xl bg-black/90 px-4 py-1">
                    {menuItems.map((item, index) => (
                        <item.component
                            key={index}
                            collapsed={collapsed}
                            index={index}
                        />
                    ))}
                </div>
            </div>

            {/* Кнопка */}
            <div
                onMouseEnter={() => setHovered(true)}
                className={`absolute bottom-0 flex h-18 w-full items-center justify-center bg-gradient-to-t from-black/20 transition-all duration-300 ${hovered ? 'pointer-events-none translate-y-20 opacity-0' : 'translate-y-0 opacity-100'} `}
            >
                <ChevronUpIcon className="w-8 cursor-pointer rounded-full" />
            </div>
        </div>
    );
}
