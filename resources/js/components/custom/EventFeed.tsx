import EventBlock from "./EventBlock";

export default function EventFeed() {
    return <div className="flex justify-between px-3 py-4 gap-2 w-full bg-[#81b64c]/20 items-center border-[#81b64c] border">
        <div className="flex gap-2 items-center">
            <div className="font-semibold border-b-1 border-[#81b64c] ">{"Событие:"}</div>
            <div className="font-medium">{"Новое событие"}</div>
        </div>
        <div className="font-medium">Вт, 4 Ноя, 23:11 - Ср, 5 Ноя, 00:11</div>
    </div>;
}
