import { EllipsisVerticalIcon, StarIcon } from '@heroicons/react/16/solid';
import { HeartIcon } from 'lucide-react';

export default function CommentaryMessageBlock() {
    return (
        <div className="flex justify-between gap-4 border-b-1 border-[#81b64c] bg-[#acbfa4]/10 px-2 py-4">
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
                            'But I must explain to you how all this mistaken idea of reprobating pleasure and extolling pain arose. To do so, I will give you a complete account of the system and expound the teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter extremely painful consequences.'
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
