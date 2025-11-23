<?php

namespace App\DTO;

class NotifyMarkedOne {
    public string $type;
    public ?int $entityId;
}

class CommentaryMarkedNotify
{
    /** @var NotifyMarkedOne[] */
    public array $marked;
}
