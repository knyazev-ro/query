<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImgMedia extends Model
{
    protected $fillable = [
        'img_path',
        'compressed_img_path', //nullable
        'original_name',
        'mime_type',
        'original_size',
        'compressed_size', // nullable
        'author_id',
        
        // morph
        'entity_id',
        'entity_type',
    ];

    public function author(): BelongsTo {
        return $this->belongsTo(User::class, 'author_id');
    }
}
