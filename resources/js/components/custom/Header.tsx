import { router } from '@inertiajs/react';
import { ChartArea } from 'lucide-react';
import { route } from 'ziggy-js';

export default function Header() {
    return (
        <div className="text-md rubik top-0 flex h-16 w-screen min-w-screen items-center justify-between border-b-2 border-[#7700ff]/10 bg-[#262626] p-4 font-semibold text-[#e2e8ce]">
            <div className="flex items-center">
                <ChartArea className="mr-2 size-6 bg-[#7700ff] fill-white text-[#7700ff] ring-2 ring-[#7700ff]" />
                {'QUERY CRM'.toUpperCase()}
            </div>
            <div
                onClick={() => router.post(route('logout'))}
                className="rubik flex cursor-pointer items-center rounded-xs p-2 text-sm hover:bg-gray-100"
            >
                {'Выход'}
            </div>
        </div>
    );
}
