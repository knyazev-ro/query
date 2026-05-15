<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ImgMedia extends Model
{
    protected $fillable = [
        'img_path', // nullable
        'compressed_img_path', //nullable
        'original_name',
        'mime_type',
        'original_size',
        'compressed_size', // nullable
        'author_id',
        'model_version_id',
        
        // morph
        'entity_id',
        'entity_type',
        'errors',
        'status',
        'quality_metrics',
    ];

    protected $casts = [
        'original_size' => 'integer',
        'compressed_size' => 'integer',
        'author_id' => 'integer',
        'model_version_id' => 'integer',
        'quality_metrics' => 'array',
    ];

    public function author(): BelongsTo {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function modelVersion(): BelongsTo {
        return $this->belongsTo(ModelVersion::class, 'model_version_id');
    }

    public function saveImg(UploadedFile $uploadedFile) {
        $path = Storage::putFile("img-media/{$this->id}", $uploadedFile);
        $this->img_path = $path;
        $this->original_name = $uploadedFile->getClientOriginalName();
        $this->mime_type = $uploadedFile->getMimeType();
        $this->original_size = ($uploadedFile->getSize() ?? 0);
        //etc...
        $this->save();
    }

    public function entity() {
        return $this->morphTo();
    }
}
