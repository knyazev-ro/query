<?php

namespace App\DTO;

class CommentaryDTO
{
    /** @param  Files[] $files */
    public function __construct(
        public int $entityId,
        public string $entityType,
        public array $content,
        public ?int $masterId = null,
        public ?string $masterType = null,
        public ?CommentaryMarkedNotify $markedNotify = null,
        public ?array $files = null,
    ) {}
}
