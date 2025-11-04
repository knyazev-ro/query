<?php

namespace App\Models;

use App\Enums\PhoneType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Phone extends Model
{
    use  HasFactory;

    protected $fillable = [
        'phone',
        'type',
    ];

    protected $casts = [
        'type' => PhoneType::class,
    ];

    protected $appends = [
        'type_label',
    ];

    public function getTypeLabelAttribute() {
        return $this->type->label();
    }
}
