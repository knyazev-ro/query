<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class MLAuditEvent extends Model
{
    protected $fillable = [
        'author_id',
        'model_version_id',
        'img_media_id',
        'event_type',
        'severity',
        'entity_id',
        'entity_type',
        'status',
        'job_id',
        'message',
        'context',
        'occurred_at',
    ];

    protected $casts = [
        'author_id' => 'integer',
        'model_version_id' => 'integer',
        'img_media_id' => 'integer',
        'context' => 'array',
        'occurred_at' => 'datetime',
    ];

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function modelVersion(): BelongsTo
    {
        return $this->belongsTo(ModelVersion::class, 'model_version_id');
    }

    public function imgMedia(): BelongsTo
    {
        return $this->belongsTo(ImgMedia::class, 'img_media_id');
    }

    public function entity(): MorphTo
    {
        return $this->morphTo();
    }
}
