import type { ImgMedia } from '../Compressions/types';

export type BenchmarkStatus = 'queue' | 'run' | 'ready' | 'error' | 'cancel';

export type BenchmarkMethodSummary = {
    count: number;
    avg_size?: number | null;
    avg_saved_percent?: number | null;
    avg_psnr?: number | null;
    avg_ssim?: number | null;
    avg_mse?: number | null;
};

export type BenchmarkCase = {
    id: number;
    original_name: string;
    original_size: number;
    compressed_size?: number | null;
    saved_percent?: number | null;
    psnr?: number | null;
    ssim?: number | null;
    mse?: number | null;
};

export type BenchmarkSummary = {
    images_count: number;
    completed_count: number;
    active_count: number;
    error_count: number;
    cancel_count: number;
    methods: Record<'ml' | 'jpeg' | 'webp', BenchmarkMethodSummary>;
    best_cases: BenchmarkCase[];
    worst_cases: BenchmarkCase[];
    updated_at?: string;
};

export type BenchmarkModelVersion = {
    id: number;
    version_number: number;
    image_resolution: number;
    status: string;
    model?: {
        id: number;
        name: string;
    } | null;
};

export type ImgBenchmark = {
    id: number;
    name: string;
    status: BenchmarkStatus;
    summary?: BenchmarkSummary | null;
    errors?: string | null;
    model_version?: BenchmarkModelVersion | null;
    images?: ImgMedia[];
    images_count?: number;
    created_at?: string;
    updated_at?: string;
};

export type PaginatedBenchmarks = {
    data: ImgBenchmark[];
    total: number;
};
