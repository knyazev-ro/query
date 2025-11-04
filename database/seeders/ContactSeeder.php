<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Contact;
use App\Models\Email;
use App\Models\Phone;

class ContactSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        for ($i = 0; $i < 100; $i++) {
            $contact = Contact::create([
                'first_name' => fake()->firstName(),
                'last_name'=> fake()->lastName(),
                'position' => 'Some Guy',
            ]);
            $phones = Phone::factory()->count(2)->create();
            $emails = Email::factory()->count(2)->create();
            $contact->phones()->attach($phones->pluck('id')->toArray());
            $contact->emails()->attach($emails->pluck('id')->toArray());
        }
    }
}
