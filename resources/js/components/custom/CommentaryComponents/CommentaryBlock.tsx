import {
    AtSymbolIcon,
    BoldIcon,
    DocumentChartBarIcon,
    PaperClipIcon,
    PlayCircleIcon,
    StarIcon,
} from '@heroicons/react/16/solid';
import { useForm } from '@inertiajs/react';
import RichTextEditor from './RichTextEditor';
import { useEffect, useState } from 'react';
import { uniqBy } from 'lodash';
import Files from './Files';

export default function CommentaryBlock() {
    
    const [hotKey, setHotKey] = useState<string | null>(null);

    const { data, setData } = useForm({
        content: [
            {
                type: 'paragraph',
                children: [{ text: '' }],
            },
        ],
        files: [],
    });

    const handleClickVideoEmbed = () => {
        setHotKey('mod+shift+v');
        setTimeout(() => setHotKey(null), 0);
    };

    const handleClickFileAttach = (files) => {
        setData('files', uniqBy([...data.files, ...files], file => file?.name));
    };

    const handleClickBoldText = () => {
        setHotKey('mod+b');
        setTimeout(() => setHotKey(null), 0);
    };

    const handleClickMentionUser = () => {
        setHotKey(null);
        setTimeout(() => setHotKey(null), 0);
    };

    return (
        <div className="relative flex h-full min-h-11.5 w-full rounded-xs">
            <div className="flex h-full flex-col px-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#81b64c] text-center">
                    <StarIcon className="w-6 rotate-45 text-[#fcfff3]" />
                </div>
            </div>
            <div className='flex flex-col h-full w-full'>

            <div className="flex h-full w-full items-center p-2">
                <RichTextEditor
                    value={data.content}
                    setValue={(e) => setData('content', e)}
                    hotKeyOutside={hotKey}
                    />
            </div>
                <Files files={data.files} setFiles={(f) => setData('files', f)} />
                    </div>
            <div className="flex h-full flex-col justify-end">
                <div className="z-10 flex gap-6 px-4 py-4">
                    <button className="cursor-pointer flex items-center justify-center rounded-full p-1 transition-all duration-300 hover:bg-[#ff1b1c]/30">
                        <input multiple type="file" className='opacity-0 w-7 h-7 absolute z-10 rounded-full' onChange={(e) => handleClickFileAttach(e.target.files)}>
                        </input>
                        <PaperClipIcon className="w-5" />
                    </button>
                    <button onClick={() => handleClickVideoEmbed()} className="cursor-pointer rounded-full p-1 transition-all duration-300 hover:bg-[#ff1b1c]/30">
                        <PlayCircleIcon className="w-5" />
                    </button>
                    <button onClick={() => handleClickBoldText()} className="cursor-pointer rounded-full p-1 transition-all duration-300 hover:bg-[#ff1b1c]/30">
                        <BoldIcon className="w-5" />
                    </button>
                    <button className="cursor-pointer rounded-full p-1 transitio</button>n-all duration-300 hover:bg-[#ff1b1c]/30">
                        <AtSymbolIcon className="w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
