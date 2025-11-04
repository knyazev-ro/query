<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClientPerson extends Model
{
    protected $table = "client_person";

    protected $fillable = [
        'first_name',
        'last_name',
        'birth_date',
        'passport_number',
        'inn',
    ];
}
