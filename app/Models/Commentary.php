<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Commentary extends Model
{
    /** @use HasFactory<\Database\Factories\CommentaryFactory> */
    use HasFactory;

    protected $fillable = [
        'entity_id',
        'entity_type',
        'master_id',
        'master_type',        
    ];
}
