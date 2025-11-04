<?php

namespace Database\Factories;

use App\Enums\PhoneType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Phone>
 */
class PhoneFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
          'phone' => fake()->phoneNumber(),
          'type' => fake()->randomElement(PhoneType::all()->toArray())['value'],
        ];
    }
}
