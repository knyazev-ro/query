import { PhoneIcon } from '@heroicons/react/16/solid';

export default function Contacts({ contacts }) {
    return (
        <div className="flex flex-col gap-3">

            {/* HEADER */}
            <div className="text-sm font-semibold text-white  border-white/10 pb-2">
                Контакты
            </div>

            {/* LIST */}
            <div className="flex flex-col gap-3">

                {contacts.map((contact, i) => (
                    <div
                        key={i}
                        className="rounded-xl border border-white/10 bg-[#1c1c1c] p-3 transition hover:bg-white/5"
                    >

                        {/* CONTACT HEADER */}
                        <div className="flex items-center gap-3 mb-3">

                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                                <PhoneIcon className="w-4 text-white/70" />
                            </div>

                            <div className="text-sm font-medium text-white">
                                {contact.first_name} {contact.last_name}
                            </div>
                        </div>

                        {/* POSITION */}
                        <div className="flex justify-between text-xs py-1">
                            <span className="text-gray-500">Должность</span>
                            <span className="text-gray-300">
                                {contact.position || '—'}
                            </span>
                        </div>

                        {/* PHONES */}
                        {contact?.phones?.length > 0 && (
                            <div className="mt-2 flex flex-col gap-1">
                                <div className="text-xs text-gray-500">
                                    Телефоны
                                </div>

                                {contact.phones.map((phone, idx) => (
                                    <div
                                        key={idx}
                                        className="flex justify-between text-sm py-1"
                                    >
                                        <span className="text-gray-400">
                                            {phone.type_label} {idx + 1}
                                        </span>
                                        <span className="text-gray-300">
                                            {phone.phone}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* EMAILS */}
                        {contact?.emails?.length > 0 && (
                            <div className="mt-2 flex flex-col gap-1">
                                <div className="text-xs text-gray-500">
                                    Почты
                                </div>

                                {contact.emails.map((email, idx) => (
                                    <div
                                        key={idx}
                                        className="flex justify-between text-sm py-1"
                                    >
                                        <span className="text-gray-400">
                                            Email {idx + 1}
                                        </span>
                                        <span className="text-blue-400 hover:text-blue-300 truncate">
                                            {email.email}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

            </div>
        </div>
    );
}