import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { UserCircleIcon, UserIcon } from '@heroicons/react/16/solid';
import { router } from '@inertiajs/react';
import { LogOutIcon } from 'lucide-react';
import { route } from 'ziggy-js';

export default function User({ collapsed }) {
    const items = [
        {
            name: 'Мой профиль',
            href: '/',
            icon: UserIcon,
            method: 'GET',
        },
        {
            name: 'Выйти',
            href: route('logout'),
            icon: LogOutIcon,
            method: 'POST',
        },
    ];

    return (
        <Menu as="div" className="relative">

            {/* BUTTON */}
            <MenuButton
                className={`
                    flex items-center gap-2
                    rounded-xl px-3 py-2
                    text-gray-300 transition
                    hover:bg-white/10 hover:text-white
                    ${collapsed ? 'justify-center' : ''}
                `}
            >
                <UserCircleIcon className="h-5 w-5 opacity-80" />

                {!collapsed && (
                    <span className="text-sm font-medium">
                        Профиль
                    </span>
                )}
            </MenuButton>

            {/* DROPDOWN */}
            <MenuItems
                className="
                    absolute bottom-full left-0 mb-2 w-48
                    rounded-xl border border-white/10
                    bg-[#1c1c1c] p-1 shadow-2xl backdrop-blur-xl
                    focus:outline-none
                "
            >
                {items.map((e, idx) => (
                    <MenuItem key={idx}>
                        {({ active }) => (
                            <div
                                onClick={() => {
                                    if (e.method === 'POST') {
                                        router.post(e.href);
                                    } else {
                                        router.get(e.href);
                                    }
                                }}
                                className={`
                                    flex cursor-pointer items-center gap-2
                                    rounded-lg px-3 py-2 text-sm
                                    transition
                                    ${
                                        active
                                            ? 'bg-white/10 text-white'
                                            : 'text-gray-300'
                                    }
                                `}
                            >
                                <e.icon className="w-4 opacity-80" />
                                <span>{e.name}</span>
                            </div>
                        )}
                    </MenuItem>
                ))}
            </MenuItems>
        </Menu>
    );
}