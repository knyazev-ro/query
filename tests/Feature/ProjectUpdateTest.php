<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\ClientCompany;
use App\Models\Contact;
use App\Models\Email;
use App\Models\Phone;
use App\Models\Pipeline;
use App\Models\Project;
use App\Models\Stage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_amount_and_author_update_keeps_current_stage(): void
    {
        $user = User::factory()->create();
        $newAuthor = User::factory()->create();
        $pipeline = Pipeline::create(['name' => 'Sales']);
        Stage::create(['name' => 'Lead', 'pipeline_id' => $pipeline->id, 'order' => 1]);
        $currentStage = Stage::create(['name' => 'Qualified', 'pipeline_id' => $pipeline->id, 'order' => 2]);
        $project = Project::create([
            'name' => 'Deal',
            'description' => '',
            'author_id' => $user->id,
            'stage_id' => $currentStage->id,
            'stage_changed_at' => now(),
            'amount' => 100,
        ]);

        $this->actingAs($user)
            ->post(route('projects.update', $project->id), [
                'name' => 'Deal',
                'description' => '',
                'amount' => 250,
                'author_id' => $newAuthor->id,
                'pipeline_id' => $pipeline->id,
                'stage_id' => $currentStage->id,
                'level' => 3,
            ])
            ->assertRedirect();

        $project->refresh();

        $this->assertSame($currentStage->id, $project->stage_id);
        $this->assertSame($newAuthor->id, $project->author_id);
        $this->assertSame(250.0, (float) $project->amount);
        $this->assertSame(3, $project->level);
    }

    public function test_pipeline_update_moves_project_to_first_stage_of_new_pipeline(): void
    {
        $user = User::factory()->create();
        $oldPipeline = Pipeline::create(['name' => 'Old']);
        $oldStage = Stage::create(['name' => 'Old stage', 'pipeline_id' => $oldPipeline->id, 'order' => 1]);
        $newPipeline = Pipeline::create(['name' => 'New']);
        $firstNewStage = Stage::create(['name' => 'First new', 'pipeline_id' => $newPipeline->id, 'order' => 1]);
        Stage::create(['name' => 'Second new', 'pipeline_id' => $newPipeline->id, 'order' => 2]);
        $project = Project::create([
            'name' => 'Deal',
            'description' => '',
            'author_id' => $user->id,
            'stage_id' => $oldStage->id,
            'stage_changed_at' => now(),
        ]);

        $this->actingAs($user)
            ->post(route('projects.update', $project->id), [
                'name' => 'Deal',
                'description' => '',
                'amount' => 0,
                'author_id' => $user->id,
                'pipeline_id' => $newPipeline->id,
                'stage_id' => $oldStage->id,
                'level' => 0,
            ])
            ->assertRedirect();

        $this->assertSame($firstNewStage->id, $project->fresh()->stage_id);
    }

    public function test_project_update_saves_company_and_contacts(): void
    {
        $user = User::factory()->create();
        $pipeline = Pipeline::create(['name' => 'Sales']);
        $stage = Stage::create(['name' => 'Lead', 'pipeline_id' => $pipeline->id, 'order' => 1]);
        $company = ClientCompany::create(['name' => 'Old company']);
        $client = Client::create([
            'entity_id' => $company->id,
            'entity_type' => ClientCompany::class,
        ]);
        $contact = Contact::create([
            'first_name' => 'Old',
            'last_name' => 'Contact',
            'position' => 'Manager',
        ]);
        $phone = Phone::create(['phone' => '111', 'type' => 'work']);
        $email = Email::create(['email' => 'old@example.com']);
        $contact->phones()->attach($phone);
        $contact->emails()->attach($email);
        $client->contacts()->attach($contact);
        $project = Project::create([
            'name' => 'Deal',
            'description' => '',
            'author_id' => $user->id,
            'stage_id' => $stage->id,
            'client_id' => $client->id,
            'stage_changed_at' => now(),
        ]);

        $this->actingAs($user)
            ->post(route('projects.update', $project->id), [
                'name' => 'Deal',
                'description' => '',
                'amount' => 0,
                'author_id' => $user->id,
                'pipeline_id' => $pipeline->id,
                'stage_id' => $stage->id,
                'level' => 1,
                'client' => [
                    'entity' => [
                        'name' => 'New company',
                        'legal_form' => 'LLC',
                        'website' => 'https://example.com',
                    ],
                    'contacts' => [
                        [
                            'id' => $contact->id,
                            'first_name' => 'New',
                            'last_name' => 'Contact',
                            'position' => 'Director',
                            'phones' => [
                                ['id' => $phone->id, 'phone' => '222', 'type' => 'personal'],
                            ],
                            'emails' => [
                                ['id' => $email->id, 'email' => 'new@example.com'],
                            ],
                        ],
                        [
                            'first_name' => 'Second',
                            'last_name' => 'Person',
                            'position' => 'Buyer',
                            'phones' => [
                                ['phone' => '333', 'type' => 'work'],
                            ],
                            'emails' => [
                                ['email' => 'second@example.com'],
                            ],
                        ],
                    ],
                ],
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('client_companies', [
            'id' => $company->id,
            'name' => 'New company',
            'legal_form' => 'LLC',
            'website' => 'https://example.com',
        ]);
        $this->assertDatabaseHas('contacts', [
            'id' => $contact->id,
            'first_name' => 'New',
            'position' => 'Director',
        ]);
        $this->assertDatabaseHas('phones', [
            'id' => $phone->id,
            'phone' => '222',
            'type' => 'personal',
        ]);
        $this->assertDatabaseHas('emails', [
            'id' => $email->id,
            'email' => 'new@example.com',
        ]);
        $this->assertDatabaseHas('contacts', [
            'first_name' => 'Second',
            'last_name' => 'Person',
            'position' => 'Buyer',
        ]);
        $this->assertSame(2, $client->contacts()->count());
    }
}
