// @ts-nocheck
const normalizeDelta = (content) => {
    if (content?.ops) {
        return content;
    }

    if (typeof content === 'string') {
        try {
            const parsed = JSON.parse(content);
            if (parsed?.ops) {
                return parsed;
            }
        } catch {
            return { ops: [{ insert: content }] };
        }
    }

    if (Array.isArray(content)) {
        return {
            ops: content.flatMap((node) => {
                if (typeof node?.text === 'string') {
                    return [{ insert: node.text }];
                }

                if (Array.isArray(node?.children)) {
                    return node.children.map((child) => ({
                        insert: child?.text ?? '',
                        attributes: {
                            bold: child?.bold,
                            italic: child?.italic,
                            underline: child?.underline,
                            code: child?.code,
                        },
                    }));
                }

                return [];
            }),
        };
    }

    return { ops: [] };
};

const renderText = (text, attributes, key) => {
    const chunks = String(text).split('\n');

    return chunks.map((chunk, index) => {
        let element = chunk || (index < chunks.length - 1 ? null : '');

        if (element) {
            if (attributes?.code) {
                element = <code className="rounded bg-black/30 px-1 py-0.5">{element}</code>;
            }
            if (attributes?.bold) {
                element = <strong>{element}</strong>;
            }
            if (attributes?.italic) {
                element = <em>{element}</em>;
            }
            if (attributes?.underline) {
                element = <u>{element}</u>;
            }
        }

        return (
            <span key={`${key}-${index}`}>
                {element}
                {index < chunks.length - 1 && <br />}
            </span>
        );
    });
};

export default function QuillDeltaView({ content }) {
    const delta = normalizeDelta(content);
    const rendered = delta.ops.flatMap((op, index) => {
        if (typeof op.insert === 'string') {
            return renderText(op.insert, op.attributes, index);
        }

        if (op.insert?.image) {
            return (
                <img
                    key={index}
                    src={op.insert.image}
                    className="my-2 max-h-80 max-w-full rounded-md object-contain"
                />
            );
        }

        if (op.insert?.video) {
            return (
                <iframe
                    key={index}
                    src={op.insert.video}
                    className="my-2 aspect-video w-full rounded-md"
                    allowFullScreen
                />
            );
        }

        return null;
    });

    if (!rendered.length) {
        return <div className="text-gray-500">Комментарий пуст</div>;
    }

    return <div className="whitespace-pre-wrap break-words text-gray-100">{rendered}</div>;
}
