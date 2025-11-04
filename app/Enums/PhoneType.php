<?php

namespace App\Enums;

use App\Traits\GetAllCasesTrait;

enum PhoneType: string
{
    use GetAllCasesTrait;

    case WORK = "work";
    case PERSONAL = "personal";
    case HOME = "home";

    public function label(): string
    {
        return match ($this) {
            self::WORK => "Рабочий",
            self::PERSONAL => "Личный",
            self::HOME => "Домашний",
        };
    }
}
