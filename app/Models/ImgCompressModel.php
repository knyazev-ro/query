<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ImgCompressModel extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'author_id',
    ];

    protected $casts = [
        'author_id' => 'integer',
    ];

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function versions(): HasMany
    {
        return $this->hasMany(ModelVersion::class);
    }

    public function latestVersion(): HasOne
    {
        return $this->versions()->latestOfMany();
    }
}
