<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Stage extends Model
{
    /** @use HasFactory<\Database\Factories\StageFactory> */
    use HasFactory;
    protected $fillable = [
        'name',
        'pipeline_id',
        'order',
    ];

    public function projects(): HasMany {
        return $this->hasMany(Project::class);
    }

    public function pipeline(): BelongsTo {
        return $this->belongsTo(Pipeline::class);
    }
}
