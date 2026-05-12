<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Dataset extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'author_id',
        'file_path',
        'original_filename',
        'file_size',
        'mime_type',
        'rotation_degree',
        'do_flip',
        'image_resolution',
        'train_split',
        'test_split',
        'images_count',
        'uses_count',
    ];

    protected $casts = [
        'author_id' => 'integer',
        'file_size' => 'integer',
        'rotation_degree' => 'integer',
        'do_flip' => 'boolean',
        'image_resolution' => 'integer',
        'train_split' => 'integer',
        'test_split' => 'integer',
        'images_count' => 'integer',
        'uses_count' => 'integer',
    ];

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function modelVersions(): BelongsToMany
    {
        return $this->belongsToMany(ModelVersion::class, 'version_datasets')
            ->using(VersionDataset::class)
            ->withTimestamps();
    }
}
