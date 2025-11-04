<?php

namespace Database\Seeders;

use App\Models\Contact;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::firstOrCreate(
            ['email' => 'test@aa.com'],
            [
                'name' => 'Abraham',
                'last_name' => 'Serizel',
                'password' => Hash::make('123'),
                'email_verified_at' => now(),
            ]
        );

        $this->call([
            ContactSeeder::class,
            ClientSeeder::class,
            ProjectSeeder::class,
        ]);
    }
}
