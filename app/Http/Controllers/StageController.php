<?php

namespace App\Http\Controllers;

use App\Models\Pipeline;
use App\Models\Stage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

class StageController extends Controller
{
    public function store(Request $request, Pipeline $pipeline)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'order' => 'nullable|integer|min:0',
        ]);

        $validated['pipeline_id'] = $pipeline->id;
        $validated['order'] = $validated['order']
            ?? ((int) $pipeline->stages()->max('order') + 1);

        Stage::create($validated);

        return Redirect::back();
    }

    public function update(Request $request, Stage $stage)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'order' => 'nullable|integer|min:0',
        ]);

        $stage->update($validated);

        return Redirect::back();
    }
}
