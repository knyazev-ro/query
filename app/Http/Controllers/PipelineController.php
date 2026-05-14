<?php

namespace App\Http\Controllers;

use App\Models\Pipeline;
use App\Models\Stage;
use App\Models\Commentary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class PipelineController extends Controller
{
    public function kanban(?Pipeline $pipeline = null)
    {
        $pipelines = Pipeline::query()
            ->withCount('stages')
            ->orderBy('id')
            ->get();

        if(!$pipeline) {
            $pipeline = Pipeline::first();
            if(!$pipeline) {
                $pipeline = Pipeline::create(['name' => 'Sales pipeline']);
                $pipeline->stages()->createMany([
                    ['name' => 'New lead', 'order' => 1],
                    ['name' => 'Qualification', 'order' => 2],
                    ['name' => 'Proposal', 'order' => 3],
                    ['name' => 'Won', 'order' => 4],
                ]);
                $pipelines = Pipeline::query()
                    ->withCount('stages')
                    ->orderBy('id')
                    ->get();
            }
        }

        $stages = Stage::query()
            ->where('pipeline_id', $pipeline->id)
            ->with([
                'pipeline',
                'projects' => function ($query) {
                    $query
                        ->with(['author', 'client.entity'])
                        ->withCount([
                            'feedMaster as commentaries_count' => function ($query) {
                                $query->where('resource_type', Commentary::class);
                            },
                        ])
                        ->latest('updated_at');
                },
            ])
            ->orderBy('order')
            ->get();
            
        return Inertia::render('Kanban/Kanban', [
            'pipelines' => $pipelines,
            'stages' => $stages,
            'currentPipeline' => $pipeline,
        ]);
    }

    public function paginated(Request $request)
    {
        return Pipeline::query()
            ->with('stages')
            ->when($request->string('search')->toString(), function ($query, string $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy('name')
            ->paginate((int) $request->query('per_page', 10));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'deadline' => 'nullable|date',
        ]);

        $pipeline = Pipeline::create($validated);
        $pipeline->stages()->createMany([
            ['name' => 'New lead', 'order' => 1],
            ['name' => 'In progress', 'order' => 2],
            ['name' => 'Won', 'order' => 3],
        ]);

        return Redirect::route('kanban.show', $pipeline);
    }

    public function update(Request $request, Pipeline $pipeline)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'deadline' => 'nullable|date',
        ]);

        $pipeline->update($validated);

        return Redirect::back();
    }
}
