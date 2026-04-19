import { useState } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/16/solid";
import Layout from "@/components/custom/Layout";

export default function Main() {
    const chatsMock = [
        {
            id: 1,
            name: "ML Team",
            lastMessage: "Модель обучена ✅",
            time: "12:45",
            unread: 2,
        },
        {
            id: 2,
            name: "Backend",
            lastMessage: "API готово",
            time: "11:20",
            unread: 0,
        },
        {
            id: 3,
            name: "Data Engineers",
            lastMessage: "Залили новый датасет",
            time: "Вчера",
            unread: 5,
        },
    ];

    const messagesMock = {
        1: [
            { id: 1, text: "Запустили обучение?", mine: false },
            { id: 2, text: "Да, уже закончено", mine: true },
            { id: 3, text: "Модель готова к продакшену 🚀", mine: true },
        ],
        2: [
            { id: 1, text: "Роуты готовы", mine: false },
            { id: 2, text: "Ок, подключаю фронт", mine: true },
        ],
        3: [
            { id: 1, text: "Загрузили 3TB данных", mine: false },
        ],
    };

    const [activeChat, setActiveChat] = useState(chatsMock[0]);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState(messagesMock);

    const sendMessage = () => {
        if (!input.trim()) return;

        const newMsg = {
            id: Date.now(),
            text: input,
            mine: true,
        };

        setMessages((prev) => ({
            ...prev,
            [activeChat.id]: [...(prev[activeChat.id] || []), newMsg],
        }));

        setInput("");
    };

    return (
        <Layout>
        <div className="flex h-full bg-[#0f0f0f] text-white">

            {/* LEFT — CHATS */}
            <div className="w-80 border-r border-white/10 flex flex-col">

                <div className="p-4 border-b border-white/10 font-semibold text-sm text-gray-400">
                    Чаты
                </div>

                <div className="flex flex-col overflow-y-auto">

                    {chatsMock.map((chat) => {
                        const isActive = chat.id === activeChat.id;

                        return (
                            <div
                                key={chat.id}
                                onClick={() => setActiveChat(chat)}
                                className={`
                                    flex cursor-pointer flex-col gap-1 px-4 py-3 transition
                                    ${isActive
                                        ? "bg-[#81b64c]/10 border-l-2 border-[#81b64c]"
                                        : "hover:bg-white/5"}
                                `}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">
                                        {chat.name}
                                    </span>

                                    <span className="text-xs text-gray-500">
                                        {chat.time}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400 truncate">
                                        {chat.lastMessage}
                                    </span>

                                    {chat.unread > 0 && (
                                        <div className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#81b64c] px-1 text-[10px] text-black">
                                            {chat.unread}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                </div>
            </div>

            {/* RIGHT — CHAT */}
            <div className="flex flex-1 flex-col">

                {/* HEADER */}
                <div className="flex items-center gap-3 border-b border-white/10 p-4">
                    <div className="h-8 w-8 rounded-full bg-[#81b64c]/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-[#81b64c]">
                            {activeChat.name[0]}
                        </span>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-sm font-semibold">
                            {activeChat.name}
                        </span>
                        <span className="text-xs text-gray-500">
                            online
                        </span>
                    </div>
                </div>

                {/* MESSAGES */}
                <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">

                    {(messages[activeChat.id] || []).map((msg) => (
                        <div
                            key={msg.id}
                            className={`
                                max-w-[60%] rounded-xl px-3 py-2 text-sm
                                ${msg.mine
                                    ? "ml-auto bg-[#81b64c] text-black"
                                    : "bg-[#1c1c1c] text-white"}
                            `}
                        >
                            {msg.text}
                        </div>
                    ))}

                </div>

                {/* INPUT */}
                <div className="border-t border-white/10 p-3 flex gap-2">

                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        placeholder="Написать сообщение..."
                        className="
                            flex-1 rounded-xl
                            bg-[#1c1c1c]
                            px-3 py-2 text-sm
                            outline-none
                            border border-white/10
                            focus:border-[#81b64c]/50
                        "
                    />

                    <button
                        onClick={sendMessage}
                        className="
                            flex items-center justify-center
                            rounded-xl px-3
                            bg-[#81b64c]
                            text-black
                            transition hover:brightness-110
                        "
                    >
                        <PaperAirplaneIcon className="w-4" />
                    </button>

                </div>
            </div>
        </div>
        </Layout>
    );
}