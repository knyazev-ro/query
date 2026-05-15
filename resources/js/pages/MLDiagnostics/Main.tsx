import Layout from '@/components/custom/Layout';
import { router } from '@inertiajs/react';
import {
    AlertTriangleIcon,
    CpuIcon,
    HardDriveIcon,
    RefreshCwIcon,
    ZapIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

type Diagnostics = {
    available: boolean;
    health?: MLHealth | null;
    health_error?: string | null;
    laravel_storage: StorageStatus;
    latest_training_errors: TrainingError[];
    latest_compression_errors: CompressionError[];
    checked_at: string;
};

type MLHealth = {
    status?: string;
    service?: string;
    version?: string;
    device?: string;
    torch_version?: string | null;
    active_train_jobs?: number;
    active_compression_jobs?: number;
    active_train_job_ids?: number[];
    active_compression_job_ids?: number[];
    storage_root?: string | null;
    storage_writable?: boolean | null;
    recent_errors?: Array<{
        job_type?: string;
        model_version_id?: number;
        image_id?: number | null;
        message?: string;
        occurred_at?: string;
    }>;
};

type StorageStatus = {
    disk: string;
    root: string;
    private_root: string;
    root_exists: boolean;
    root_writable: boolean;
    private_root_exists: boolean;
    private_root_writable: boolean;
};

type TrainingError = {
    id: number;
    version_number: number;
    status: string;
    errors?: string | null;
    updated_at?: string | null;
    model?: { id: number; name: string } | null;
};

type CompressionError = {
    id: number;
    model_version_id?: number | null;
    original_name: string;
    status: string;
    errors?: string | null;
    updated_at?: string | null;
    model_version?: {
        version_number: number;
        model?: { id: number; name: string } | null;
    } | null;
};

const okClass = 'bg-emerald-500/10 text-emerald-300';
const warnClass = 'bg-amber-500/10 text-amber-300';
const badClass = 'bg-[#ff1b1c]/10 text-[#ff6b6c]';

function boolStatus(value?: boolean | null) {
    if (value === true) {
        return ['ok', okClass];
    }

    if (value === false) {
        return ['fail', badClass];
    }

    return ['unknown', warnClass];
}

function shortError(message?: string | null) {
    return (message ?? '').replace(/\s+/g, ' ').trim().slice(0, 900);
}

export default function Main({ diagnostics }: { diagnostics: Diagnostics }) {
    const health = diagnostics.health;
    const hasActiveJobs =
        (health?.active_train_jobs ?? 0) > 0 ||
        (health?.active_compression_jobs ?? 0) > 0;

    useEffect(() => {
        if (!hasActiveJobs) {
            return;
        }

        const interval = window.setInterval(() => {
            router.reload({ only: ['diagnostics'] });
        }, 5000);

        return () => window.clearInterval(interval);
    }, [hasActiveJobs]);

    return (
        <Layout>
            <div className="min-h-screen bg-[#0f0f0f] p-6 text-white">
                <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-sm font-semibold text-gray-300">
                            ML diagnostics
                        </h1>
                        <div className="mt-1 text-xs text-gray-500">
                            Checked {new Date(diagnostics.checked_at).toLocaleString()}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            router.reload({ only: ['diagnostics'] })
                        }
                        className="inline-flex h-10 items-center gap-2 rounded border border-white/10 px-3 text-sm font-semibold text-gray-300 transition hover:bg-white/5"
                    >
                        <RefreshCwIcon className="h-4 w-4" />
                        Refresh
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <StatusTile
                                icon={<ZapIcon className="h-5 w-5" />}
                                label="ML API"
                                value={diagnostics.available ? 'available' : 'offline'}
                                tone={diagnostics.available ? okClass : badClass}
                            />
                            <StatusTile
                                icon={<CpuIcon className="h-5 w-5" />}
                                label="device"
                                value={health?.device ?? '-'}
                                tone={health?.device === 'cuda' ? okClass : warnClass}
                            />
                            <StatusTile
                                icon={<CpuIcon className="h-5 w-5" />}
                                label="torch"
                                value={health?.torch_version ?? '-'}
                                tone={health?.torch_version ? okClass : warnClass}
                            />
                            <StatusTile
                                icon={<HardDriveIcon className="h-5 w-5" />}
                                label="ML storage"
                                value={boolStatus(health?.storage_writable)[0]}
                                tone={boolStatus(health?.storage_writable)[1]}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                            <Panel title="Active jobs">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <Metric label="training" value={`${health?.active_train_jobs ?? 0}`} />
                                    <Metric label="compression" value={`${health?.active_compression_jobs ?? 0}`} />
                                </div>
                                <JobIds
                                    label="training ids"
                                    ids={health?.active_train_job_ids}
                                />
                                <JobIds
                                    label="compression ids"
                                    ids={health?.active_compression_job_ids}
                                />
                            </Panel>

                            <Panel title="Storage">
                                <StorageRow
                                    label="Laravel disk"
                                    value={diagnostics.laravel_storage.disk}
                                    ok
                                />
                                <StorageRow
                                    label="Laravel root"
                                    value={diagnostics.laravel_storage.root}
                                    ok={
                                        diagnostics.laravel_storage.root_exists &&
                                        diagnostics.laravel_storage.root_writable
                                    }
                                />
                                <StorageRow
                                    label="Private root"
                                    value={diagnostics.laravel_storage.private_root}
                                    ok={
                                        diagnostics.laravel_storage
                                            .private_root_exists &&
                                        diagnostics.laravel_storage
                                            .private_root_writable
                                    }
                                />
                                <StorageRow
                                    label="ML root"
                                    value={health?.storage_root ?? '-'}
                                    ok={health?.storage_writable === true}
                                />
                            </Panel>
                        </div>

                        {diagnostics.health_error && (
                            <div className="rounded border border-[#ff1b1c]/25 bg-[#ff1b1c]/10 p-4">
                                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-[#ff8b8c]">
                                    <AlertTriangleIcon className="h-4 w-4" />
                                    ML connection error
                                </div>
                                <pre className="max-h-52 whitespace-pre-wrap break-words font-mono text-xs leading-5 text-[#ff6b6c]">
                                    {shortError(diagnostics.health_error)}
                                </pre>
                            </div>
                        )}
                    </div>

                    <div className="space-y-5">
                        <ErrorPanel
                            title="ML recent errors"
                            empty="No recent ML service errors"
                            items={(health?.recent_errors ?? []).map((error) => ({
                                id: `${error.job_type}-${error.model_version_id}-${error.image_id ?? 'model'}-${error.occurred_at}`,
                                title: `${error.job_type ?? 'job'} · model v#${error.model_version_id ?? '-'}`,
                                subtitle: error.image_id ? `image #${error.image_id}` : error.occurred_at,
                                message: error.message,
                            }))}
                        />

                        <ErrorPanel
                            title="Training errors"
                            empty="No saved training errors"
                            items={diagnostics.latest_training_errors.map((error) => ({
                                id: `train-${error.id}`,
                                title: `${error.model?.name ?? 'model'} · v${error.version_number}`,
                                subtitle: error.status,
                                message: error.errors,
                            }))}
                        />

                        <ErrorPanel
                            title="Compression errors"
                            empty="No saved compression errors"
                            items={diagnostics.latest_compression_errors.map((error) => ({
                                id: `compression-${error.id}`,
                                title: error.original_name,
                                subtitle: `${error.model_version?.model?.name ?? 'model'} · v${error.model_version?.version_number ?? '-'}`,
                                message: error.errors,
                            }))}
                        />
                    </div>
                </div>
            </div>
        </Layout>
    );
}

function StatusTile({
    icon,
    label,
    value,
    tone,
}: {
    icon: ReactNode;
    label: string;
    value: string;
    tone: string;
}) {
    return (
        <div className="rounded border border-white/10 bg-[#141414] p-4">
            <div className="mb-3 flex items-center justify-between gap-3 text-gray-500">
                {icon}
                <span className="text-[10px] uppercase">{label}</span>
            </div>
            <div className={`truncate rounded px-2 py-1 text-sm ${tone}`}>
                {value}
            </div>
        </div>
    );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="rounded border border-white/10 bg-[#141414] p-4">
            <div className="mb-3 text-xs font-medium text-gray-400">
                {title}
            </div>
            {children}
        </div>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded bg-white/5 p-3">
            <div className="text-xs text-gray-500">{label}</div>
            <div className="mt-1 text-lg font-semibold text-gray-200">
                {value}
            </div>
        </div>
    );
}

