import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { UserCircleIcon, UserIcon } from '@heroicons/react/16/solid';
import { router } from '@inertiajs/react';
import { LogOutIcon } from 'lucide-react';
import { route } from 'ziggy-js';

export default function User({ collapsed, index }) {
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
        <Menu as={'div'} className={'relative'}>
            <MenuButton
                as="div"
                className={`flex cursor-pointer items-center bg-[#acbfa4] gap-3 px-4 py-4 transition hover:bg-[#ff1b1c] ${
                    collapsed ? 'justify-center' : ''
                }`}
            >
                <UserCircleIcon className="h-5 w-5" />
                {!collapsed && (
                    <span className="text-sm font-medium">
                        {'Профиль'}
                    </span>
                )}
            </MenuButton>
            <MenuItems className={'bg-[#1e1d1d] flex flex-col justify-center items-center'}>
                {items.map((e, idx) => (
                    <MenuItem
                        key={idx}
                        as={'div'}
                        onClick={() => {
                            if (e.method === 'POST') {
                                router.post(e.href);
                            } else {
                                router.get(e.href);
                            }
                        }}
                        className={`flex ${ collapsed ? 'justify-center' : 'px-6'} w-full gap-3 py-3 text-left text-sm font-semibold hover:bg-[#ff1b1c] data-focus:bg-[#ff1b1c]`}
                    >
                        {<e.icon className="w-4" />}
                        {!collapsed && (
                            <div className="flex items-center gap-2">
                                {e.name}
                            </div>
                        )}
                    </MenuItem>
                ))}
            </MenuItems>
        </Menu>
    );
}
