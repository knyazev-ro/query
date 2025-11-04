<?php

namespace App\Traits;

use Illuminate\Support\Collection;

trait GetAllCasesTrait
{
    public static function all(): Collection
    {
        return collect(self::cases())->map(fn($e) => ['value' => $e->value, 'label' => $e->label()]);
    }
}
