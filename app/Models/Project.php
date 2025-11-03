<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Project extends Model
{
    
        /** @use HasFactory<\Database\Factories\ProjectFactory> */
        use HasFactory, LogsActivity;

    protected $fillable = [
        'name',
        'description',
        'author_id',
        'stage_id',
        'stage_changed_at',
    ];

    public function stage(): BelongsTo
    {
        return $this->belongsTo(Stage::class);
    }

    public function author(): BelongsTo {
        return $this->belongsTo(User::class);
    }

    protected static function booted()
    {
        static::updated(function (Project $project) {
            if ($project->isDirty('stage_id')) {
                ProjectStageDuration::create([
                    'project_id' => $project->id,
                    'stage_id' => $project->getOriginal('stage_id'),
                    'stayed_from' => $project->getOriginal('stage_changed_at') ?? now()->subMinute(),
                    'stayed_to' => now(),
                ]);
            }
        });
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logOnlyDirty();
    }
}
