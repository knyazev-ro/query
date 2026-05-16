// @ts-nocheck
import {
    DocumentChartBarIcon,
    PlusIcon,
    TrashIcon,
} from '@heroicons/react/16/solid';

const emptyClient = {
    entity: {},
    contacts: [],
};

const emptyContact = () => ({
    first_name: '',
    last_name: '',
    position: '',
    phones: [],
    emails: [],
});

const emptyPhone = () => ({
    phone: '',
    type: 'work',
});

const emptyEmail = () => ({
    email: '',
});

export default function ClientCompanyCard({ client, onChange, onSave }) {
    const safeClient = client ?? emptyClient;
    const entity = safeClient?.entity ?? {};
    const contacts = safeClient?.contacts ?? [];

    const changeClient = (nextClient, save = false) => {
        onChange?.(nextClient);

        if (save) {
            onSave?.(nextClient);
        }
    };

    const updateEntity = (field, value, save = false) => {
        changeClient(
            {
                ...safeClient,
                entity: {
                    ...entity,
                    [field]: value,
                },
            },
            save,
        );
    };

    const updateContact = (index, patch, save = false) => {
        const nextContacts = contacts.map((contact, contactIndex) =>
            contactIndex === index ? { ...contact, ...patch } : contact,
        );

        changeClient({ ...safeClient, contacts: nextContacts }, save);
    };

    const updatePhone = (contactIndex, phoneIndex, patch, save = false) => {
        const contact = contacts[contactIndex];
        const phones = contact?.phones ?? [];
        const nextPhones = phones.map((phone, index) =>
            index === phoneIndex ? { ...phone, ...patch } : phone,
        );

        updateContact(contactIndex, { phones: nextPhones }, save);
    };

    const updateEmail = (contactIndex, emailIndex, patch, save = false) => {
        const contact = contacts[contactIndex];
        const emails = contact?.emails ?? [];
        const nextEmails = emails.map((email, index) =>
            index === emailIndex ? { ...email, ...patch } : email,
        );

        updateContact(contactIndex, { emails: nextEmails }, save);
    };

    const addContact = () => {
        changeClient({
            ...safeClient,
            contacts: [...contacts, emptyContact()],
        });
    };

    const removeContact = (index) => {
        changeClient(
            {
                ...safeClient,
                contacts: contacts.filter(
                    (_, contactIndex) => contactIndex !== index,
                ),
            },
            true,
        );
    };

    const addPhone = (contactIndex) => {
        const contact = contacts[contactIndex];
        updateContact(contactIndex, {
            phones: [...(contact?.phones ?? []), emptyPhone()],
        });
    };

    const removePhone = (contactIndex, phoneIndex) => {
        const contact = contacts[contactIndex];
        updateContact(
            contactIndex,
            {
                phones: (contact?.phones ?? []).filter(
                    (_, index) => index !== phoneIndex,
                ),
            },
            true,
        );
    };

    const addEmail = (contactIndex) => {
        const contact = contacts[contactIndex];
        updateContact(contactIndex, {
            emails: [...(contact?.emails ?? []), emptyEmail()],
        });
    };

    const removeEmail = (contactIndex, emailIndex) => {
        const contact = contacts[contactIndex];
        updateContact(
            contactIndex,
            {
                emails: (contact?.emails ?? []).filter(
                    (_, index) => index !== emailIndex,
                ),
            },
            true,
        );
    };

    return (
        <div className="flex w-full flex-col gap-4 text-white">
            <div className="p-4">
                <div className="mb-3 flex items-center gap-3 border-b border-white/10 pb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
                        <DocumentChartBarIcon className="w-5 text-white/70" />
                    </div>

                    <div className="flex min-w-0 flex-col">
                        <input
                            value={entity.name ?? ''}
                            onChange={(event) =>
                                updateEntity('name', event.target.value)
                            }
                            onBlur={(event) =>
                                updateEntity('name', event.target.value, true)
                            }
                            placeholder="Company name"
                            className="min-w-0 border-b border-transparent bg-transparent text-sm font-semibold text-white transition outline-none focus:border-white/30"
                        />
                        <div className="text-xs text-gray-500">Company</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    <CompanyInput
                        label="Legal form"
                        value={entity.legal_form}
                        onChange={(value) => updateEntity('legal_form', value)}
                        onSave={(value) =>
                            updateEntity('legal_form', value, true)
                        }
                    />
                    <CompanyInput
                        label="Director"
                        value={entity.director_name}
                        onChange={(value) =>
                            updateEntity('director_name', value)
                        }
                        onSave={(value) =>
                            updateEntity('director_name', value, true)
                        }
                    />
                    <CompanyInput
                        label="Accountant"
                        value={entity.accountant_name}
                        onChange={(value) =>
                            updateEntity('accountant_name', value)
                        }
                        onSave={(value) =>
                            updateEntity('accountant_name', value, true)
                        }
                    />
                    <CompanyInput
                        label="Industry"
                        value={entity.industry}
                        onChange={(value) => updateEntity('industry', value)}
                        onSave={(value) =>
                            updateEntity('industry', value, true)
                        }
                    />
                    <CompanyInput
                        label="Website"
                        value={entity.website}
                        onChange={(value) => updateEntity('website', value)}
                        onSave={(value) => updateEntity('website', value, true)}
                    />
                    <div className="grid grid-cols-3 gap-2">
                        <CompanyInput
                            label="INN"
                            value={entity.inn}
                            onChange={(value) => updateEntity('inn', value)}
                            onSave={(value) => updateEntity('inn', value, true)}
                        />
                        <CompanyInput
                            label="KPP"
                            value={entity.kpp}
                            onChange={(value) => updateEntity('kpp', value)}
                            onSave={(value) => updateEntity('kpp', value, true)}
                        />
                        <CompanyInput
                            label="OGRN"
                            value={entity.ogrn}
                            onChange={(value) => updateEntity('ogrn', value)}
                            onSave={(value) =>
                                updateEntity('ogrn', value, true)
                            }
                        />
                    </div>
                    <CompanyInput
                        label="Source"
                        value={entity.source}
                        onChange={(value) => updateEntity('source', value)}
                        onSave={(value) => updateEntity('source', value, true)}
                    />
                    <CompanyInput
                        label="Notes"
                        value={entity.notes}
                        onChange={(value) => updateEntity('notes', value)}
                        onSave={(value) => updateEntity('notes', value, true)}
                        multiline
                    />
                </div>
            </div>

            <div className="rounded-2xl bg-[#181818] p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-white">
                        Contacts
                    </div>
                    <button
                        type="button"
                        onClick={addContact}
                        className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/15"
                        title="Add contact"
                    >
                        <PlusIcon className="w-4" />
                    </button>
                </div>

                <div className="flex flex-col gap-3">
                    {contacts.map((contact, contactIndex) => (
                        <div
                            key={contact.id ?? `new-${contactIndex}`}
                            className="rounded-xl border border-white/10 bg-[#1c1c1c] p-3"
                        >
                            <div className="mb-3 flex items-start justify-between gap-2">
                                <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
                                    <ContactInput
                                        label="First name"
                                        value={contact.first_name}
                                        onChange={(value) =>
                                            updateContact(contactIndex, {
                                                first_name: value,
                                            })
                                        }
                                        onSave={(value) =>
                                            updateContact(
                                                contactIndex,
                                                { first_name: value },
                                                true,
                                            )
                                        }
                                    />
                                    <ContactInput
                                        label="Last name"
                                        value={contact.last_name}
                                        onChange={(value) =>
                                            updateContact(contactIndex, {
                                                last_name: value,
                                            })
                                        }
                                        onSave={(value) =>
                                            updateContact(
                                                contactIndex,
                                                { last_name: value },
                                                true,
                                            )
                                        }
                                    />
                                    <div className="col-span-2">
                                        <ContactInput
                                            label="Position"
                                            value={contact.position}
                                            onChange={(value) =>
                                                updateContact(contactIndex, {
                                                    position: value,
                                                })
                                            }
                                            onSave={(value) =>
                                                updateContact(
                                                    contactIndex,
                                                    { position: value },
                                                    true,
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeContact(contactIndex)}
                                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-gray-400 transition hover:bg-[#ff1b1c]/10 hover:text-[#ff1b1c]"
                                    title="Remove contact"
                                >
                                    <TrashIcon className="w-4" />
                                </button>
                            </div>

                            <ContactListHeader
                                label="Phones"
                                onAdd={() => addPhone(contactIndex)}
                            />
                            <div className="mb-3 flex flex-col gap-2">
                                {(contact.phones ?? []).map(
                                    (phone, phoneIndex) => (
                                        <div
                                            key={
                                                phone.id ??
                                                `phone-${phoneIndex}`
                                            }
                                            className="grid grid-cols-[1fr_7rem_2rem] gap-2"
                                        >
                                            <ContactInput
                                                label="Phone"
                                                value={phone.phone}
                                                onChange={(value) =>
                                                    updatePhone(
                                                        contactIndex,
                                                        phoneIndex,
                                                        { phone: value },
                                                    )
                                                }
                                                onSave={(value) =>
                                                    updatePhone(
                                                        contactIndex,
                                                        phoneIndex,
                                                        { phone: value },
                                                        true,
                                                    )
                                                }
                                            />
                                            <select
                                                value={phone.type ?? 'work'}
                                                onChange={(event) =>
                                                    updatePhone(
                                                        contactIndex,
                                                        phoneIndex,
                                                        {
                                                            type: event.target
                                                                .value,
                                                        },
                                                        true,
                                                    )
                                                }
                                                className="rounded border border-white/10 bg-white/5 px-2 text-xs text-white outline-none"
                                            >
                                                <option value="work">
                                                    Work
                                                </option>
                                                <option value="personal">
                                                    Personal
                                                </option>
                                                <option value="home">
                                                    Home
                                                </option>
                                            </select>
                                            <IconButton
                                                title="Remove phone"
                                                onClick={() =>
                                                    removePhone(
                                                        contactIndex,
                                                        phoneIndex,
                                                    )
                                                }
                                            />
                                        </div>
                                    ),
                                )}
                            </div>

                            <ContactListHeader
                                label="Emails"
                                onAdd={() => addEmail(contactIndex)}
                            />
                            <div className="flex flex-col gap-2">
                                {(contact.emails ?? []).map(
                                    (email, emailIndex) => (
                                        <div
                                            key={
                                                email.id ??
                                                `email-${emailIndex}`
                                            }
                                            className="grid grid-cols-[1fr_2rem] gap-2"
                                        >
                                            <ContactInput
                                                label="Email"
                                                value={email.email}
                                                onChange={(value) =>
                                                    updateEmail(
                                                        contactIndex,
                                                        emailIndex,
                                                        { email: value },
                                                    )
                                                }
                                                onSave={(value) =>
                                                    updateEmail(
                                                        contactIndex,
                                                        emailIndex,
                                                        { email: value },
                                                        true,
                                                    )
                                                }
                                            />
                                            <IconButton
                                                title="Remove email"
                                                onClick={() =>
                                                    removeEmail(
                                                        contactIndex,
                                                        emailIndex,
                                                    )
                                                }
                                            />
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>
                    ))}

                    {contacts.length === 0 && (
                        <div className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-gray-500">
                            No contacts
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function CompanyInput({ label, value, onChange, onSave, multiline = false }) {
    return (
        <label className="flex min-w-0 flex-col gap-1">
            <span className="text-xs text-gray-500">{label}</span>
            {multiline ? (
                <textarea
                    value={value ?? ''}
                    onChange={(event) => onChange(event.target.value)}
                    onBlur={(event) => onSave(event.target.value)}
                    rows={3}
                    className="min-h-20 resize-y rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 transition outline-none focus:border-white/20 focus:bg-white/10"
                />
            ) : (
                <input
                    value={value ?? ''}
                    onChange={(event) => onChange(event.target.value)}
                    onBlur={(event) => onSave(event.target.value)}
                    className="min-w-0 rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 transition outline-none focus:border-white/20 focus:bg-white/10"
                />
            )}
        </label>
    );
}

function ContactInput({ label, value, onChange, onSave }) {
    return (
        <label className="flex min-w-0 flex-col gap-1">
            <span className="text-[10px] text-gray-500">{label}</span>
            <input
                value={value ?? ''}
                onChange={(event) => onChange(event.target.value)}
                onBlur={(event) => onSave(event.target.value)}
                className="min-w-0 rounded border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-gray-200 transition outline-none focus:border-white/20 focus:bg-white/10"
            />
        </label>
    );
}

function ContactListHeader({ label, onAdd }) {
    return (
        <div className="mb-2 flex items-center justify-between">
            <div className="text-xs text-gray-500">{label}</div>
            <button
                type="button"
                onClick={onAdd}
                className="grid h-6 w-6 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/15"
                title={`Add ${label.toLowerCase()}`}
            >
                <PlusIcon className="w-3.5" />
            </button>
        </div>
    );
}

function IconButton({ title, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="mt-4 grid h-8 w-8 place-items-center rounded-full text-gray-400 transition hover:bg-[#ff1b1c]/10 hover:text-[#ff1b1c]"
            title={title}
        >
            <TrashIcon className="w-4" />
        </button>
    );
}
