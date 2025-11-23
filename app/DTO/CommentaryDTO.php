<?php

namespace App\DTO;

class CommentaryDTO
{
    public function __construct(
        public int $entityId,
        public string $entityType,
        public string $content,
        public ?int $masterId = null,
        public ?string $masterType = null,
        public ?CommentaryMarkedNotify $markedNotify = null,
        public ?Files $files = null,
    ) {}
}
