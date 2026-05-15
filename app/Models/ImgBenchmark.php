<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class ImgBenchmark extends Model
{
    protected $fillable = [
        'author_id',
        'model_version_id',
        'name',
        'status',
        'summary',
        'errors',
    ];

    protected $casts = [
        'author_id' => 'integer',
        'model_version_id' => 'integer',
        'summary' => 'array',
    ];

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function modelVersion(): BelongsTo
    {
        return $this->belongsTo(ModelVersion::class, 'model_version_id');
    }

    public function images(): MorphMany
    {
        return $this->morphMany(ImgMedia::class, 'entity');
    }
}
