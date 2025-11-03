<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pipeline;
use App\Models\Stage;
use App\Models\Project;
use App\Models\User;
use Carbon\Carbon;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        // Создаём несколько пайплайнов
        $pipelines = [
            'Web Development',
            'Mobile Apps',
            'Data Science',
        ];

        foreach ($pipelines as $pipelineName) {
            $pipeline = Pipeline::create([
                'name' => $pipelineName,
            ]);

            // Добавляем стадии для каждого пайплайна
            $stages = [
                ['name' => 'Planning', 'order' => 1],
                ['name' => 'Development', 'order' => 2],
                ['name' => 'Testing', 'order' => 3],
                ['name' => 'Deployment', 'order' => 4],
            ];

            foreach ($stages as $stageData) {
                $stage = Stage::create([
                    'name' => $stageData['name'],
                    'pipeline_id' => $pipeline->id,
                    'order' => $stageData['order'],
                ]);

                // Создаём несколько проектов для стадии
                for ($i = 1; $i <= 3; $i++) {
                    Project::create([
                        'name' => "{$pipelineName} Project {$i} ({$stageData['name']})",
                        'description' => "Описание проекта {$i} на стадии {$stageData['name']}.",
                        'author_id' => User::inRandomOrder()->value('id') ?? 1, // случайный пользователь или 1
                        'stage_id' => $stage->id,
                        'stage_changed_at' => Carbon::now()->subDays(rand(1, 60)),
                    ]);
                }
            }
        }
    }
}