function JobIds({ label, ids }: { label: string; ids?: number[] }) {
    return (
        <div className="mt-3">
            <div className="mb-1 text-xs text-gray-500">{label}</div>
            <div className="flex flex-wrap gap-1">
                {(ids ?? []).length > 0 ? (
                    ids?.map((id) => (
                        <span
                            key={id}
                            className="rounded bg-white/5 px-2 py-0.5 text-xs text-gray-300"
                        >
                            #{id}
                        </span>
                    ))
                ) : (
                    <span className="text-xs text-gray-600">none</span>
                )}
            </div>
        </div>
    );
}

function StorageRow({
    label,
    value,
    ok,
}: {
    label: string;
    value: string;
    ok: boolean;
}) {
    return (
        <div className="mb-3 last:mb-0">
            <div className="mb-1 flex items-center justify-between gap-3">
                <span className="text-xs text-gray-500">{label}</span>
                <span
                    className={`rounded px-2 py-0.5 text-[10px] ${
                        ok ? okClass : badClass
                    }`}
                >
                    {ok ? 'ok' : 'fail'}
                </span>
            </div>
            <div className="truncate rounded bg-white/5 px-2 py-1 font-mono text-[11px] text-gray-400">
                {value}
            </div>
        </div>
    );
}

function ErrorPanel({
    title,
    empty,
    items,
}: {
    title: string;
    empty: string;
    items: Array<{
        id: string;
        title: string;
        subtitle?: string | null;
        message?: string | null;
    }>;
}) {
    return (
        <div className="rounded border border-white/10 bg-[#141414] p-4">
            <div className="mb-3 text-xs font-medium text-gray-400">
                {title}
            </div>
            {items.length === 0 ? (
                <div className="rounded border border-dashed border-white/10 p-4 text-sm text-gray-600">
                    {empty}
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="rounded border border-[#ff1b1c]/20 bg-[#ff1b1c]/10 p-3"
                        >
                            <div className="mb-1 flex items-center justify-between gap-3">
                                <div className="truncate text-sm text-[#ffb4b4]">
                                    {item.title}
                                </div>
                                {item.subtitle && (
                                    <div className="shrink-0 text-[10px] text-[#ff8b8c]">
                                        {item.subtitle}
                                    </div>
                                )}
                            </div>
                            <div className="line-clamp-4 break-words text-xs leading-5 text-[#ff6b6c]">
                                {shortError(item.message)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
