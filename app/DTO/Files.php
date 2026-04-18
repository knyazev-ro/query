<?php

namespace App\DTO;

use Illuminate\Http\UploadedFile;

class Files
{
    public function __construct(
        public ?bool $toDelete = false,
        public ?UploadedFile $file = null,
        public ?string $path = null,
        public ?int $id = null,
    ) {}
}
