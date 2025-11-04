import { DocumentChartBarIcon } from '@heroicons/react/16/solid';
import Contacts from './Contacts';

export default function ClientCompanyCard({ client }) {
    const entity = client.entity;
    const contacts = client?.contacts ?? [];
    console.log(contacts);
    return (
        <div className="flex w-full flex-col gap-4 text-[#262626]"> 
            <div className="flex flex-col rounded-xs border border-[#acbfa4] p-1">
                <div className="font-semibold">Компания</div>
                <div className="flex w-full flex-col p-2">
                    <div className="flex w-full gap-2">
                        <div className="flex h-7 min-h-7 w-7 min-w-7 items-center justify-center rounded-sm bg-[#ff1b1c]">
                            <DocumentChartBarIcon className="w-5 text-[#fcfff3]" />
                        </div>
                        <div className="flex w-full flex-col">
                            <span className="font-semibold">{`${entity.name}, ${entity.legal_form}`}</span>
                            <span className="flex justify-between bg-[#acbfa4]/20 font-medium">
                                {`Директор: `}
                                <span className="font-normal">
                                    {entity.director_name}
                                </span>
                            </span>
                            <span className="flex justify-between font-medium">
                                {`Сфера: `}
                                <span className="font-normal">
                                    {entity.industry}
                                </span>
                            </span>
                            <span className="flex w-full justify-between bg-[#acbfa4]/20 font-medium">
                                {`Сайт: `}
                                <a
                                    href={entity.website}
                                    target="_blank"
                                    className="w-64 truncate font-normal text-[#81b64c]"
                                >
                                    {entity.website}
                                </a>
                            </span>
                            <span className="flex justify-between font-medium">
                                {`ИНН: `}
                                <span className="font-normal">
                                    {entity.inn}
                                </span>
                            </span>

                            <span className="flex justify-between bg-[#acbfa4]/20 font-medium">
                                {`КПП: `}
                                <span className="font-normal">
                                    {entity.kpp}
                                </span>
                            </span>
                            <span className="flex justify-between font-medium">
                                {`ОГРН: `}
                                <span className="font-normal">
                                    {entity.ogrn}
                                </span>
                            </span>
                            <span className="flex justify-between bg-[#acbfa4]/20 font-medium">
                                {`Источник: `}
                                <span className="font-normal">
                                    {entity.source}
                                </span>
                            </span>
                            <span className="flex justify-between font-medium">
                                {`Примечание: `}
                                <span className="font-normal">
                                    {entity.notes}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <Contacts contacts={contacts} />
        </div>
    );
}
