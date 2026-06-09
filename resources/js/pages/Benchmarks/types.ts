import type {
    ImgMedia,
    ModelVersion,
    QualityMetrics,
} from '../Compressions/types';

export type BenchmarkStatus =
    | 'pending'
    | 'queue'
    | 'run'
    | 'ready'
    | 'error'
    | 'cancel';

export type BenchmarkMethodMetrics = {
    size?: number | null;
    saved_percent?: number | null;
    psnr?: number | null;
    ssim?: number | null;
    mse?: number | null;
    quality?: number | null;
};

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

export type BenchmarkRunSummary = {
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

export type BenchmarkImage = ImgMedia & {
    benchmark_methods?: Record<
        'ml' | 'jpeg' | 'webp',
        BenchmarkMethodMetrics | null
    >;
    quality_metrics?: QualityMetrics | null;
};

export type BenchmarkRun = {
    id: number;
    position: number;
    status: BenchmarkStatus;
    summary?: BenchmarkRunSummary | null;
    errors?: string | null;
    started_at?: string | null;
    finished_at?: string | null;
    model_version?: ModelVersion | null;
    images: BenchmarkImage[];
};

export type BenchmarkSummaryRun = {
    id: number;
    position: number;
    status: BenchmarkStatus;
    model_version_id?: number | null;
    model_name?: string | null;
    version_number?: number | null;
    image_resolution?: number | null;
    summary?: BenchmarkRunSummary | null;
    errors?: string | null;
};

export type BenchmarkSummary = {
    models_count: number;
    completed_models_count: number;
    images_count: number;
    comparisons_count: number;
    runs: BenchmarkSummaryRun[];
    updated_at?: string;
};

export type ImgBenchmark = {
    id: number;
    name: string;
    status: BenchmarkStatus;
    summary?: BenchmarkSummary | null;
    errors?: string | null;
    runs: BenchmarkRun[];
    created_at?: string;
    updated_at?: string;
};

export type PaginatedBenchmarks = {
    data: ImgBenchmark[];
    total: number;
};
