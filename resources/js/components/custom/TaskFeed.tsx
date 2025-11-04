import { EllipsisHorizontalIcon } from "@heroicons/react/16/solid";
import Levels from "./Levels";

export default function TaskFeed() {
    const name = 'Новая задача №4';
    return <div className="text-md flex justify-center px-3 py-4 gap-2 w-full bg-[#81b64c]/20 items-center border-[#81b64c] border">
        <div className="bg-[#262626] p-1 rounded-full">
            <Levels level={3} size={1.5}/>
        </div>
        <div className="font-semibold border-b-1 border-[#81b64c]">{`Задача:`}</div>
        <div className="font-medium">
             {name}
        </div>
    </div>;
}
