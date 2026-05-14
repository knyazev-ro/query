<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Pipeline;
use App\Models\Project;
use App\Models\Stage;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        $pipelinePresets = [
            'Enterprise sales' => [
                'Inbound lead',
                'Discovery',
                'Demo',
                'Legal review',
                'Closed won',
            ],
            'Implementation' => [
                'Kickoff',
                'Data import',
                'Integration',
                'Training',
                'Go live',
            ],
            'Partner channel' => [
                'New partner',
                'Enablement',
                'First deal',
                'Co-marketing',
                'Active',
            ],
        ];

        $projectNames = [
            'Northwind CRM rollout',
            'Acme analytics cockpit',
            'Retail image archive',
            'Factory workflow upgrade',
            'Partner portal launch',
            'Customer success automation',
            'Contract renewal sprint',
            'Regional onboarding wave',
        ];

        foreach ($pipelinePresets as $pipelineName => $stageNames) {
            $pipeline = Pipeline::create([
                'name' => $pipelineName,
                'deadline' => now()->addDays(fake()->numberBetween(14, 90)),
            ]);

            foreach ($stageNames as $order => $stageName) {
                $stage = Stage::create([
                    'name' => $stageName,
                    'pipeline_id' => $pipeline->id,
                    'order' => $order + 1,
                ]);

                for ($i = 0; $i < 4; $i++) {
                    $baseName = fake()->randomElement($projectNames);
                    $amount = fake()->numberBetween(25, 450) * 1000;

                    Project::create([
                        'name' => "{$baseName} #".fake()->unique()->numberBetween(100, 999),
                        'description' => fake()->randomElement([
                            'High-value deal with several stakeholders and a clear next action.',
                            'Needs careful follow-up: budget is approved, timeline is still moving.',
                            'Warm opportunity from an existing account, good expansion potential.',
                            'Technical validation in progress, keep an eye on integration risks.',
                        ]),
                        'author_id' => User::inRandomOrder()->value('id') ?? 1,
                        'stage_id' => $stage->id,
                        'stage_changed_at' => Carbon::now()->subDays(fake()->numberBetween(1, 60)),
                        'level' => fake()->numberBetween(1, 5),
                        'amount' => $amount,
                        'client_id' => Client::inRandomOrder()->value('id'),
                        'created_at' => Carbon::now()->subDays(fake()->numberBetween(2, 90)),
                        'updated_at' => Carbon::now()->subDays(fake()->numberBetween(0, 14)),
                    ]);
                }
            }
        }
    }
}
