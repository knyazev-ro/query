import { DocumentChartBarIcon } from '@heroicons/react/16/solid';
import Contacts from './Contacts';

export default function ClientCompanyCard({ client }) {
    const entity = client.entity;
    const contacts = client?.contacts ?? [];

    const Row = ({ label, value, highlight = false }) => (
        <div className="flex items-start justify-between gap-3 py-1">
            <span className="text-xs text-gray-500">{label}</span>
            <span
                className={`text-sm text-right ${
                    highlight ? 'text-white' : 'text-gray-300'
                }`}
            >
                {value || '—'}
            </span>
        </div>
    );

    return (
        <div className="flex w-full flex-col gap-4 text-white">

            {/* CARD */}
            <div className="p-4">

                {/* HEADER */}
                <div className="flex items-center gap-3 border-b border-white/10 pb-3 mb-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
                        <DocumentChartBarIcon className="w-5 text-white/70" />
                    </div>

                    <div className="flex flex-col">
                        <div className="text-sm font-semibold text-white">
                            {entity.name}, {entity.legal_form}
                        </div>
                        <div className="text-xs text-gray-500">
                            Компания
                        </div>
                    </div>
                </div>

                {/* BODY */}
                <div className="flex flex-col gap-1">

                    <Row label="Директор" value={entity.director_name} />
                    <Row label="Сфера" value={entity.industry} />

                    <Row
                        label="Сайт"
                        value={
                            entity.website ? (
                                <a
                                    href={entity.website}
                                    target="_blank"
                                    className="text-sm text-blue-400 hover:text-blue-300"
                                >
                                    {entity.website}
                                </a>
                            ) : null
                        }
                    />

                    <Row label="ИНН" value={entity.inn} />
                    <Row label="КПП" value={entity.kpp} />
                    <Row label="ОГРН" value={entity.ogrn} />

                    <Row label="Источник" value={entity.source} />
                    <Row label="Примечание" value={entity.notes} />
                </div>
            </div>

            {/* CONTACTS */}
            <div className="rounded-2xl bg-[#181818] p-4">
                <Contacts contacts={contacts} />
            </div>

        </div>
    );
}