export default function TaskFeed() {
    const name = 'Новая задача №4';
    return <div className="flex justify-center px-3 py-4 gap-2 w-full bg-[#81b64c]/20 items-center border-[#81b64c] border">
        <div>{`Задача: ${name}`}</div>
    </div>;
}
