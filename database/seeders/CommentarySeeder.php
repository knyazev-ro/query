<?php

namespace Database\Seeders;

use App\Models\Commentary;
use App\Models\Feed;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class CommentarySeeder extends Seeder
{
    public function run(): void
    {
        $phrases = [
            'Called the client. They confirmed the budget and asked for a short proposal by Friday.',
            'Demo went well. Main concern is migration timing, but the sponsor is positive.',
            'Legal wants one more pass on data processing terms before we move to signature.',
            'Shared the implementation checklist and booked a follow-up with the technical team.',
            'Customer asked for a comparison with the current workflow. Added notes for the next meeting.',
        ];

        Project::query()
            ->with('author')
            ->latest()
            ->take(36)
            ->get()
            ->each(function (Project $project) use ($phrases) {
                for ($i = 0; $i < fake()->numberBetween(2, 4); $i++) {
                    $user = User::inRandomOrder()->first() ?? $project->author;
                    $commentary = Commentary::create([
                        'entity_id' => $project->id,
                        'entity_type' => Project::class,
                        'master_id' => $user->id,
                        'master_type' => User::class,
                        'content' => [
                            'ops' => [
                                ['insert' => fake()->randomElement($phrases)],
                                ['insert' => "\n"],
                            ],
                        ],
                        'created_at' => now()->subHours(fake()->numberBetween(1, 240)),
                        'updated_at' => now()->subHours(fake()->numberBetween(0, 120)),
                    ]);

                    Feed::create([
                        'resource_id' => $commentary->id,
                        'resource_type' => Commentary::class,
                        'master_id' => $project->id,
                        'master_type' => Project::class,
                        'created_at' => $commentary->created_at,
                        'updated_at' => $commentary->updated_at,
                    ]);
                }
            });
    }
}
