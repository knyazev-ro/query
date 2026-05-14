<?php

namespace App\Http\Controllers;

use App\DTO\CommentaryDTO;
use App\DTO\Files;
use App\Models\Feed;
use App\Models\Project;
use App\Models\User;
use App\Services\CommentaryService;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;

class FeedController extends Controller
{
    protected static $entityModel = Project::class;


    public function __construct(protected CommentaryService $commentaryService) {}

    public function index(Request $request, int $entityId)
    {
        $perPage = $request->query('per_page', 10);
        return Feed::query()
            ->with([
                'resource' => function (MorphTo $morphTo) {
                    $morphTo->morphWith([
                        \App\Models\Commentary::class => ['fileLocations', 'master'],
                    ]);
                },
            ])
            ->where('master_id', $entityId)
            ->where('master_type', static::$entityModel)
            ->whereHas('resource', function ($query) use ($entityId) {
                return $query
                    ->where('entity_id', $entityId)
                    ->where('entity_type', static::$entityModel);
            })
            ->orderBy('updated_at', 'desc')
            ->paginate($perPage)
            ->through(function (Feed $feed) {
                if ($feed->resource instanceof \App\Models\Commentary) {
                    $feed->resource->setAttribute('can_edit', $this->canEditCommentary($feed->resource));
                }

                return $feed;
            });
    }

    public function writeCommentary(Request $request, $entityId)
    {
        $validated = $request->validate([
            'content' => 'required|array',
            'marked_notify' => 'nullable|array',
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
                })->toArray() : null,
                markedNotify: null,
            );
            $this->commentaryService->edit($commentaryId, $dto);
            return Redirect::back();
        } catch (\Exception $e) {
            return Redirect::back()->withErrors('Failed to store commentary: ' . $e->getMessage());
        }
    }

    protected function canEditCommentary(\App\Models\Commentary $commentary): bool
    {
        return $commentary->master_type === User::class
            && (int) $commentary->master_id === (int) Auth::id();
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
