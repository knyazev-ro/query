<?php

namespace App\Http\Controllers;

use App\Models\Pipeline;
use App\Models\Stage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class PipelineController extends Controller
{
    public function kanban(int|null $pipeline_id=null)
    {
        $pipelines = Pipeline::all();
        $pipeline = null;
        if(!$pipeline_id) {
            $pipeline = Pipeline::first();
            if(!$pipeline) {
                return Redirect::route('home');
            }

        } else {
            $pipeline = Pipeline::find($pipeline_id);
        }
        $stages = Stage::query()
            ->where('pipeline_id', $pipeline->id)
            ->with(['projects.author', 'pipeline'])
            ->get();
            
        return Inertia::render('Kanban/Kanban', compact('pipelines', 'stages'));
    }
}
