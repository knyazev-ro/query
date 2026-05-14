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

export type ModelVersion = {
    id: number;
    img_compress_model_id: number;
    parent_version_id: number | null;
    version_number: number;
    image_resolution: number;
    status: 'queue' | 'run' | 'ready' | 'cancel' | 'error';
    errors?: string | null;
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
