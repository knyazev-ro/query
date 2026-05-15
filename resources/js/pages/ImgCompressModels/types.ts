export type Author = {
    id: number;
    name: string;
};

export type Dataset = {
    id: number;
    name: string;
    image_resolution: number;
    images_count: number;
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
