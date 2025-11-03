<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Stage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

class ProjectController extends Controller
{
    public function __construct() {}

    public function drop(Project $project, Stage $stage)
    {
        $project->stage_id = $stage->id;
        $project->stage_changed_at = now();
        $project->save();
        return Redirect::back();
    }

    public function show(Project $project)
    {
        $pipelineId = $project->stage->pipeline_id;
        $stages = Stage::query()
            ->where('pipeline_id', $pipelineId)
            ->orderBy('order', 'asc')
            ->get();
        $project->load(['stage.pipeline', 'author']);

        return Inertia::render('Projects/Project', compact(
            'project',
            'stages',
        ));
    }

    public function index(Request $request)
    {
        if ($request->has("page")) {
            $projects = Project::with([
                'stage',
                'author',
            ])->paginate(10);
            return $projects;
        }
        return Inertia::render('Projects/Index');
    }

    public function create(Stage $stage)
    {
        $project = Project::create([
            'name' => 'New project',
            'description' => '',
            'author_id' => Auth::id(),
            'stage_id' => $stage->id,
            'stage_changed_at' => now(),
        ]);
        return Redirect::route('projects.show', $project->id);
    }

    public function update(Request $request, int|null $id = null)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'author_id' => 'nullable|integer',
            'pipeline_id' => 'required|integer',
            'stage_id' => 'required|integer',
        ]);

        $project = Project::updateOrCreate([
            'id' => $id,
        ], $validated);

        return Redirect::back()->with('message', 'Success!');
    }

    public function destroy(Project $project)
    {
        $project->delete();
        return Redirect::back();
    }

    public function getlogs(Project $project)
    {
        $log = Activity::query()
            ->where('subject_type', Project::class)
            ->where('subject_id', $project->id);
        return $log->paginate(10)->through(function ($e) {
            $exp = explode('\\', $e->subject_type);
            $e->subject_type = $exp[count($exp) - 1] ?? null;
            return $e;
        });
    }
}
