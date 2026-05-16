// @ts-nocheck
import { useEffect, useMemo, useRef } from 'react';

type QuillDelta = {
    ops: Array<Record<string, unknown>>;
};

const EMPTY_DELTA: QuillDelta = { ops: [{ insert: '\n' }] };

const isQuillDelta = (value: unknown): value is QuillDelta => {
    return !!value && typeof value === 'object' && Array.isArray(value.ops);
};

const slateToText = (nodes: unknown): string => {
    if (!Array.isArray(nodes)) {
        return '';
    }

    return nodes
        .map((node) => {
            if (typeof node?.text === 'string') {
                return node.text;
            }

            if (Array.isArray(node?.children)) {
                return slateToText(node.children);
            }

            return '';
        })
        .filter(Boolean)
        .join('\n');
};

const normalizeDelta = (value: unknown): QuillDelta => {
    if (isQuillDelta(value)) {
        return value;
    }

    if (Array.isArray(value)) {
        const text = slateToText(value).trim();

        return text ? { ops: [{ insert: `${text}\n` }] } : EMPTY_DELTA;
    }

    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            if (isQuillDelta(parsed)) {
                return parsed;
            }
        } catch {
            return value.trim()
                ? { ops: [{ insert: `${value.trim()}\n` }] }
                : EMPTY_DELTA;
        }
    }

    return EMPTY_DELTA;
};

const getSafeUrl = (url: string) => {
    try {
        const parsedUrl = new URL(url);
        if (['http:', 'https:'].includes(parsedUrl.protocol)) {
            return parsedUrl.href;
        }
    } catch {
        return null;
    }

    return null;
};

export default function RichTextEditor({
    value,
    setValue,
    hotKeyOutside,
    setIsEnterOn,
    readOnly = false,
    placeholder = 'Введите комментарий...',
}) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const editorRef = useRef<any | null>(null);
    const lastDeltaRef = useRef('');
    const normalizedValue = useMemo(() => normalizeDelta(value), [value]);

    useEffect(() => {
        if (!containerRef.current || editorRef.current) {
            return;
        }

        let cancelled = false;

        import('quill').then(({ default: Quill }) => {
            if (cancelled || !containerRef.current || editorRef.current) {
                return;
            }

            const editor = new Quill(containerRef.current, {
                theme: 'snow',
                readOnly,
                placeholder,
                modules: {
                    toolbar: false,
                    keyboard: {
                        bindings: {
                            submit: {
                                key: 'Enter',
                                shiftKey: true,
                                handler: () => {
                                    setIsEnterOn?.(editor.getContents());
                                    return false;
                                },
                            },
                        },
                    },
                },
            });

            editor.setContents(normalizedValue);
            lastDeltaRef.current = JSON.stringify(editor.getContents());

            editor.on('text-change', () => {
                const nextValue = editor.getContents();
                lastDeltaRef.current = JSON.stringify(nextValue);
                setValue?.(nextValue);
            });

            editorRef.current = editor;
        });

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) {
            return;
        }

        editor.enable(!readOnly);
    }, [readOnly]);

    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) {
            return;
        }

        const next = normalizeDelta(value);
        const nextSerialized = JSON.stringify(next);

        if (nextSerialized !== lastDeltaRef.current) {
            const selection = editor.getSelection();
            editor.setContents(next);
            lastDeltaRef.current = nextSerialized;
            if (selection && !readOnly) {
                editor.setSelection(selection);
            }
        }
    }, [value, readOnly]);

    useEffect(() => {
        const editor = editorRef.current;
        if (!editor || !hotKeyOutside) {
            return;
        }

        if (hotKeyOutside === 'mod+b') {
            const current = editor.getFormat();
            editor.format('bold', !current.bold);
        }

        if (hotKeyOutside === 'mod+shift+v') {
            const selection = editor.getSelection();
            if (!selection) {
                return;
            }

            const selectedText = editor
                .getText(selection.index, selection.length)
                .trim();
            const safeUrl = getSafeUrl(selectedText);
            if (safeUrl) {
                editor.deleteText(selection.index, selection.length);
                editor.insertEmbed(selection.index, 'video', safeUrl);
                editor.insertText(selection.index + 1, '\n');
            }
        }
    }, [hotKeyOutside]);

    return (
        <div
            className={`quill-commentary w-full ${readOnly ? 'quill-commentary-readonly' : ''}`}
        >
            <div ref={containerRef} />
        </div>
    );
}
