export type Author = {
    id: number;
    name: string;
};

export type Dataset = {
    id: number;
    name: string;
    image_resolution: number;
    images_count: number;
    train_split?: number;
    test_split?: number;
    profile?: DatasetProfile | null;
};

export type DatasetProfile = {
    images_count?: number;
    supported_files_count?: number;
    broken_files_count?: number;
    empty_directories_count?: number;
    min_width?: number | null;
    min_height?: number | null;
    max_width?: number | null;
    max_height?: number | null;
    avg_width?: number | null;
    avg_height?: number | null;
    format_counts?: Record<string, number>;
    size_buckets?: Record<string, number>;
    resolutions?: string[];
};

export type TrainingProgress = {
    percent?: number;
    current_epoch?: number;
    total_epochs?: number;
    current_step?: number;
    total_steps?: number;
    completed_steps?: number;
    remaining_steps?: number;
    total_iterations?: number;
    losses?: Record<string, number> | null;
    quality_metrics?: QualityMetrics | null;
    message?: string | null;
    updated_at?: string | null;
};

export type QualityMetrics = {
    mse?: number | null;
    psnr?: number | null;
    ssim?: number | null;
    samples?: number | null;
};

export type CompressionStats = {
    images_count: number;
    compressed_count: number;
    original_size?: number | null;
    compressed_size?: number | null;
    compression_ratio?: number | null;
    saved_percent?: number | null;
    avg_psnr?: number | null;
    avg_ssim?: number | null;
    avg_mse?: number | null;
};

export type TrainingReport = {
    status?: string;
    started_at?: string | null;
    finished_at?: string | null;
    duration_seconds?: number | null;
    parameters?: Record<string, unknown> | null;
    datasets?: Array<Dataset & { profile?: DatasetProfile | null }>;
    ml_service?: Record<string, unknown> | null;
    loss_history?: Array<{
        at?: string | null;
        percent?: number | null;
        epoch?: number | null;
        step?: number | null;
        losses?: Record<string, number>;
    }>;
    latest_progress?: TrainingProgress | null;
    quality_metrics?: QualityMetrics | null;
    errors?: string | null;
};

export type ModelVersion = {
    id: number;
    img_compress_model_id: number;
    parent_version_id: number | null;
    version_number: number;
    image_resolution: number;
    status: 'queue' | 'run' | 'ready' | 'cancel' | 'error';
    errors?: string | null;
    progress?: TrainingProgress | null;
    quality_metrics?: QualityMetrics | null;
    training_started_at?: string | null;
    training_finished_at?: string | null;
    training_report?: TrainingReport | null;
    compression_stats?: CompressionStats | null;
    author?: Author | null;
    parent_version?: ModelVersion | null;
    datasets: Dataset[];
};

export type ImgCompressModel = {
    id: number;
    name: string;
    description?: string | null;
    author?: Author | null;
    versions_count?: number;
    latest_version?: ModelVersion | null;
    versions?: ModelVersion[];
};

export type PaginatedModels = {
    data: ImgCompressModel[];
    total: number;
};
