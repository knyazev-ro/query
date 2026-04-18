<?php

namespace App\Http\Controllers;

use App\DTO\CommentaryDTO;
use App\DTO\Files;
use App\Models\Feed;
use App\Models\Project;
use App\Models\User;
use App\Services\CommentaryService;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Redirect;

class FeedController extends Controller
{
    protected static $entityModel = Project::class;


    public function __construct(protected CommentaryService $commentaryService) {}

    public function index(Request $request, int $entityId)
    {
        $perPage = $request->query('per_page', 10);
        return Feed::query()
            ->with(['resource.fileLocations'])
            ->whereHas('resource', function ($query) use ($entityId) {
                return $query->where('entity_id', $entityId);
            })
            ->orderBy('updated_at', 'desc')
            ->paginate($perPage);
    }

    public function writeCommentary(Request $request, $entityId)
    {
        $validated = $request->validate([
            'content' => 'required|array',
            'master_type' => 'required|string',
            'master_id' => 'required|integer',
            'marked_notify' => 'nullable|array',
            'files' => 'nullable|array',
            'files.*.id' => 'nullable|integer',
            'files.*.toDelete' => 'nullable|boolean',
        ]);

        try {
            $dto = new CommentaryDTO(
                entityId: $entityId,
                entityType: static::$entityModel,
                masterId: $validated['master_id'] ?? null,
                masterType: $validated['master_type'] ?? null,
                content: $validated['content'],
                files: $validated['files'] ? collect($validated['files'])->map(function ($item) {
                    
                    if($item instanceof UploadedFile) {
                        return new Files(file: $item);
                    } else {
                        return new Files(
                            id: $item['id'] ?? null,
                            file:  null,
                            path: $item['path'] ?? null,
                            toDelete: $item['toDelete'] ?? false,
                        );
                    }

                })->toArray() : null,
                markedNotify: null,
            );
            $commentary = $this->commentaryService->store($dto);
            Feed::create([
                'resource_id' => $commentary->id,
                'resource_type' => $commentary::class,
                'master_id' => $entityId,
                'master_type' => static::$entityModel,
            ]);

            return Redirect::back();
        } catch (\Exception $e) {
            return Redirect::back()->withErrors('Failed to store commentary: ' . $e->getMessage());
        }
    }

        public function editCommentary(Request $request, int $entityId, int $commentaryId)
    {
        $validated = $request->validate([
            'content' => 'required|array',
            'marked_notify' => 'nullable|array',
            'files' => 'nullable|array',
            'files.*.id' => 'nullable|integer',
            'files.*.toDelete' => 'nullable|boolean',
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
                        file: ($item ?? null) instanceof UploadedFile ? $item : null,
                        path: $item['path'] ?? null,
                        toDelete: $item['toDelete'] ?? false,
                    );
                    return $fileDto;
                })->toArray() : null,
                markedNotify: null,
            );
            $this->commentaryService->edit($commentaryId, $dto);
            return Redirect::back();
        } catch (\Exception $e) {
            return Redirect::back()->withErrors('Failed to store commentary: ' . $e->getMessage());
        }
    }


    public function createEvent()
    {
        // 
    }

    public function createTask()
    {
        // 
    }

    public function attachStatistic()
    {
        // 
    }
}
