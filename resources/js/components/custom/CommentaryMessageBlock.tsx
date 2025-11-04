import { EllipsisVerticalIcon, StarIcon } from '@heroicons/react/16/solid';
import { HeartIcon } from 'lucide-react';

export default function CommentaryMessageBlock() {
    return (
        <div className="flex justify-between gap-4 border-b-1 border-[#81b64c] px-2 py-4">
            <div className="h-full">
                <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#81b64c] text-center">
                    <StarIcon className="w-5" />
                </div>
            </div>
            <div className="flex w-full flex-col text-sm">
                <div className="font-medium">{'knyazevseven@gmail.com'}</div>
                <div className="text-sm">{'Сегодня, 12:22'}</div>
                <div className="mt-4 flex flex-col gap-2">
                    <div className="py-1">
                        {
                            'Хочешь, я покажу конкретный пример миграций и моделей Laravel для этой структуры (company ↔ contacts ↔ phones)?'
                        }
                    </div>

                    <div className="flex gap-2">
                        <div className="flex cursor-pointer items-center justify-center rounded-full bg-[#acbfa4] px-2 py-1">
                            <HeartIcon className="w-4 text-[#262626]" />
                        </div>
                        <div className="flex cursor-pointer items-center justify-center rounded-full bg-[#acbfa4] px-3 py-1 font-semibold text-[#262626]">
                            {'Ответить'}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex h-full flex-col py-1">
                <div className="cursor-pointer">
                    <EllipsisVerticalIcon className="w-5" />
                </div>
            </div>
        </div>
    );
}
