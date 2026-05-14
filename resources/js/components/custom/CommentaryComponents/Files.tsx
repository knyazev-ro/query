// @ts-nocheck
import { DocumentTextIcon, XMarkIcon } from '@heroicons/react/16/solid';

const fileUrl = (file) => {
    if (!file?.path) {
        return null;
    }

    return `/storage/${file.path}`;
};

const isImage = (file) => {
    if (file?.type) {
        return file.type.match('image.*');
    }

    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(
        String(file?.ext ?? '').toLowerCase(),
    );
};

export default function Files({ files = [], setFiles, readOnly = false }) {
    const removeFromList = (idx = null) => {
        if (readOnly) {
            return;
        }

        const file = files[idx];
        if (!file?.id) {
            setFiles(files.filter((_, i) => i !== idx));
            return;
        }

        setFiles(
            files.map((item, i) =>
                idx === i ? { ...item, toDelete: !item?.toDelete } : item,
            ),
        );
    };

    if (!files?.length) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-1.5 p-1 text-xs">
            {files.map((file, index) => {
                const href = fileUrl(file);
                const isBrowserFile = typeof File !== 'undefined' && file instanceof File;
                const imageSrc = isBrowserFile ? URL.createObjectURL(file) : href;

                return (
                    <div key={file?.id ?? file?.name ?? index} className={file?.toDelete ? 'opacity-50' : ''}>
                        {!isImage(file) ? (
                            <div className="flex items-center gap-2 border border-[#81b64c] bg-[#81b64c]/20 p-2 font-semibold transition-colors hover:bg-[#81b64c]/10">
                                <DocumentTextIcon className="w-5 text-[#81b64c]" />
                                {href ? (
                                    <a href={href} target="_blank" className="max-w-28 truncate hover:underline">
                                        {file.name}
                                    </a>
                                ) : (
                                    <div className="max-w-28 truncate">{file.name}</div>
                                )}
                                {!readOnly && (
                                    <button
                                        type="button"
                                        onClick={() => removeFromList(index)}
                                        className="cursor-pointer"
                                    >
                                        <XMarkIcon className="w-4 bg-[#ff1b1c] text-white" />
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="relative flex border border-[#81b64c] bg-[#81b64c]/20 p-2">
                                {imageSrc && (
                                    <img
                                        src={imageSrc}
                                        alt={file.name}
                                        className="max-h-20 max-w-28 object-contain"
                                    />
                                )}
                                {!readOnly && (
                                    <button
                                        type="button"
                                        onClick={() => removeFromList(index)}
                                        className="absolute top-0 right-0 cursor-pointer"
                                    >
                                        <XMarkIcon className="w-4 bg-[#ff1b1c] text-white" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
