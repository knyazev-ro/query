<?php

namespace App\Http\Controllers;

use App\Jobs\CompressJob;
use App\Models\ImgMedia;
use App\Models\ModelVersion;
use App\Services\MLConnector;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CompressionController extends Controller
{
    public function index(Request $request)
    {
        $images = ImgMedia::query()
            ->with(['author', 'modelVersion.model'])
            ->where('author_id', Auth::id())
            ->latest()
            ->paginate(20);

        if ($request->has('page')) {
            return $images;
        }

        return Inertia::render('Compressions/Main', compact('images'));
    }

    public function create()
    {
        $modelVersions = ModelVersion::query()
            ->with('model')
            ->where('status', 'ready')
            ->latest()
            ->get();

        return Inertia::render('Compressions/Create', compact('modelVersions'));
    }

    public function show(ImgMedia $imgMedia)
    {
        $this->authorizeImage($imgMedia);

        $imgMedia->load(['author', 'modelVersion.model']);
        return Inertia::render('Compressions/Show', compact('imgMedia'));
    }

    public function original(ImgMedia $imgMedia)
    {
        $this->authorizeImage($imgMedia);

        abort_if($imgMedia->img_path === null || ! Storage::exists($imgMedia->img_path), 404);

        return Storage::response($imgMedia->img_path, $imgMedia->original_name);
    }

    public function compressed(ImgMedia $imgMedia)
    {
        $this->authorizeImage($imgMedia);

        abort_if($imgMedia->compressed_img_path === null || ! Storage::exists($imgMedia->compressed_img_path), 404);

        return Storage::response($imgMedia->compressed_img_path, $imgMedia->original_name);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'model_version_id' => [
                'required',
                'integer',
                Rule::exists('model_versions', 'id')->where('status', 'ready'),
            ],
            'images' => 'required|array|min:1|max:20',
            'images.*' => 'required|image|max:10240',
        ]);

        $modelVersion = ModelVersion::findOrFail($validated['model_version_id']);

        $images = collect($request->file('images'))
            ->map(fn(UploadedFile $file) => $this->storeImage($file, $modelVersion))
            ->values();

        CompressJob::dispatch(
            $modelVersion->id,
            $images->pluck('id')->all(),
        )->afterCommit();

        return $this->responseFor($request, [
            'message' => 'Images uploaded and queued for compression.',
            'data' => $images,
        ]);
    }

    public function update(Request $request, ImgMedia $imgMedia)
    {
        $this->authorizeImage($imgMedia);

        $validated = $request->validate([
            'original_name' => 'required|string|max:255',
            'model_version_id' => [
                'nullable',
                'integer',
                Rule::exists('model_versions', 'id')->where('status', 'ready'),
            ],
        ]);

        $imgMedia->update($validated);

        return $this->responseFor($request, [
            'message' => 'Image updated successfully.',
            'data' => $imgMedia->fresh(['author', 'modelVersion.model']),
        ]);
    }

    public function destroy(Request $request, ImgMedia $imgMedia)
    {
        $this->authorizeImage($imgMedia);

        $this->deleteImageFiles($imgMedia);
        $imgMedia->delete();

        return $this->responseFor($request, [
            'message' => 'Image deleted successfully.',
        ]);
    }

    public function cancel(Request $request, ModelVersion $modelVersion, MLConnector $mlConnector)
    {
        $validated = $request->validate([
            'image_ids' => 'nullable|array',
            'image_ids.*' => 'integer|exists:img_media,id',
        ]);

        $images = ImgMedia::query()
            ->where('author_id', Auth::id())
            ->where('model_version_id', $modelVersion->id)
            ->whereIn('status', ['just created', 'compressing'])
            ->when(
                array_key_exists('image_ids', $validated),
                fn($query) => $query->whereIn('id', $validated['image_ids']),
            )
            ->get();

        if ($images->isEmpty()) {
            return $this->responseFor($request, [
                'message' => 'No active compression images found.',
                'data' => [],
            ]);
        }

        $pendingImages = $images->where('status', 'just created');
        $runningImages = $images->where('status', 'compressing');

        $pendingImages->each->update([
            'status' => 'cancel',
            'errors' => '',
        ]);

        if ($runningImages->isNotEmpty()) {
            $mlConnector->cancelCompression($modelVersion, $runningImages);
        }

        return $this->responseFor($request, [
            'message' => 'Compression cancelled successfully.',
            'data' => ImgMedia::query()
                ->whereIn('id', $images->pluck('id'))
                ->get(),
        ]);
    }

    private function storeImage(UploadedFile $file, ModelVersion $modelVersion): ImgMedia
    {
        $image = ImgMedia::create([
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType() ?? 'application/octet-stream',
            'original_size' => $file->getSize() ?? 0,
            'author_id' => Auth::id(),
            'model_version_id' => $modelVersion->id,
            'status' => 'just created',
            'errors' => '',
        ]);

        $image->update([
            'img_path' => Storage::putFile("img-media/{$image->id}", $file),
        ]);

        return $image->fresh();
    }

    private function deleteImageFiles(ImgMedia $imgMedia): void
    {
        if ($imgMedia->img_path !== null) {
            Storage::delete($imgMedia->img_path);
        }

        if ($imgMedia->compressed_img_path !== null) {
            Storage::delete($imgMedia->compressed_img_path);
        }
    }

    private function authorizeImage(ImgMedia $imgMedia): void
    {
        abort_if($imgMedia->author_id !== Auth::id(), 404);
    }

    private function responseFor(Request $request, array $payload)
    {
        return Redirect::back()->with('message', $payload['message']);
    }
}
