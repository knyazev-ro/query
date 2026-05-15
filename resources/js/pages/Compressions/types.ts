export type Author = {
    id: number;
    name: string;
};

export type ImgCompressModel = {
    id: number;
    name: string;
    description?: string | null;
};

export type ModelVersion = {
    id: number;
    img_compress_model_id: number;
    parent_version_id: number | null;
    version_number: number;
    image_resolution: number;
    status: 'queue' | 'run' | 'ready' | 'cancel' | 'error';
    errors?: string | null;
    model?: ImgCompressModel | null;
};

export type QualityMetrics = {
    mse?: number | null;
    psnr?: number | null;
    ssim?: number | null;
    samples?: number | null;
    baselines?: {
        comparison_resolution?: number;
        jpeg?: BaselineMetrics;
        webp?: BaselineMetrics;
    };
    baseline_error?: string | null;
    baseline_note?: string | null;
    baseline_target_size?: number | null;
    heatmap?: {
        path?: string;
        resolution?: number;
        mean_error?: number;
        max_error?: number;
    };
};

export type BaselineMetrics = {
    format: 'jpeg' | 'webp';
    quality: number;
    size: number;
    target_size?: number | null;
    target_distance?: number | null;
    target_distance_percent?: number | null;
    mse?: number | null;
    psnr?: number | null;
    ssim?: number | null;
    samples?: number | null;
};

export type ImgMediaStatus =
    | 'just created'
    | 'compressing'
    | 'compressed'
    | 'error'
    | 'cancel';

export type ImgMedia = {
    id: number;
    img_path?: string | null;
    compressed_img_path?: string | null;
    original_name: string;
    mime_type: string;
    original_size: number;
    compressed_size?: number | null;
    author_id: number;
    model_version_id?: number | null;
    errors?: string | null;
    status: ImgMediaStatus;
    quality_metrics?: QualityMetrics | null;
    created_at?: string;
    updated_at?: string;
    author?: Author | null;
    model_version?: ModelVersion | null;
};

export type PaginatedImgMedia = {
    data: ImgMedia[];
    total: number;
};
