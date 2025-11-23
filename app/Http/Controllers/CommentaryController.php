<?php

namespace App\Http\Controllers;

use App\DTO\CommentaryDTO;
use App\DTO\Files;
use App\Models\Commentary;
use App\Models\Project;
use App\Services\CommentaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

class CommentaryController extends Controller
{
    protected static $entityModel = Project::class;

    protected static $FileSection = 'commentaries';

    public function __construct(protected CommentaryService $commentaryService) {}

    public function index(Request $request, int $entityId)
    {
        $perPage = $request->query('per_page', 10);

        return Commentary::query()
            ->where('entity_id', $entityId)
            ->where('entity_type', static::$entityModel)
            ->paginate($perPage);
    }

    public function store(Request $request, int $entityId)
    {
        $validated = $request->validate([
            'content' => 'required|string',
            'master_type' => 'nullable|string',
            'master_id' => 'nullable|integer',
            'files' => 'nullable|array',
            'files.*.id' => 'nullable|integer',
            'files.*.file' => 'nullable|file',
            'files.*.toDelete' => 'required|boolean',
        ]);

        try {
            $dto = new CommentaryDTO(
                entityId: $entityId,
                entityType: static::$entityModel,
                masterId: $validated['master_id'] ?? null,
                masterType: $validated['master_type'] ?? null,
                content: $validated['content'],
                files: $validated['files'] ? collect($validated['files'])->map(function ($item) {
                    $fileDto = new Files(
                        id: $item['id'] ?? null,
                        file: $item['file'] ?? null,
                        path: $item['path'] ?? null,
                        toDelete: $item['toDelete'] ?? false,
                    );
                    return $fileDto;
                }) : null,

            );
            $this->commentaryService->store($dto);
            return Redirect::back();
        } catch (\Exception $e) {
            return Redirect::back()->withErrors('Failed to store commentary: ' . $e->getMessage());
        }
    }
}
