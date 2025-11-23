import { DocumentTextIcon, XMarkIcon } from '@heroicons/react/16/solid';

export default function Files({ files, setFiles }) {
    const removeFromList = (file, idx = null) => {
        console.log(file);
        if (!file?.id) {
            setFiles([
                ...files.filter((e, i) => {
                    console.log(i, idx);
                    return i !== idx;
                }),
            ]);
            return;
        }
        setFiles(files.map((e, i) => {
            if(idx === i) {
                return ({ ...e, toDelete: !e?.toDelete })
            } else {
                return e;
            }
        }));
    };

    return (
        <div className="flex flex-wrap gap-1.5 p-1 text-xs">
            {files.map((file, index) => (
                <div className={`${file?.toDelete ? 'opacity-50' : ''}`}>
                    {' '}
                    {!file?.type?.match('image.*') ? (
                        <div
                            key={index}
                            className="flex items-center gap-2 border border-[#81b64c] bg-[#81b64c]/20 p-2 font-semibold transition-colors hover:bg-[#81b64c]/10"
                        >
                            <div>
                                <DocumentTextIcon className="w-5 text-[#81b64c]" />
                            </div>
                            <div className="max-w-28 truncate">{file.name}</div>
                            <button
                                onClick={() => {
                                    removeFromList(file, index);
                                }}
                                className="cursor-pointer"
                            >
                                <XMarkIcon className="w-4 bg-[#ff1b1c] text-white" />
                            </button>
                        </div>
                    ) : (
                        <div
                            key={index}
                            className="relative flex border border-[#81b64c] bg-[#81b64c]/20 p-2"
                        >
                            <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="max-h-20 max-w-28"
                            />
                            <button
                                onClick={() => {
                                    removeFromList(file, index);
                                }}
                                className="absolute top-0 right-0 cursor-pointer"
                            >
                                <XMarkIcon className="w-4 bg-[#ff1b1c] text-white" />
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
