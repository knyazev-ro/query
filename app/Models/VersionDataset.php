<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

class VersionDataset extends Pivot
{
    protected $table = 'version_datasets';

    public $incrementing = true;

    protected $fillable = [
        'model_version_id',
        'dataset_id',
    ];

    protected $casts = [
        'model_version_id' => 'integer',
        'dataset_id' => 'integer',
    ];

    public function version(): BelongsTo
    {
        return $this->belongsTo(ModelVersion::class, 'model_version_id');
    }

    public function dataset(): BelongsTo
    {
        return $this->belongsTo(Dataset::class);
    }
}
