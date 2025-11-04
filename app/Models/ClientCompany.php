<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClientCompany extends Model
{
    protected $fillable = [
        'name',
        'legal_form',
        'industry',
        'website',
        'inn',
        'kpp',
        'ogrn',
        'director_name',
        'accountant_name',
        'source',
        'notes',
    ];
}
