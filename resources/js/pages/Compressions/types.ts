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
