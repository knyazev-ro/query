export default function Levels({ level, size = 2 }: {level: number, size: number}) {
    const levels = [false, false, false, false, false].map((e, idx) =>
        level >= idx + 1 ? true : false,
    );
    return (
        <div className="flex items-center justify-between gap-1.5 px-1">
            {levels.map((e) => (
                <div
                    className={`h-${size} w-${size} rounded-full ${e ? 'bg-[#ff1b1c]' : 'bg-[#acbfa4]'}`}
                ></div>
            ))}
        </div>
    );
}
