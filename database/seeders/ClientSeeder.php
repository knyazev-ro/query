<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\ClientCompany;
use App\Models\ClientPerson;
use App\Models\Contact;
use App\Models\Email;
use App\Models\Phone;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        for ($i = 0; $i < 100; $i++) {

            $currClient = null;
            $variant = fake()->boolean();
            if ($variant) {
                $currClient = ClientPerson::create([
                    'first_name' => fake()->firstName(),
                    'last_name' => fake()->lastName(),
                    'birth_date' => fake()->date(),
                    'passport_number' => (string) fake()->numberBetween(1,100),
                    'inn' => (string) fake()->numberBetween(1,100),
                ]);
            } else {
                $currClient = ClientCompany::create([
                    'name' => fake()->company(),
                    'legal_form' => fake()->companySuffix(),
                    'industry' => 'IT',
                    'website' => fake()->url(),
                    'inn' => (string) fake()->numberBetween(1,100),
                    'kpp' => (string) fake()->numberBetween(1,100),
                    'ogrn' => (string) fake()->numberBetween(1,100),
                    'director_name' => fake()->firstName() . ' ' . fake()->lastName(),
                    'source' => 'Telegram',
                    'notes' => 'fake.',
                ]);
            }

            $client  = Client::create([
                'entity_id' => $currClient->id,
                'entity_type' => $currClient::class
            ]);
            $contactsId = Contact::query()->inRandomOrder()->take(2)->pluck('id')->toArray();
            $client->contacts()->attach($contactsId);
        }
    }
}
