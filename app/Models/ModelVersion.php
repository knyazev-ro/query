<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ModelVersion extends Model
{
    protected $fillable = [
        'img_compress_model_id',
        'parent_version_id', // nullable (from what version get datasets)
        'version_number', // not null
        'image_resolution', // 64 128 256 512
        'status', // in queue/training/ready/cancel/error,
        'author_id',
        'errors' // long text TEXT
    ];

    protected $casts = [
        'img_compress_model_id' => 'integer',
        'parent_version_id' => 'integer',
        'version_number' => 'integer',
        'image_resolution' => 'integer',
        'author_id' => 'integer',
    ];

    public function model(): BelongsTo
    {
        return $this->belongsTo(ImgCompressModel::class, 'img_compress_model_id');
    }

    public function parentVersion(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_version_id');
    }

    public function childVersions(): HasMany
    {
        return $this->hasMany(self::class, 'parent_version_id');
    }

    public function datasets(): BelongsToMany
    {
        return $this->belongsToMany(Dataset::class, 'version_datasets')
            ->using(VersionDataset::class)
            ->withTimestamps();
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
