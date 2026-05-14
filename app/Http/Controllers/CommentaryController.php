<?php

namespace App\Http\Controllers;

use App\DTO\CommentaryDTO;
use App\DTO\Files;
use App\Models\Commentary;
use App\Models\Project;
use App\Models\User;
use App\Services\CommentaryService;
use Illuminate\Http\UploadedFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;

class CommentaryController extends Controller
{
    protected static $entityModel = Project::class;

    protected static $fileSection = 'commentaries';

    public function __construct(protected CommentaryService $commentaryService) {}

    public function index(Request $request, int $entityId)
    {
        $perPage = $request->query('per_page', 10);

        return Commentary::query()
            ->with(['fileLocations'])
            ->where('entity_id', $entityId)
            ->where('entity_type', static::$entityModel)
            ->paginate($perPage);
    }

    public function store(Request $request, int $entityId)
    {
        $validated = $request->validate([
            'content' => 'required|array',
            'files' => 'nullable|array',
            'files.*' => 'nullable',
            'files.*.id' => 'nullable|integer',
            'files.*.toDelete' => 'nullable|boolean',
        ]);

        try {
            $dto = new CommentaryDTO(
                entityId: $entityId,
                entityType: static::$entityModel,
                masterId: Auth::id(),
                masterType: User::class,
                content: $validated['content'],
                files: ($validated['files'] ?? null) ? collect($validated['files'])->map(function ($item) {
                    $fileDto = new Files(
                        id: $item['id'] ?? null,
                        file: ($item ?? null) instanceof UploadedFile ? $item : null,
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
