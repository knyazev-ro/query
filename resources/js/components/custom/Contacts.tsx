import { PhoneIcon } from '@heroicons/react/16/solid';

export default function Contacts({ contacts }) {
    return (
        <div className="flex flex-col rounded-xs border border-[#acbfa4] p-1">
            <div className="font-semibold">Контакты</div>
            <div className="flex w-full flex-col gap-2">
                {contacts.map((contact) => {
                    return (
                        <div className="flex gap-2 p-2">
                            <div className="flex h-7 min-h-7 w-7 min-w-7 items-center justify-center rounded-sm bg-[#ff1b1c]">
                                <PhoneIcon className="w-5 text-[#fcfff3]" />
                            </div>
                            <div className="flex w-full flex-col gap-2">
                                <span className="flex justify-between gap-1 font-medium">
                                    {`ФИО: `}
                                    <span className="font-normal">
                                        {`${contact.first_name} ${contact.last_name}`}
                                    </span>
                                </span>
                                <span className="flex justify-between gap-1 bg-[#acbfa4]/20 font-medium">
                                    {`Должность: `}
                                    <span className="font-normal">
                                        {`${contact.position}`}
                                    </span>
                                </span>
                                {contact?.phones?.map((phone, idx) => (
                                    <span
                                        className={`flex justify-between gap-1 font-medium ${idx % 2 !== 0 ? 'bg-[#acbfa4]/20' : ''}`}
                                    >
                                        {`Номер ${idx + 1} (${phone.type_label}): `}
                                        <span className="font-normal">
                                            {`${phone.phone}`}
                                        </span>
                                    </span>
                                )) ?? null}
                                {contact?.emails?.map((email, idx) => (
                                    <span
                                        className={`flex justify-between gap-1 font-medium ${idx % 2 !== 0 ? 'bg-[#acbfa4]/20' : ''}`}
                                    >
                                        {`Почта ${idx + 1}: `}
                                        <span className="font-normal">
                                            {`${email.email}`}
                                        </span>
                                    </span>
                                )) ?? null}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
