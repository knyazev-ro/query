<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Commentary extends Model
{
    /** @use HasFactory<\Database\Factories\CommentaryFactory> */
    use HasFactory;

    protected $fillable = [
        'entity_id',
        'entity_type',
        'master_id',
        'master_type',
        'content',   
    ];

    protected $casts = [
        'content' => 'array',
    ];

    public function fileLocations(): MorphMany {
        return $this->morphMany(FileLocation::class, 'entity');
    }
}
