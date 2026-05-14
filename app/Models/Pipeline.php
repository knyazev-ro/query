<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pipeline extends Model
{
    /** @use HasFactory<\Database\Factories\PipelineFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'deadline',
    ];

    protected $casts = [
        'deadline' => 'datetime',
    ];

    public function stages(): HasMany
    {
        return $this->hasMany(Stage::class)->orderBy('order');
    }
}
