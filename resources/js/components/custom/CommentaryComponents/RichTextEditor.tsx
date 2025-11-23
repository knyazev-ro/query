import imageExtensions from 'image-extensions';
import isHotkey from 'is-hotkey';
import isUrl from 'is-url';
import React, { KeyboardEvent, useCallback, useMemo } from 'react';
import { createEditor, Editor, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import {
    Editable,
    RenderElementProps,
    RenderLeafProps,
    Slate,
    useSlateStatic,
    withReact,
} from 'slate-react';
import {
    CustomEditor,
    CustomElement,
    CustomElementWithAlign,
    CustomTextKey,
    ImageElement,
    ParagraphElement,
    RenderElementPropsFor,
    VideoElement as VideoElementType,
} from './custom-types.d';

const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'] as const;
type AlignType = (typeof TEXT_ALIGN_TYPES)[number];

const HOTKEYS: Record<string, CustomTextKey> = {
    'mod+b': 'bold',
    'mod+i': 'italic',
    'mod+u': 'underline',
    'mod+`': 'code',
};

const HOTKEYS_EMBED = {
    'mod+shift+v': 'video',
};

const getSafeUrl = (url: string) => {
    let parsedUrl: URL | null = null;
    try {
        parsedUrl = new URL(url);
        // eslint-disable-next-line no-empty
    } catch {}
    if (parsedUrl && allowedSchemes.includes(parsedUrl.protocol)) {
        return parsedUrl.href;
    }
    return 'about:blank';
};

const isMarkActive = (editor: CustomEditor, format: CustomTextKey) => {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
};

const toggleMark = (editor: CustomEditor, format: CustomTextKey) => {
    const isActive = isMarkActive(editor, format);

    if (isActive) {
        Editor.removeMark(editor, format);
    } else {
        Editor.addMark(editor, format, true);
    }
};

const insertImage = (editor: CustomEditor, url: string) => {
    const text = { text: '' };
    const image: ImageElement = { type: 'image', url, children: [text] };
    Transforms.insertNodes(editor, image);
    const paragraph: ParagraphElement = {
        type: 'paragraph',
        children: [{ text: '' }],
    };
    Transforms.insertNodes(editor, paragraph);
};

const insertVideo = (editor: CustomEditor, url: string) => {
    const text = { text: '' };
    const image: VideoElementType = { type: 'video', url, children: [text] };
    Transforms.insertNodes(editor, image);
    const paragraph: ParagraphElement = {
        type: 'paragraph',
        children: [{ text: url }],
    };
    Transforms.insertNodes(editor, paragraph);
};

const isImageUrl = (url: string): boolean => {
    if (!url) return false;
    if (!isUrl(url)) return false;
    const ext = new URL(url).pathname.split('.').pop();
    return imageExtensions.includes(ext!);
};

const withImages = (editor: CustomEditor) => {
    const { insertData, isVoid } = editor;

    editor.isVoid = (element) => {
        return element.type === 'image' ? true : isVoid(element);
    };

    editor.insertData = (data) => {
        const text = data.getData('text/plain');
        const { files } = data;

        if (files && files.length > 0) {
            Array.from(files).forEach((file) => {
                const reader = new FileReader();
                const [mime] = file.type.split('/');

                if (mime === 'image') {
                    reader.addEventListener('load', () => {
                        const url = reader.result;
                        insertImage(editor, url as string);
                    });

                    reader.readAsDataURL(file);
                }
            });
        } else if (isImageUrl(text)) {
            insertImage(editor, text);
        } else {
            insertData(data);
        }
    };

    return editor;
};

const withEmbeds = (editor: CustomEditor) => {
    const { isVoid, insertData } = editor;
    editor.isVoid = (element) =>
        element.type === 'video' ? true : isVoid(element);

    editor.insertData = (data) => {
        let text = data.getData('text/plain');
            text = text.trim();
            const url = getSafeUrl(text);
            if (url !== 'about:blank') {
                insertVideo(editor, url);
                return;
            }
        
        insertData(data);
        return;
    };
    return editor;
};

const allowedSchemes = ['http:', 'https:'];

const VideoElement = ({
    attributes,
    children,
    element,
}: RenderElementPropsFor<VideoElementType>) => {
    const { url } = element;

    const safeUrl = useMemo(() => getSafeUrl(url), [url]);

    return (
        <div {...attributes}>
            <div contentEditable={false}>
                <div className="p-2">
                    <iframe
                        src={`${safeUrl}?title=0&byline=0&portrait=0`}
                        frameBorder="0"
                        className="z-10 h-full w-full"
                    />
                </div>
            </div>
            {children}
        </div>
    );
};

const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
    if (leaf.bold) {
        children = <strong>{children}</strong>;
    }

    if (leaf.code) {
        children = <code>{children}</code>;
    }

    if (leaf.italic) {
        children = <em>{children}</em>;
    }

    if (leaf.underline) {
        children = <u>{children}</u>;
    }

    return <span {...attributes}>{children}</span>;
};

