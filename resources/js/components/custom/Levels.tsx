type LevelsProps = {
    level?: number;
    size?: number;
    onChange?: (level: number) => void;
    disabled?: boolean;
};

export default function Levels({
    level = 0,
    size = 2,
    onChange,
    disabled = false,
}: LevelsProps) {
    const normalizedLevel = Number(level ?? 0);
    const canEdit = Boolean(onChange) && !disabled;
    const dimension = `${size * 0.25}rem`;
    const levels = [false, false, false, false, false].map(
        (_enabled, idx) => normalizedLevel >= idx + 1,
    );

    return (
        <div className="flex items-center justify-between gap-1.5 px-1">
            {levels.map((enabled, idx) => {
                const nextLevel = idx + 1;

                return (
                    <button
                        key={nextLevel}
                        type="button"
                        disabled={!canEdit}
                        onClick={() =>
                            onChange?.(
                                normalizedLevel === nextLevel ? 0 : nextLevel,
                            )
                        }
                        aria-label={`Set level ${nextLevel}`}
                        className={`rounded-full transition ${
                            enabled ? 'bg-[#ff1b1c]' : 'bg-[#acbfa4]'
                        } ${
                            canEdit
                                ? 'cursor-pointer hover:scale-110 hover:bg-[#ff4b4c]'
                                : 'cursor-default'
                        }`}
                        style={{
                            width: dimension,
                            height: dimension,
                        }}
                    />
                );
            })}
        </div>
    );
}
