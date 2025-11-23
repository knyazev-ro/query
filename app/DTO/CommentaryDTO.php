<?php

namespace App\DTO;

class CommentaryDTO
{
    public int $entityId;
    public string $entityType;
    public ?int $masterId;
    public ?string $masterType;
    public string $content;
    public ?CommentaryMarkedNotify $markedNotify;
    public ?Files $files;
}
