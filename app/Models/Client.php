<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Client extends Model
{
    /** @use HasFactory<\Database\Factories\ClientFactory> */
    use HasFactory;

    protected $fillable = [
        'entity_id',
        'entity_type',
    ];

    public function entity(): MorphTo
    {
        return $this->morphTo();
    }

    public function contacts(): BelongsToMany 
    {
        return $this->belongsToMany(Contact::class, 'client_contacts');
    }
}
