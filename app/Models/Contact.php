<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Contact extends Model
{
    /** @use HasFactory<\Database\Factories\ContactFactory> */
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'position',
    ];

    public function emails(): BelongsToMany
    {
        return $this->belongsToMany(Email::class, 'contact_emails');
    }

    public function phones(): BelongsToMany
    {
        return $this->belongsToMany(Phone::class, 'contact_phones');
    }
}
