import IconDetailed from '@/assets/IconDetailed';
import { router } from '@inertiajs/react';
import { ChartArea } from 'lucide-react';
import { route } from 'ziggy-js';

export default function Header() {
    return (
        <div className="text-md rubik top-0 flex h-16 w-screen min-w-screen items-center justify-between bg-[#111111] p-4 font-semibold text-[#e2e8ce]">
            <div className="flex items-center">
                <IconDetailed />
            </div>
            <div
                onClick={() => router.post(route('logout'))}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-[#e2e8ce] transition-all duration-200 hover:bg-white/10 hover:text-white"
            >
                <ChartArea className="h-4 w-4 opacity-70" />
                Выход
            </div>
        </div>
    );
}
