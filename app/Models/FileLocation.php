<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class FileLocation extends Model
{
    protected $fillable = [
        "entity_id",
        "entity_type",
        "path",
    ];

    public function entity(): MorphTo
    {
        return $this->morphTo();
    }
}
