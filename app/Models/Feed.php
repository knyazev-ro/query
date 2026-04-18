<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Feed extends Model
{
    /** @use HasFactory<\Database\Factories\FeedFactory> */
    use HasFactory;

    protected $fillable = [
        'resource_id',
        'resource_type',
        'master_id',
        'master_type',
    ];

    public function resource(): MorphTo
    {
        return $this->morphTo();
    }
}
