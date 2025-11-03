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
                className={`flex cursor-pointer items-center gap-3 px-4 py-4 transition hover:bg-[#ff1b1c] ${
                    collapsed ? 'justify-center' : ''
                }`}
            >
                <UserCircleIcon className="h-5 w-5 text-[#fcfff3]" />
                {!collapsed && (
                    <span className="text-sm font-medium text-[#fcfff3]">
                        {'Профиль'}
                    </span>
                )}
            </MenuButton>
            <MenuItems className={'bg-[#1e1d1d]'}>
                {items.map((e, idx) => (
                    <MenuItem
                        key={idx}
                        as={'div'}
                        onClick={() => {
                            if(e.method === 'POST') {
                                router.post(e.href)
                            } else {
                                router.get(e.href)
                            }
                        }}
                        className="block w-full px-6 text-sm font-semibold py-3 text-left hover:bg-[#ff1b1c] data-focus:bg-[#ff1b1c]"
                    >
                        <div className='flex gap-2 items-center'>
                        {<e.icon className='w-4'/>}
                        {e.name}
                        </div>
                    </MenuItem>
                ))}
            </MenuItems>
        </Menu>
    );
}
