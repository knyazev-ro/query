<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class ImgBenchmarkRun extends Model
{
    protected $fillable = [
        'img_benchmark_id',
        'model_version_id',
        'position',
        'status',
        'summary',
        'errors',
        'started_at',
        'finished_at',
    ];

    protected $casts = [
        'img_benchmark_id' => 'integer',
        'model_version_id' => 'integer',
        'position' => 'integer',
        'summary' => 'array',
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
    ];

    public function benchmark(): BelongsTo
    {
        return $this->belongsTo(ImgBenchmark::class, 'img_benchmark_id');
    }

    public function modelVersion(): BelongsTo
    {
        return $this->belongsTo(ModelVersion::class);
    }

    public function images(): MorphMany
    {
        return $this->morphMany(ImgMedia::class, 'entity');
    }
}
