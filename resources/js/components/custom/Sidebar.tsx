import {
    ChevronUpIcon,
    CogIcon,
    UserCircleIcon,
} from '@heroicons/react/16/solid';
import { useState } from 'react';

import ImgModel from './SidebarComponents/ImgModel';
import Contacts from './SidebarComponents/Contacts';
import Model from './SidebarComponents/Model';
import Kanban from './SidebarComponents/Kanban';
import Dataset from './SidebarComponents/Dataset';
import Messages from './SidebarComponents/Messages';
import Notifications from './SidebarComponents/Notifications';
import Settings from './SidebarComponents/Settings';
import User from './SidebarComponents/User';
import Users from './SidebarComponents/Users';
import { MenuIcon } from 'lucide-react';

export default function Sidebar() {
    const [hovered, setHovered] = useState(false);

    const menuItems = [
        { component: Kanban },
        { component: Notifications },
        { component: Messages },
        { component: Model },
        { component: Dataset },
        { component: ImgModel },
    ];

    const bottomItems = [
        { component: User, icon: UserCircleIcon },
        { component: Settings, icon: CogIcon },
    ];

    return (
        <div className="pointer-events-none fixed bottom-4 left-0 right-0 z-50 flex justify-center">

            {/* DOCK */}
            <div
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className={`
                    pointer-events-auto relative
                    transition-all duration-300
                    ${hovered ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
                `}
            >
                <div
                    className="
                        flex items-center gap-2
                        rounded-2xl border border-white/10
                        bg-[#1a1a1a]/80 px-3 py-2
                        shadow-2xl backdrop-blur-xl
                    "
                >
                    {menuItems.map((Item, index) => (
                        <div
                            key={index}
                            className="
                                flex items-center justify-center
                                rounded-xl p-2
                                transition-all duration-200
                                hover:bg-white/10 hover:scale-105
                            "
                        >
                            <Item.component collapsed />
                        </div>
                    ))}

                    {/* divider */}
                    <div className="mx-2 h-6 w-px bg-white/10" />

                    {bottomItems.map((Item, index) => (
                        <div
                            key={index}
                            className="
                                flex items-center justify-center
                                rounded-xl p-2
                                text-gray-400
                                transition-all duration-200
                                hover:bg-white/10 hover:text-white hover:scale-105
                            "
                        >
                            <Item.component collapsed />
                        </div>
                    ))}
                </div>
            </div>

            {/* TOGGLE BUTTON */}
            {!hovered && (
                <div
                    onMouseEnter={() => setHovered(true)}
                    className="
                        pointer-events-auto absolute bottom-0
                        flex items-center justify-center
                        transition-all duration-300
                    "
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a1a1a]/80 shadow-lg backdrop-blur-xl border border-white/10 hover:bg-white/10 transition">
                        <MenuIcon className="w-5 text-gray-400" />
                    </div>
                </div>
            )}
        </div>
    );
}