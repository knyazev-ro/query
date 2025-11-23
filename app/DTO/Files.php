<?php

namespace App\DTO;

use Illuminate\Http\UploadedFile;

class Files
{
    public ?int $id;
    public ?string $path;
    public ?UploadedFile $file;
    public bool $toDelete = false;
}