const isAlignElement = (
    element: CustomElement,
): element is CustomElementWithAlign => {
    return 'align' in element;
};

const Image = ({
    attributes,
    children,
    element,
}: RenderElementPropsFor<ImageElement>) => {
    console.log(element.url);
    return (
        <div {...attributes}>
            {children}
            <div contentEditable={false}>
                <img src={element.url} className="block max-h-96 max-w-full" />
            </div>
        </div>
    );
};

const Element = (props: RenderElementProps) => {
    const { attributes, children, element } = props;
    const style: React.CSSProperties = {};
    if (isAlignElement(element)) {
        style.textAlign = element.align as AlignType;
    }

    switch (element.type) {
        case 'block-quote':
            return (
                <blockquote style={style} {...attributes}>
                    {children}
                </blockquote>
            );
        case 'bulleted-list':
            return (
                <ul style={style} {...attributes}>
                    {children}
                </ul>
            );
        case 'heading-one':
            return (
                <h1 style={style} {...attributes}>
                    {children}
                </h1>
            );
        case 'heading-two':
            return (
                <h2 style={style} {...attributes}>
                    {children}
                </h2>
            );
        case 'list-item':
            return (
                <li style={style} {...attributes}>
                    {children}
                </li>
            );
        case 'numbered-list':
            return (
                <ol style={style} {...attributes}>
                    {children}
                </ol>
            );
        case 'image':
            return <Image {...props} />;
        case 'video':
            return <VideoElement {...props} />;
        default:
            return (
                <p style={style} {...attributes}>
                    {children}
                </p>
            );
    }
};

export default function RichTextEditor({ value, setValue }) {
    const renderElement = useCallback(
        (props: RenderElementProps) => <Element {...props} />,
        [],
    );
    const renderLeaf = useCallback(
        (props: RenderLeafProps) => <Leaf {...props} />,
        [],
    );

    const editor = useMemo(
        () => withEmbeds(withImages(withHistory(withReact(createEditor())))),
        [],
    );

    return (
        <Slate editor={editor} onValueChange={setValue} initialValue={value}>
            <Editable
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                placeholder="Введите комментарий..."
                spellCheck
                autoFocus
                className="focus:ring-none w-full resize-none font-medium break-words break-all text-[#262626]/80 transition-all outline-none focus:border-none focus:outline-none"
                onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
                    for (const hotkey in HOTKEYS) {
                        if (isHotkey(hotkey, event as any)) {
                            event.preventDefault();
                            const mark = HOTKEYS[hotkey];
                            toggleMark(editor, mark);
                        }
                    }
                    for (const hotkey in HOTKEYS_EMBED) {
                        if (isHotkey(hotkey, event as any)) {
                            event.preventDefault();
                            const embedType = HOTKEYS_EMBED[hotkey];
                            if (embedType === 'video' && editor?.selection) {
                                const url = getSafeUrl(Editor.string(editor, editor.selection))
                                if (url !== 'about:blank') {
                                    insertVideo(editor, url);
                                } 
                            }
                                
                        }
                    }
                }}
            />
        </Slate>
    );
}
