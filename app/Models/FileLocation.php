<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class FileLocation extends Model
{
    protected $fillable = [
        "entity_type",
        "entity_id",
        "author_id",
        "name",
        "path",
        "ext",
    ];

    public function entity(): MorphTo
    {
        return $this->morphTo();
    }
}
