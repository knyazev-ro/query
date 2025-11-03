import { PlusIcon } from "@heroicons/react/16/solid";

export default function Pipelines({ pipelines }) {

    const handleEditPipeline = () => {
        //
    }

    const handleAddPipeline = () => {
        // 
    }

    return (
        <div className="px-2 flex flex-col gap-1">
            <div className="text-gray-300 text-md font-semibold px-4">
                {"Потоки"}
            </div>
        <div className="flex max-h-11 overflow-y-hidden overflow-hidden whitespace-nowrap">
            <div
                className="bg-[#262626] px-4 kanban-column -mr-8"
                style={{
                    zIndex: 100
                }}>
               <div
               onClick={() => handleAddPipeline()} 
               className="kanban-column cursor-pointer text-lg flex items-center justify-center text-center bg-[#ff1b1c] px-9 py-3 font-semibold">
                    <PlusIcon className="w-5"/>
                </div>
                </div>
            {pipelines?.map((e, idx) => (
                <div
                className="bg-[#262626] px-4 kanban-column -mr-8"
                style={{
                    zIndex: (pipelines.length - idx)
                }}>
               <div
               onClick={() => handleEditPipeline()} 
               className="kanban-column cursor-pointer text-sm bg-[#ff1b1c] px-9 py-3 font-semibold">
                    {e.name.toUpperCase()}
                </div>
                </div>
            ))}
        </div>
        </div>
    );
}
